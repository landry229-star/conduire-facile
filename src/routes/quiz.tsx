import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Signpost } from "lucide-react";
import { recordQuizAttempt } from "@/lib/progress-sync";


export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz d'évaluation — L'Excellence Auto-École" },
      {
        name: "description",
        content:
          "Testez votre niveau de code de la route avant de vous inscrire. Quiz gratuits par catégorie de permis : moto, voiture, poids lourd, transport en commun, agricole.",
      },
      { property: "og:title", content: "Quiz d'évaluation — L'Excellence Auto-École" },
      {
        property: "og:description",
        content:
          "Évaluez votre niveau avant de vous inscrire. Quiz par catégorie de permis au Bénin.",
      },
    ],
  }),
  component: QuizPage,
});

type Question = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

type QuizCategory = {
  slug: string;
  code: string;
  title: string;
  desc: string;
  questions: Question[];
};

const quizzes: QuizCategory[] = [
  {
    slug: "moto",
    code: "AM / A",
    title: "Moto & Cyclomoteur",
    desc: "Cyclomoteur, Zémidjan, motos légères et toutes cylindrées.",
    questions: [
      {
        q: "À partir de quel âge peut-on conduire un cyclomoteur (catégorie AM) au Bénin ?",
        options: ["12 ans", "14 ans", "16 ans", "18 ans"],
        answer: 1,
        explain: "La catégorie AM est accessible dès 14 ans pour les cyclomoteurs ≤ 50 cm³.",
      },
      {
        q: "Le port du casque pour le conducteur d'un deux-roues motorisé est :",
        options: ["Recommandé", "Obligatoire", "Optionnel de nuit", "Au choix du passager"],
        answer: 1,
        explain: "Le casque homologué est obligatoire pour le conducteur ET le passager.",
      },
      {
        q: "Avant de tourner à gauche en moto, vous devez :",
        options: [
          "Klaxonner deux fois",
          "Tourner directement",
          "Contrôler en tournant la tête puis signaler",
          "Allumer les feux de détresse",
        ],
        answer: 2,
        explain: "Contrôle visuel (angle mort) + clignotant avant toute manœuvre.",
      },
      {
        q: "En zone urbaine, la vitesse maximale autorisée est généralement :",
        options: ["30 km/h", "50 km/h", "70 km/h", "90 km/h"],
        answer: 1,
        explain: "50 km/h en agglomération sauf indication contraire.",
      },
      {
        q: "Un Zémidjan transportant un passager doit :",
        options: [
          "Lui fournir un casque homologué",
          "Refuser tout passager mineur",
          "Rouler uniquement sur le trottoir",
          "Doubler systématiquement par la droite",
        ],
        answer: 0,
        explain: "Le conducteur doit fournir un casque au passager.",
      },
    ],
  },
  {
    slug: "voiture",
    code: "B",
    title: "Voiture légère",
    desc: "Véhicules jusqu'à 3,5 tonnes, transport personnel.",
    questions: [
      {
        q: "Un panneau triangulaire à bord rouge signifie :",
        options: ["Obligation", "Danger", "Interdiction", "Indication"],
        answer: 1,
        explain: "Les panneaux triangulaires à bord rouge annoncent un danger.",
      },
      {
        q: "À un carrefour sans signalisation, la priorité est donnée :",
        options: [
          "Au véhicule le plus rapide",
          "Au véhicule venant de la gauche",
          "Au véhicule venant de la droite",
          "Au plus gros véhicule",
        ],
        answer: 2,
        explain: "Règle de la priorité à droite en l'absence de signalisation.",
      },
      {
        q: "La distance de sécurité minimale derrière un véhicule à 90 km/h correspond à :",
        options: ["1 seconde", "2 secondes", "5 mètres", "10 mètres"],
        answer: 1,
        explain: "On retient la règle des 2 secondes minimum entre deux véhicules.",
      },
      {
        q: "Le taux d'alcoolémie maximum autorisé au volant est généralement de :",
        options: ["0,2 g/L", "0,5 g/L", "0,8 g/L", "1,0 g/L"],
        answer: 1,
        explain: "0,5 g/L de sang est la limite courante ; tolérance zéro pour les novices.",
      },
      {
        q: "Une ligne blanche continue au sol signifie :",
        options: [
          "Dépassement autorisé",
          "Interdiction de franchissement",
          "Voie réservée aux bus",
          "Zone de stationnement",
        ],
        answer: 1,
        explain: "On ne franchit ni ne chevauche une ligne continue.",
      },
      {
        q: "Le contrôle technique pour un véhicule particulier est exigé :",
        options: [
          "Jamais",
          "Tous les mois",
          "Périodiquement selon la réglementation",
          "Uniquement après accident",
        ],
        answer: 2,
        explain: "Un contrôle technique périodique est obligatoire (voir réglementation locale).",
      },
    ],
  },
  {
    slug: "poids-lourd",
    code: "C / CE",
    title: "Poids lourd",
    desc: "Camions > 3,5 t, semi-remorques, transport de marchandises.",
    questions: [
      {
        q: "Le temps de conduite continu maximum recommandé pour un chauffeur PL est :",
        options: ["2 h", "4 h 30", "6 h", "8 h"],
        answer: 1,
        explain: "Pause d'au moins 45 min après 4 h 30 de conduite continue.",
      },
      {
        q: "Avant chaque départ, le chauffeur poids lourd doit vérifier :",
        options: [
          "Uniquement le carburant",
          "Pneus, freins, éclairage, arrimage",
          "Seulement les rétroviseurs",
          "Rien si le camion vient de rouler",
        ],
        answer: 1,
        explain: "Contrôle visuel complet : pneus, freins, feux, arrimage du chargement.",
      },
      {
        q: "Un dépassement de charge maximale autorisée est :",
        options: [
          "Toléré jusqu'à 20 %",
          "Interdit et sanctionné",
          "Autorisé hors agglomération",
          "Autorisé la nuit",
        ],
        answer: 1,
        explain: "La surcharge est interdite et sanctionnée (amende + immobilisation).",
      },
      {
        q: "En descente prolongée, on utilise principalement :",
        options: [
          "Le frein de service en continu",
          "Le frein moteur / ralentisseur",
          "Le frein à main",
          "Le point mort",
        ],
        answer: 1,
        explain: "Le frein moteur évite la surchauffe des freins de service.",
      },
      {
        q: "Le distance de freinage d'un PL chargé à 80 km/h est, par rapport à une voiture :",
        options: ["Identique", "Plus courte", "Beaucoup plus longue", "Réduite par l'ABS"],
        answer: 2,
        explain: "La masse impose une distance de freinage nettement supérieure.",
      },
    ],
  },
  {
    slug: "transport-commun",
    code: "D",
    title: "Transport en commun",
    desc: "Minibus, bus, autocars : transport de voyageurs.",
    questions: [
      {
        q: "Avant le départ avec des passagers, le conducteur doit :",
        options: [
          "Vérifier les issues de secours",
          "Démarrer immédiatement",
          "Laisser les portes ouvertes",
          "Couper le moteur",
        ],
        answer: 0,
        explain: "Vérification obligatoire des issues, extincteur et signalétique de sécurité.",
      },
      {
        q: "Le nombre de passagers transportés ne doit jamais dépasser :",
        options: [
          "Le double de la capacité",
          "La capacité indiquée sur la carte grise",
          "Ce que le chauffeur estime",
          "10 personnes",
        ],
        answer: 1,
        explain: "La capacité maximale est définie par les documents du véhicule.",
      },
      {
        q: "À un arrêt de bus, le conducteur doit :",
        options: [
          "S'arrêter au milieu de la chaussée",
          "S'arrêter à l'emplacement réservé",
          "Klaxonner pour faire monter",
          "Reculer pour récupérer un passager",
        ],
        answer: 1,
        explain: "L'arrêt se fait uniquement à l'emplacement prévu.",
      },
      {
        q: "Le temps de repos journalier d'un conducteur de bus est :",
        options: ["4 h", "8 h", "Au moins 11 h", "24 h"],
        answer: 2,
        explain: "Repos journalier d'au moins 11 h consécutives.",
      },
      {
        q: "En cas de panne sur autoroute avec voyageurs, le conducteur doit :",
        options: [
          "Continuer doucement",
          "Faire descendre les passagers en sécurité, baliser",
          "Attendre dans le bus moteur allumé",
          "Repartir en sens inverse",
        ],
        answer: 1,
        explain: "Sécuriser les passagers hors du véhicule, derrière la glissière + triangle.",
      },
    ],
  },
  {
    slug: "agricole",
    code: "T",
    title: "Tracteur agricole",
    desc: "Tracteurs et engins agricoles ou forestiers.",
    questions: [
      {
        q: "Sur route, un tracteur doit circuler :",
        options: [
          "Au milieu de la chaussée",
          "Le plus à droite possible",
          "Sur la voie de gauche",
          "Uniquement sur bas-côté",
        ],
        answer: 1,
        explain: "Vu sa lenteur, le tracteur se tient le plus à droite possible.",
      },
      {
        q: "Un tracteur transportant une remorque chargée doit :",
        options: [
          "Désactiver les feux",
          "Vérifier l'arrimage et la signalisation arrière",
          "Doubler les autres véhicules",
          "Rouler à plus de 60 km/h",
        ],
        answer: 1,
        explain: "Charge arrimée + feux et plaque de signalisation visibles.",
      },
      {
        q: "Le gyrophare orange sur un engin agricole indique :",
        options: [
          "Véhicule prioritaire",
          "Véhicule lent ou encombrant",
          "Véhicule de police",
          "Convoi militaire",
        ],
        answer: 1,
        explain: "Gyrophare orange = véhicule lent, large ou en intervention.",
      },
      {
        q: "À la sortie d'un champ sur la route, le conducteur doit :",
        options: [
          "Foncer sans s'arrêter",
          "Marquer un arrêt et nettoyer la chaussée si salie",
          "Klaxonner et passer",
          "Avancer en marche arrière",
        ],
        answer: 1,
        explain: "Obligation de céder le passage et de ne pas salir la voie publique.",
      },
    ],
  },
];

function QuizPage() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const active = useMemo(
    () => quizzes.find((q) => q.slug === activeSlug) ?? null,
    [activeSlug],
  );

  const score = useMemo(() => {
    if (!active) return 0;
    return active.questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
      0,
    );
  }, [active, answers]);

  function openQuiz(slug: string) {
    setActiveSlug(slug);
    setAnswers({});
    setSubmitted(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-sm bg-benin-green">
            <span className="block size-2 rounded-full bg-benin-yellow" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-tight">
            L'Excellence
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/panneaux"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-benin-red ring-1 ring-benin-red/30 transition-colors hover:bg-benin-red/5"
          >
            <Signpost className="size-3" /> Panneaux
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-charcoal/10 transition-colors hover:bg-white"
          >
            <ArrowLeft className="size-3" /> Accueil
          </Link>
        </div>
      </nav>

      <header className="px-5 pb-2 pt-10">
        <div className="max-w-[60ch]">
          <span className="mb-4 inline-block rounded-sm bg-benin-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-benin-green">
            Évaluation gratuite
          </span>
          <h1 className="mb-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Quiz d'évaluation par catégorie
          </h1>
          <p className="text-pretty text-base text-charcoal/70">
            Testez vos connaissances en quelques minutes avant de vous inscrire.
            Choisissez la catégorie de permis qui vous intéresse.
          </p>
        </div>
      </header>

      {!active ? (
        <section className="px-5 py-12">
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((q) => (
              <button
                key={q.slug}
                type="button"
                onClick={() => openQuiz(q.slug)}
                className="group flex items-start justify-between gap-4 rounded-xl bg-white p-5 text-left ring-1 ring-black/5 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-md border border-zinc-100 bg-zinc-50 text-xs font-semibold text-benin-red">
                    {q.code}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{q.title}</div>
                    <div className="mt-1 text-xs text-charcoal/60">{q.desc}</div>
                    <div className="mt-2 text-[10px] font-medium uppercase tracking-wider text-benin-green">
                      {q.questions.length} questions
                    </div>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-charcoal/30 transition-transform group-hover:translate-x-0.5 group-hover:text-benin-green" />
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="px-5 py-10">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveSlug(null)}
              className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/60 hover:text-charcoal"
            >
              <ArrowLeft className="size-3" /> Toutes les catégories
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-benin-green">
              {active.code} — {active.title}
            </span>
          </div>

          <div className="space-y-4">
            {active.questions.map((q, qi) => {
              const selected = answers[qi];
              return (
                <div
                  key={qi}
                  className="rounded-xl bg-white p-5 ring-1 ring-black/5"
                >
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-[10px] font-semibold text-benin-green">
                      Q{qi + 1}
                    </span>
                    <h3 className="text-sm font-medium leading-snug">{q.q}</h3>
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi;
                      const isCorrect = submitted && oi === q.answer;
                      const isWrong = submitted && isSelected && oi !== q.answer;
                      return (
                        <label
                          key={oi}
                          className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm ring-1 transition-colors ${
                            isCorrect
                              ? "bg-benin-green/10 ring-benin-green text-charcoal"
                              : isWrong
                                ? "bg-benin-red/10 ring-benin-red text-charcoal"
                                : isSelected
                                  ? "bg-zinc-50 ring-charcoal/30"
                                  : "ring-charcoal/10 hover:bg-zinc-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            className="sr-only"
                            checked={isSelected}
                            disabled={submitted}
                            onChange={() =>
                              setAnswers((a) => ({ ...a, [qi]: oi }))
                            }
                          />
                          <span
                            className={`grid size-4 shrink-0 place-items-center rounded-full ring-1 ${
                              isCorrect
                                ? "bg-benin-green ring-benin-green"
                                : isWrong
                                  ? "bg-benin-red ring-benin-red"
                                  : isSelected
                                    ? "bg-charcoal ring-charcoal"
                                    : "ring-charcoal/30"
                            }`}
                          >
                            {(isSelected || isCorrect) && (
                              <span className="block size-1.5 rounded-full bg-white" />
                            )}
                          </span>
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p className="mt-3 rounded-md bg-zinc-50 p-3 text-xs leading-relaxed text-charcoal/70">
                      <span className="font-semibold text-benin-green">Réponse :</span>{" "}
                      {q.explain}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!submitted ? (
            <button
              type="button"
              onClick={() => {
                setSubmitted(true);
                if (active) void recordQuizAttempt(active.slug, score, active.questions.length);
              }}
              disabled={Object.keys(answers).length < active.questions.length}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-benin-green py-3 text-sm font-medium text-white ring-1 ring-benin-green transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="size-4" /> Voir mon résultat
            </button>

          ) : (
            <div className="mt-6 rounded-xl bg-white p-6 ring-1 ring-black/5">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
                Votre score
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-benin-green">
                  {score}
                </span>
                <span className="text-sm text-charcoal/50">
                  / {active.questions.length}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                {score === active.questions.length
                  ? "Excellent ! Vous avez les bases pour démarrer sereinement la formation pratique."
                  : score >= Math.ceil(active.questions.length * 0.7)
                    ? "Bon niveau. Une formation complète vous fera atteindre l'examen sans stress."
                    : score >= Math.ceil(active.questions.length * 0.4)
                      ? "Niveau intermédiaire. Notre formation Code de la Route est faite pour vous."
                      : "Nous vous recommandons fortement notre parcours complet : code + conduite."}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/"
                  hash="contact"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-benin-red px-4 py-3 text-sm font-medium text-white ring-1 ring-benin-red"
                >
                  S'inscrire à la formation <ArrowRight className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-medium text-charcoal ring-1 ring-charcoal/10"
                >
                  <RotateCcw className="size-4" /> Recommencer
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="border-t border-charcoal/5 bg-zinc-50 px-5 py-10">
        <p className="text-[11px] leading-relaxed text-charcoal/50">
          © {new Date().getFullYear()} L'Excellence Auto-École. Quiz à but
          pédagogique, non officiel.
        </p>
      </footer>
    </div>
  );
}
