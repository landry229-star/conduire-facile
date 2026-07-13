import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  X,
  ChevronRight,
  Clock,
  Award,
  Printer,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { recordExamAttempt } from "@/lib/progress-sync";

import {
  SignShape,
  VirageDroiteIcon,
  PassageNiveauIcon,
  ChausseeGlissanteIcon,
  SensInterditIcon,
  StationnementInterditIcon,
  Vitesse50Icon,
  Vitesse30Icon,
  TournerDroiteIcon,
  HospitalIcon,
  ParkingIcon,
} from "@/components/TrafficSign";
import type { SignData } from "@/components/TrafficSign";

export const Route = createFileRoute("/examen")({
  head: () => ({
    meta: [
      { title: "Session d'examen blanc — L'Excellence Auto-École" },
      {
        name: "description",
        content:
          "Passez un examen blanc chronométré du code de la route et obtenez une attestation de réussite (non officielle).",
      },
      {
        property: "og:title",
        content: "Examen blanc — L'Excellence Auto-École",
      },
      {
        property: "og:description",
        content:
          "Évaluez votre niveau avec un examen blanc chronométré et recevez une attestation à imprimer.",
      },
    ],
  }),
  component: ExamenPage,
});

export type SkillKey =
  | "panneaux"
  | "priorites"
  | "vitesse"
  | "securite"
  | "conduite"
  | "usagers"
  | "specifique";

export const SKILL_LABELS: Record<SkillKey, string> = {
  panneaux: "Signalisation & panneaux",
  priorites: "Priorités & intersections",
  vitesse: "Limitations de vitesse",
  securite: "Équipement de sécurité",
  conduite: "Conduite & état du conducteur",
  usagers: "Piétons & usagers vulnérables",
  specifique: "Spécificités de la catégorie",
};

export const CATEGORIES = [
  { code: "AM", label: "AM — Cyclomoteur" },
  { code: "A1", label: "A1 — Moto légère" },
  { code: "A", label: "A — Moto" },
  { code: "B", label: "B — Voiture" },
  { code: "BE", label: "BE — Voiture + remorque" },
  { code: "C", label: "C — Poids lourd" },
  { code: "D", label: "D — Transport en commun" },
  { code: "T", label: "T — Agricole" },
] as const;

export type CategoryCode = (typeof CATEGORIES)[number]["code"];

type Question = {
  prompt: string;
  sign?: { data: SignData; icon: React.ReactNode };
  options: string[];
  answer: number;
  explain: string;
  skill: SkillKey;
  // Categories this question applies to. undefined = all categories.
  categories?: CategoryCode[];
};

const BANK: Question[] = [
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "stop", label: "", desc: "" }, icon: null },
    options: ["Ralentir", "Arrêt complet obligatoire", "Priorité", "Stationnement"],
    answer: 1,
    explain: "STOP impose un arrêt complet avant de céder le passage.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "interdiction", label: "", desc: "" }, icon: <Vitesse50Icon /> },
    options: ["Vitesse minimale 50 km/h", "Vitesse conseillée", "Vitesse maximale 50 km/h", "Fin de limitation"],
    answer: 2,
    explain: "Cercle rouge = interdiction de dépasser 50 km/h.",
    skill: "vitesse",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "interdiction", label: "", desc: "" }, icon: <SensInterditIcon /> },
    options: ["Voie bus", "Sens interdit", "Route barrée", "Stationnement"],
    answer: 1,
    explain: "Sens interdit à tous les véhicules.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "danger", label: "", desc: "" }, icon: <VirageDroiteIcon /> },
    options: ["Tournez à droite", "Virage dangereux à droite", "Sens interdit", "Sortie"],
    answer: 1,
    explain: "Triangle rouge = danger : virage serré à droite.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "obligation", label: "", desc: "" }, icon: <TournerDroiteIcon /> },
    options: ["Virage interdit", "Obligation de tourner à droite", "Direction conseillée", "Sortie"],
    answer: 1,
    explain: "Cercle bleu = obligation : tourner à droite.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "danger", label: "", desc: "" }, icon: <PassageNiveauIcon /> },
    options: ["Pont", "Tramway", "Passage à niveau", "Travaux"],
    answer: 2,
    explain: "Passage à niveau : soyez prêt à céder le passage au train.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "danger", label: "", desc: "" }, icon: <ChausseeGlissanteIcon /> },
    options: ["Travaux", "Chaussée glissante", "Virages", "Dos d'âne"],
    answer: 1,
    explain: "Chaussée glissante : risque de perte d'adhérence.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "interdiction", label: "", desc: "" }, icon: <StationnementInterditIcon /> },
    options: ["Parking gratuit", "Réservé", "Stationnement interdit", "Parking"],
    answer: 2,
    explain: "Stationnement interdit : arrêt bref toléré, stationnement non.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "indication", label: "", desc: "" }, icon: <HospitalIcon /> },
    options: ["Pharmacie", "Hôpital", "Centre commercial", "Aire de repos"],
    answer: 1,
    explain: "Hôpital à proximité : évitez de klaxonner.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "indication", label: "", desc: "" }, icon: <ParkingIcon /> },
    options: ["Interdit", "Parking autorisé", "Péage", "Police"],
    answer: 1,
    explain: "Zone de stationnement autorisée.",
    skill: "panneaux",
  },
  {
    prompt: "Que signifie ce panneau ?",
    sign: { data: { type: "interdiction", label: "", desc: "" }, icon: <Vitesse30Icon /> },
    options: ["Min 30 km/h", "Max 30 km/h", "Fin de 30", "Conseillé"],
    answer: 1,
    explain: "Zone limitée à 30 km/h.",
    skill: "vitesse",
  },
  {
    prompt: "À une intersection sans signalisation, qui a la priorité au Bénin ?",
    options: [
      "Le véhicule le plus rapide",
      "Le véhicule venant de la droite",
      "Le véhicule venant de la gauche",
      "Le plus grand véhicule",
    ],
    answer: 1,
    explain: "La règle de la priorité à droite s'applique en l'absence de signalisation.",
    skill: "priorites",
  },
  {
    prompt: "Quel est le taux d'alcoolémie maximal autorisé pour un conducteur ?",
    options: ["0,2 g/L", "0,5 g/L", "0,8 g/L", "1,0 g/L"],
    answer: 1,
    explain: "Au Bénin, la limite légale est de 0,5 g/L de sang.",
    skill: "conduite",
  },
  {
    prompt: "Que devez-vous faire à l'approche d'un passage piéton ?",
    options: ["Accélérer", "Klaxonner", "Ralentir et céder le passage aux piétons", "Continuer normalement"],
    answer: 2,
    explain: "Le piéton engagé ou s'engageant a toujours la priorité.",
    skill: "usagers",
  },
  {
    prompt: "À quoi sert la ceinture de sécurité ?",
    options: [
      "Au confort uniquement",
      "À retenir le corps en cas de choc",
      "À éviter les amendes",
      "Seulement à l'avant",
    ],
    answer: 1,
    explain: "La ceinture est obligatoire à toutes les places et sauve des vies.",
    skill: "securite",
    categories: ["B", "BE", "C", "D", "T"],
  },
  {
    prompt: "Quelle distance de sécurité respecter derrière un véhicule à 90 km/h ?",
    options: ["Environ 10 m", "Environ 25 m", "Environ 50 m", "Environ 100 m"],
    answer: 2,
    explain: "À 90 km/h, prévoir au moins 50 m (règle des 2 secondes minimum).",
    skill: "conduite",
  },
  {
    prompt: "Que signifie une ligne continue blanche au sol ?",
    options: ["Dépassement autorisé", "Interdiction de franchir ou dépasser", "Voie réservée", "Stationnement"],
    answer: 1,
    explain: "La ligne continue ne doit jamais être franchie.",
    skill: "conduite",
  },
  {
    prompt: "Quand devez-vous allumer vos feux de croisement ?",
    options: [
      "Uniquement la nuit",
      "La nuit et par mauvaise visibilité (pluie, brouillard)",
      "Jamais en ville",
      "Seulement sur autoroute",
    ],
    answer: 1,
    explain: "Obligatoires de nuit et dès que la visibilité est réduite.",
    skill: "conduite",
  },
  {
    prompt: "À l'approche d'un véhicule prioritaire sirène allumée, vous devez :",
    options: [
      "Accélérer pour dégager",
      "Vous serrer à droite et le laisser passer",
      "Vous arrêter au milieu de la route",
      "L'ignorer",
    ],
    answer: 1,
    explain: "Cédez le passage en vous rangeant sur la droite, sans manœuvre dangereuse.",
    skill: "usagers",
  },
  {
    prompt: "Un casque homologué est obligatoire pour :",
    options: [
      "Seulement les conducteurs de moto",
      "Conducteur et passager de tout deux-roues motorisé",
      "Uniquement la nuit",
      "Aucun cas",
    ],
    answer: 1,
    explain: "Obligatoire pour le conducteur ET le passager d'un deux-roues motorisé.",
    skill: "securite",
    categories: ["AM", "A1", "A"],
  },
  // --- Moto (AM, A1, A) ---
  {
    prompt: "En moto, la position idéale sur la chaussée en ligne droite est :",
    options: [
      "Au milieu de la voie",
      "Sur la ligne médiane",
      "Dans le tiers gauche de la voie pour être vu",
      "Sur le bas-côté",
    ],
    answer: 2,
    explain: "Se positionner dans le tiers gauche améliore la visibilité et anticipe les dangers.",
    skill: "specifique",
    categories: ["AM", "A1", "A"],
  },
  {
    prompt: "En moto, un freinage d'urgence efficace se fait :",
    options: [
      "Uniquement avec le frein arrière",
      "Uniquement avec le frein avant",
      "Avec les deux freins, avant en priorité (~70%)",
      "En débrayant seulement",
    ],
    answer: 2,
    explain: "Le frein avant fournit l'essentiel de la puissance de freinage à moto.",
    skill: "specifique",
    categories: ["AM", "A1", "A"],
  },
  {
    prompt: "L'équipement obligatoire du motard comprend :",
    options: [
      "Casque uniquement",
      "Casque et gants homologués",
      "Casque, gants, veste renforcée",
      "Rien de spécial",
    ],
    answer: 1,
    explain: "Casque + gants homologués sont exigés ; le reste est vivement recommandé.",
    skill: "specifique",
    categories: ["AM", "A1", "A"],
  },
  // --- Voiture (B, BE) ---
  {
    prompt: "En voiture, avant de démarrer vous devez d'abord :",
    options: [
      "Boucler votre ceinture et régler rétroviseurs et siège",
      "Allumer la radio",
      "Enclencher la 2e",
      "Démarrer immédiatement",
    ],
    answer: 0,
    explain: "Réglages puis ceinture avant tout démarrage.",
    skill: "specifique",
    categories: ["B", "BE"],
  },
  {
    prompt: "Sur autoroute, la vitesse maximale voiture au Bénin est généralement :",
    options: ["90 km/h", "110 km/h", "120 km/h", "130 km/h"],
    answer: 2,
    explain: "120 km/h sur autoroute (110 km/h par temps de pluie).",
    skill: "specifique",
    categories: ["B", "BE"],
  },
  {
    prompt: "Un créneau réussi commence par :",
    options: [
      "Se coller à la voiture de devant",
      "Se mettre parallèle à la voiture de devant avec 50 cm d'écart",
      "Braquer immédiatement",
      "Reculer sans regarder",
    ],
    answer: 1,
    explain: "Position parallèle à ~50 cm avant de tourner le volant.",
    skill: "specifique",
    categories: ["B", "BE"],
  },
  // --- Poids lourd (C) ---
  {
    prompt: "Pour un poids lourd, le temps de pause obligatoire après 4h30 de conduite est de :",
    options: ["15 min", "30 min", "45 min", "1 h"],
    answer: 2,
    explain: "45 minutes de pause, fractionnables en 15 + 30 min.",
    skill: "specifique",
    categories: ["C"],
  },
  {
    prompt: "L'angle mort d'un poids lourd se situe surtout :",
    options: [
      "Uniquement derrière",
      "Devant, à droite et à l'arrière",
      "Uniquement à gauche",
      "Nulle part",
    ],
    answer: 1,
    explain: "Angles morts très étendus : devant, à droite et à l'arrière du camion.",
    skill: "specifique",
    categories: ["C", "D"],
  },
  // --- Transport en commun (D) ---
  {
    prompt: "Un conducteur de transport en commun doit vérifier avant chaque service :",
    options: [
      "Uniquement le carburant",
      "État général du véhicule, freins, éclairage, portes",
      "Uniquement les billets",
      "Rien",
    ],
    answer: 1,
    explain: "Contrôle complet obligatoire avant la mise en service.",
    skill: "specifique",
    categories: ["D"],
  },
  // --- Agricole (T) ---
  {
    prompt: "Un tracteur agricole sur la route doit :",
    options: [
      "Rouler au milieu",
      "Se serrer à droite et faciliter les dépassements",
      "Bloquer la circulation",
      "Rouler sans signalisation",
    ],
    answer: 1,
    explain: "Serrer à droite et faciliter le passage des véhicules plus rapides.",
    skill: "specifique",
    categories: ["T"],
  },
];

const EXAM_SIZE = 20;
const DURATION_SECONDS = 25 * 60;
const PASS_RATIO = 0.8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(cat: CategoryCode): Question[] {
  const eligible = BANK.filter((q) => !q.categories || q.categories.includes(cat));
  return shuffle(eligible)
    .slice(0, Math.min(EXAM_SIZE, eligible.length))
    .map((q) => {
      const idx = shuffle(q.options.map((_, i) => i));
      return {
        ...q,
        options: idx.map((i) => q.options[i]),
        answer: idx.indexOf(q.answer),
      };
    });
}


function genCertificateCode() {
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  const y = new Date().getFullYear();
  return `EX-${y}-${r}`;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

type Phase = "intro" | "exam" | "result" | "certificate";

function ExamenPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [deck, setDeck] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(DURATION_SECONDS);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryCode>("B");
  const [code, setCode] = useState("");
  const [issuedAt, setIssuedAt] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function start() {
    const d = buildDeck(category);

    setDeck(d);
    setAnswers(Array(d.length).fill(null));
    setCurrent(0);
    setSelected(null);
    setRemaining(DURATION_SECONDS);
    setPhase("exam");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase("result");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function submitAnswer() {
    if (selected === null) return;
    const next = [...answers];
    next[current] = selected;
    setAnswers(next);
    if (current === deck.length - 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  const score = useMemo(
    () => answers.filter((a, i) => a !== null && a === deck[i]?.answer).length,
    [answers, deck],
  );
  const passed = phase !== "exam" && deck.length > 0 && score / deck.length >= PASS_RATIO;

  const skillsBreakdown = useMemo(() => {
    const acc: Record<string, { correct: number; total: number }> = {};
    deck.forEach((qq, i) => {
      const key = qq.skill;
      if (!acc[key]) acc[key] = { correct: 0, total: 0 };
      acc[key].total += 1;
      if (answers[i] === qq.answer) acc[key].correct += 1;
    });
    return acc;
  }, [deck, answers]);

  const recordedRef = useRef(false);
  useEffect(() => {
    if (phase === "result" && !recordedRef.current && deck.length > 0) {
      recordedRef.current = true;
      void recordExamAttempt(category, score, deck.length, passed, null, skillsBreakdown);
    }
    if (phase === "intro") recordedRef.current = false;
  }, [phase, score, deck.length, passed, category, skillsBreakdown]);



  function issueCertificate() {
    if (!name.trim()) return;
    setCode(genCertificateCode());
    setIssuedAt(
      new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
    setPhase("certificate");
  }

  function resetAll() {
    setPhase("intro");
    setDeck([]);
    setAnswers([]);
    setCurrent(0);
    setSelected(null);
    setName("");
    setCode("");
  }

  const q = deck[current];

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md print:hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-sm bg-benin-green">
            <span className="block size-2 rounded-full bg-benin-yellow" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-tight">
            L'Excellence
          </span>
        </Link>
        {phase === "exam" ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-benin-red/10 px-3 py-1.5 text-xs font-semibold text-benin-red ring-1 ring-benin-red/30">
            <Clock className="size-3.5" /> {formatTime(remaining)}
          </div>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-charcoal/10 hover:bg-white"
          >
            <ArrowLeft className="size-3" /> Accueil
          </Link>
        )}
      </nav>

      {phase === "intro" && (
        <main className="px-5 py-10 print:hidden">
          <div className="mx-auto max-w-2xl">
            <span className="mb-4 inline-block rounded-sm bg-benin-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-benin-green">
              Examen blanc
            </span>
            <h1 className="mb-3 text-balance text-3xl font-semibold leading-tight md:text-4xl">
              Session d'examen blanc du code
            </h1>
            <p className="mb-6 text-pretty text-charcoal/70">
              Évaluez votre niveau dans des conditions proches de l'épreuve
              officielle. Si vous réussissez, une attestation imprimable vous
              est délivrée.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <p className="text-[11px] uppercase text-charcoal/50">Questions</p>
                <p className="mt-1 text-2xl font-semibold">{EXAM_SIZE}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <p className="text-[11px] uppercase text-charcoal/50">Durée</p>
                <p className="mt-1 text-2xl font-semibold">25 min</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <p className="text-[11px] uppercase text-charcoal/50">Réussite</p>
                <p className="mt-1 text-2xl font-semibold">≥ 80%</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Catégorie de permis évaluée
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryCode)}
                className="mt-2 w-full rounded-md bg-white px-3 py-2 text-sm ring-1 ring-charcoal/15 focus:outline-none focus:ring-benin-green"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-charcoal/60">
                Les questions et l'attestation seront adaptées à cette catégorie.
              </p>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-benin-yellow/15 p-4 text-sm text-charcoal/80 ring-1 ring-benin-yellow/40">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-benin-red" />
              <p>
                <strong>Attestation non officielle.</strong> Le certificat
                délivré n'a aucune valeur légale et ne remplace pas l'examen
                officiel du permis de conduire. Il atteste uniquement de votre
                réussite à notre examen d'entraînement.
              </p>
            </div>


            <div className="mt-6">
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2 rounded-md bg-benin-green px-6 py-3 text-sm font-semibold text-white"
              >
                Commencer l'examen
              </button>
            </div>
          </div>
        </main>
      )}

      {phase === "exam" && q && (
        <main className="px-5 py-8 print:hidden">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between text-xs text-charcoal/60">
              <span>
                Question {current + 1} / {deck.length}
              </span>
              <div className="mx-4 h-1 flex-1 overflow-hidden rounded-full bg-charcoal/10">
                <div
                  className="h-full bg-benin-green transition-all"
                  style={{ width: `${((current + 1) / deck.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
              {q.sign && (
                <div className="mb-5 flex justify-center">
                  <div className="size-28">
                    <SignShape type={q.sign.data.type} icon={q.sign.icon} />
                  </div>
                </div>
              )}
              <p className="mb-5 text-center text-base font-medium">
                {q.prompt}
              </p>

              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelected(i)}
                      className={`w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm ring-1 transition-colors ${
                        isSelected
                          ? "bg-benin-green/5 ring-benin-green"
                          : "ring-charcoal/10 hover:bg-zinc-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={selected === null}
                  className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                >
                  {current === deck.length - 1 ? "Terminer" : "Suivant"}
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {phase === "result" && (
        <main className="px-5 py-10 print:hidden">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-wider text-benin-green">
                Résultat
              </p>
              <p className="mt-3 text-5xl font-semibold">
                {score}
                <span className="text-charcoal/40"> / {deck.length}</span>
              </p>
              <p className="mt-2 text-sm text-charcoal/60">
                Soit {Math.round((score / deck.length) * 100)}% — seuil de
                réussite : 80%
              </p>

              {passed ? (
                <>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-benin-green/10 px-4 py-2 text-sm font-semibold text-benin-green ring-1 ring-benin-green/30">
                    <Award className="size-4" /> Examen réussi
                  </div>
                  <div className="mt-6 text-left">
                    <label className="block text-xs font-medium text-charcoal/70">
                      Nom complet (sur l'attestation)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex. Afiwa KOUASSI"
                      className="mt-1 w-full rounded-md bg-white px-3 py-2 text-sm ring-1 ring-charcoal/15 focus:outline-none focus:ring-benin-green"
                    />
                    <p className="mt-3 text-xs text-charcoal/70">
                      Catégorie évaluée :{" "}
                      <span className="font-semibold text-charcoal">
                        {CATEGORIES.find((c) => c.code === category)?.label ?? category}
                      </span>
                    </p>

                    <button
                      type="button"
                      onClick={issueCertificate}
                      disabled={!name.trim()}
                      className="mt-4 inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      <Award className="size-4" /> Générer mon attestation
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-benin-red/10 px-4 py-2 text-sm font-semibold text-benin-red ring-1 ring-benin-red/30">
                    <X className="size-4" /> Examen non validé
                  </div>
                  <p className="mt-4 text-sm text-charcoal/70">
                    Continuez vos révisions avec nos leçons théoriques et nos
                    quiz, puis retentez l'examen.
                  </p>
                </>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium ring-1 ring-charcoal/15"
                >
                  <RotateCcw className="size-4" /> Repasser l'examen
                </button>
                <Link
                  to="/theorie"
                  className="inline-flex items-center gap-2 rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-white"
                >
                  Réviser la théorie
                </Link>
              </div>

              {/* Grille de compétences */}
              <div className="mt-10 text-left">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-charcoal/60">
                  Grille de compétences
                </h3>
                <div className="space-y-2">
                  {Object.entries(skillsBreakdown).map(([key, s]) => {
                    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                    const color =
                      pct >= 80
                        ? "bg-benin-green"
                        : pct >= 50
                        ? "bg-benin-yellow"
                        : "bg-benin-red";
                    return (
                      <div key={key} className="rounded-lg bg-zinc-50 p-3 ring-1 ring-charcoal/5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{SKILL_LABELS[key as SkillKey] ?? key}</span>
                          <span className="tabular-nums text-charcoal/70">
                            {s.correct}/{s.total} · {pct}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-charcoal/10">
                          <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-charcoal/50">
                  Concentrez vos révisions sur les compétences en dessous de 80%.
                </p>
              </div>

              {/* Review */}
              <div className="mt-10 text-left">

                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-charcoal/60">
                  Correction
                </h3>
                <ol className="space-y-3">
                  {deck.map((qq, i) => {
                    const ok = answers[i] === qq.answer;
                    return (
                      <li
                        key={i}
                        className="rounded-lg bg-zinc-50 p-3 text-sm ring-1 ring-charcoal/5"
                      >
                        <div className="flex items-start gap-2">
                          {ok ? (
                            <Check className="mt-0.5 size-4 shrink-0 text-benin-green" />
                          ) : (
                            <X className="mt-0.5 size-4 shrink-0 text-benin-red" />
                          )}
                          <div>
                            <p className="font-medium">
                              {i + 1}. {qq.prompt}
                            </p>
                            <p className="mt-1 text-charcoal/70">
                              Bonne réponse : <em>{qq.options[qq.answer]}</em>
                            </p>
                            <p className="mt-1 text-charcoal/60">{qq.explain}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </main>
      )}

      {phase === "certificate" && (
        <main className="px-5 py-10">
          <div className="mx-auto max-w-3xl print:max-w-none">
            <div className="mb-4 flex flex-wrap justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Printer className="size-4" /> Imprimer / PDF
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium ring-1 ring-charcoal/15"
              >
                <RotateCcw className="size-4" /> Nouvel examen
              </button>
            </div>

            <article
              id="certificate"
              className="relative overflow-hidden rounded-2xl border-[6px] border-double border-benin-green bg-white p-10 shadow-sm print:rounded-none print:shadow-none"
            >
              <div className="absolute right-6 top-6 flex gap-1">
                <span className="h-6 w-3 bg-benin-green" />
                <span className="h-6 w-3 bg-benin-yellow" />
                <span className="h-6 w-3 bg-benin-red" />
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-charcoal/60">
                  L'Excellence Auto-École · République du Bénin
                </p>
                <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
                  Attestation de réussite
                </h2>
                <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/50">
                  Examen blanc du code de la route
                </p>

                <div className="mx-auto mt-8 max-w-xl text-sm text-charcoal/80">
                  <p>Le présent document atteste que</p>
                  <p className="mt-3 text-2xl font-semibold text-charcoal">
                    {name}
                  </p>
                  <p className="mt-3">
                    a passé avec succès la session d'examen blanc du code de la
                    route, catégorie{" "}
                    <span className="font-semibold">{category}</span>, avec un
                    score de{" "}
                    <span className="font-semibold">
                      {score} / {deck.length}
                    </span>{" "}
                    ({Math.round((score / deck.length) * 100)}%).
                  </p>
                </div>

                <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-6 text-left text-xs text-charcoal/70">
                  <div>
                    <p className="uppercase tracking-wider text-charcoal/50">
                      Délivré le
                    </p>
                    <p className="mt-1 text-sm font-medium text-charcoal">
                      {issuedAt}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-charcoal/50">
                      N° d'attestation
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium text-charcoal">
                      {code}
                    </p>
                  </div>
                </div>

                <div className="mx-auto mt-10 flex max-w-xl items-end justify-between">
                  <div className="text-left">
                    <div className="h-12 w-40 border-b border-charcoal/40" />
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-charcoal/50">
                      Signature de l'élève
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="ml-auto flex h-12 w-40 items-end justify-center border-b border-charcoal/40 font-[cursive] text-base italic text-benin-green">
                      L'Excellence
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-charcoal/50">
                      Cachet & direction
                    </p>
                  </div>
                </div>

                <p className="mt-10 border-t border-charcoal/10 pt-4 text-[10px] uppercase tracking-wider text-benin-red">
                  Document non officiel — sans valeur légale. Ne remplace pas
                  l'examen officiel du permis de conduire.
                </p>
              </div>
            </article>
          </div>
        </main>
      )}

      <footer className="border-t border-charcoal/5 bg-zinc-50 px-5 py-10 print:hidden">
        <p className="text-[11px] leading-relaxed text-charcoal/50">
          © {new Date().getFullYear()} L'Excellence Auto-École.
        </p>
      </footer>
    </div>
  );
}
