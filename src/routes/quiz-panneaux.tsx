import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, RotateCcw, X, ChevronRight } from "lucide-react";
import {
  SignShape,
  VirageDroiteIcon,
  VirageGaucheIcon,
  DosDaneIcon,
  PassageNiveauIcon,
  RetrecissementIcon,
  ChausseeGlissanteIcon,
  NoLeftTurnIcon,
  SensInterditIcon,
  StationnementInterditIcon,
  Vitesse50Icon,
  Vitesse30Icon,
  TournerDroiteIcon,
  ContournementIcon,
  SensUniqueIcon,
  HospitalIcon,
  ParkingIcon,
} from "@/components/TrafficSign";
import type { SignData } from "@/components/TrafficSign";

export const Route = createFileRoute("/quiz-panneaux")({
  head: () => ({
    meta: [
      { title: "Quiz Panneaux de signalisation — L'Excellence Auto-École" },
      {
        name: "description",
        content:
          "Testez votre connaissance des panneaux du code de la route au Bénin. Quiz interactif avec score et explications.",
      },
      {
        property: "og:title",
        content: "Quiz Panneaux de signalisation — L'Excellence",
      },
      {
        property: "og:description",
        content:
          "Quiz gratuit pour évaluer votre maîtrise des panneaux de signalisation.",
      },
    ],
  }),
  component: QuizPanneauxPage,
});

type SignQuestion = {
  sign: SignData;
  icon: React.ReactNode;
  options: string[];
  answer: number;
  explain: string;
};

const questions: SignQuestion[] = [
  {
    sign: { type: "stop", label: "", desc: "" },
    icon: null,
    options: [
      "Ralentir et continuer si la voie est libre",
      "Arrêt complet obligatoire et céder le passage",
      "Priorité absolue au véhicule",
      "Stationnement interdit",
    ],
    answer: 1,
    explain:
      "Le panneau STOP impose un arrêt complet, même si la voie semble libre. Vous devez ensuite céder le passage à tous les autres usagers.",
  },
  {
    sign: { type: "danger", label: "", desc: "" },
    icon: <VirageDroiteIcon />,
    options: [
      "Tournez à droite obligatoirement",
      "Virage dangereux à droite",
      "Sens interdit à droite",
      "Sortie à droite",
    ],
    answer: 1,
    explain:
      "Triangle rouge = panneau de danger. Il prévient d'un virage serré à droite. Réduisez votre vitesse avant le virage.",
  },
  {
    sign: { type: "interdiction", label: "", desc: "" },
    icon: <Vitesse50Icon />,
    options: [
      "Vitesse minimale 50 km/h",
      "Vitesse conseillée 50 km/h",
      "Vitesse maximale autorisée 50 km/h",
      "Fin de limitation 50 km/h",
    ],
    answer: 2,
    explain:
      "Cercle à bord rouge = interdiction. Vous ne devez pas dépasser 50 km/h dans cette zone.",
  },
  {
    sign: { type: "obligation", label: "", desc: "" },
    icon: <TournerDroiteIcon />,
    options: [
      "Virage à droite interdit",
      "Virage à droite obligatoire",
      "Direction conseillée à droite",
      "Sortie à droite",
    ],
    answer: 1,
    explain:
      "Cercle bleu = obligation. Vous devez impérativement tourner à droite. Aucune autre direction n'est autorisée.",
  },
  {
    sign: { type: "interdiction", label: "", desc: "" },
    icon: <SensInterditIcon />,
    options: [
      "Voie réservée aux bus",
      "Sens interdit à tous véhicules",
      "Stationnement interdit",
      "Route barrée",
    ],
    answer: 1,
    explain:
      "Disque rouge avec barre blanche = sens interdit. L'accès est totalement interdit dans cette direction.",
  },
  {
    sign: { type: "danger", label: "", desc: "" },
    icon: <PassageNiveauIcon />,
    options: [
      "Pont à traverser",
      "Tramway à proximité",
      "Passage à niveau",
      "Travaux sur la route",
    ],
    answer: 2,
    explain:
      "Annonce un passage à niveau avec voie ferrée. Soyez prêt à céder le passage au train et ne franchissez jamais une barrière qui descend.",
  },
  {
    sign: { type: "ceder", label: "", desc: "" },
    icon: null,
    options: [
      "Vous avez la priorité",
      "Cédez le passage",
      "Arrêt obligatoire",
      "Fin de priorité",
    ],
    answer: 1,
    explain:
      "Triangle pointe vers le bas = cédez le passage. Ralentissez et arrêtez-vous si nécessaire pour laisser passer les autres usagers.",
  },
  {
    sign: { type: "danger", label: "", desc: "" },
    icon: <ChausseeGlissanteIcon />,
    options: [
      "Route en travaux",
      "Chaussée glissante",
      "Virages successifs",
      "Cassis ou dos d'âne",
    ],
    answer: 1,
    explain:
      "Chaussée glissante : risque de perte d'adhérence, surtout par temps de pluie. Évitez les freinages brusques.",
  },
  {
    sign: { type: "interdiction", label: "", desc: "" },
    icon: <StationnementInterditIcon />,
    options: [
      "Stationnement gratuit",
      "Stationnement réservé",
      "Stationnement interdit",
      "Parking obligatoire",
    ],
    answer: 2,
    explain:
      "Stationnement interdit dans cette zone. Vous pouvez vous arrêter brièvement mais pas stationner.",
  },
  {
    sign: { type: "indication", label: "", desc: "" },
    icon: <HospitalIcon />,
    options: [
      "Pharmacie à proximité",
      "Hôpital à proximité",
      "Centre commercial",
      "Aire de repos",
    ],
    answer: 1,
    explain:
      "Hôpital à proximité. Évitez de klaxonner et soyez attentif aux ambulances qui peuvent surgir.",
  },
  {
    sign: { type: "priority", label: "", desc: "" },
    icon: null,
    options: [
      "Cédez le passage",
      "Intersection avec priorité ponctuelle",
      "Fin de route prioritaire",
      "STOP",
    ],
    answer: 1,
    explain:
      "Triangle noir sur fond blanc = vous bénéficiez de la priorité à la prochaine intersection.",
  },
  {
    sign: { type: "indication", label: "", desc: "" },
    icon: <ParkingIcon />,
    options: [
      "Stationnement interdit",
      "Parking autorisé",
      "Péage",
      "Police",
    ],
    answer: 1,
    explain:
      "Rectangle bleu avec P = zone de stationnement aménagée et autorisée.",
  },
];

const QUIZ_SIZE = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): SignQuestion[] {
  return shuffle(questions)
    .slice(0, Math.min(QUIZ_SIZE, questions.length))
    .map((qst) => {
      const indices = shuffle(qst.options.map((_, i) => i));
      return {
        ...qst,
        options: indices.map((i) => qst.options[i]),
        answer: indices.indexOf(qst.answer),
      };
    });
}

function QuizPanneauxPage() {
  const [deck, setDeck] = useState<SignQuestion[]>(() => buildDeck());
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const q = deck[current];
  const isLast = current === deck.length - 1;
  const score = useMemo(
    () => answers.filter((a, i) => a === deck[i].answer).length,
    [answers, deck],
  );

  function submit() {
    if (selected === null) return;
    const next = [...answers, selected];
    setAnswers(next);
    if (isLast) {
      setFinished(true);
    }
  }

  function nextQ() {
    setSelected(null);
    setCurrent((c) => c + 1);
  }

  function restart() {
    setDeck(buildDeck());
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  }

  const showCorrection = answers.length > current;
  const isCorrect = showCorrection && answers[current] === q.answer;

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-sm bg-benin-green">
            <span className="block size-2 rounded-full bg-benin-yellow" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-tight">
            L'Excellence
          </span>
        </Link>
        <Link
          to="/panneaux"
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-charcoal/10 transition-colors hover:bg-white"
        >
          <ArrowLeft className="size-3" /> Panneaux
        </Link>
      </nav>

      <header className="px-5 pb-2 pt-10">
        <div className="max-w-[60ch]">
          <span className="mb-4 inline-block rounded-sm bg-benin-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-benin-green">
            Quiz panneaux
          </span>
          <h1 className="mb-3 text-balance text-3xl font-semibold leading-tight md:text-4xl">
            Reconnaissez-vous tous les panneaux ?
          </h1>
          <p className="text-pretty text-base text-charcoal/70">
            {questions.length} questions à choix multiples. Correction
            instantanée et explication après chaque réponse.
          </p>
        </div>
      </header>

      <main className="px-5 py-8">
        {!finished ? (
          <div className="mx-auto max-w-2xl">
            {/* Progress */}
            <div className="mb-6 flex items-center justify-between text-xs text-charcoal/60">
              <span>
                Question {current + 1} / {questions.length}
              </span>
              <div className="h-1 flex-1 mx-4 overflow-hidden rounded-full bg-charcoal/10">
                <div
                  className="h-full bg-benin-green transition-all"
                  style={{
                    width: `${((current + (showCorrection ? 1 : 0)) / questions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="font-medium text-charcoal">
                {score} / {answers.length}
              </span>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <div className="mb-6 flex flex-col items-center">
                <div className="size-32">
                  <SignShape type={q.sign.type} icon={q.icon} />
                </div>
                <p className="mt-4 text-center text-sm font-medium text-charcoal/70">
                  Que signifie ce panneau ?
                </p>
              </div>

              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isAnswer = i === q.answer;
                  let cls =
                    "w-full text-left rounded-lg px-4 py-3 text-sm ring-1 transition-colors cursor-pointer";
                  if (showCorrection) {
                    if (isAnswer)
                      cls +=
                        " bg-benin-green/10 ring-benin-green text-charcoal";
                    else if (isSelected)
                      cls += " bg-benin-red/10 ring-benin-red text-charcoal";
                    else cls += " ring-charcoal/10 text-charcoal/60";
                  } else {
                    cls += isSelected
                      ? " bg-benin-green/5 ring-benin-green"
                      : " ring-charcoal/10 hover:bg-zinc-50";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={showCorrection}
                      onClick={() => setSelected(i)}
                      className={cls}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>{opt}</span>
                        {showCorrection && isAnswer && (
                          <Check className="size-4 text-benin-green" />
                        )}
                        {showCorrection && isSelected && !isAnswer && (
                          <X className="size-4 text-benin-red" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {showCorrection && (
                <div
                  className={`mt-5 rounded-lg p-4 text-sm ${
                    isCorrect
                      ? "bg-benin-green/5 text-charcoal"
                      : "bg-benin-yellow/10 text-charcoal"
                  }`}
                >
                  <p className="mb-1 font-semibold">
                    {isCorrect ? "Bonne réponse" : "Réponse incorrecte"}
                  </p>
                  <p className="text-charcoal/70">{q.explain}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                {!showCorrection ? (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={selected === null}
                    className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-medium text-white ring-1 ring-benin-green disabled:opacity-40"
                  >
                    Valider
                  </button>
                ) : !isLast ? (
                  <button
                    type="button"
                    onClick={nextQ}
                    className="inline-flex items-center gap-2 rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-white"
                  >
                    Question suivante <ChevronRight className="size-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFinished(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-medium text-white"
                  >
                    Voir mon score
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-wider text-benin-green">
                Résultat
              </p>
              <p className="mt-3 text-5xl font-semibold">
                {score}
                <span className="text-charcoal/40"> / {questions.length}</span>
              </p>
              <p className="mt-4 text-sm text-charcoal/70">
                {score === questions.length
                  ? "Parfait ! Vous maîtrisez la signalisation."
                  : score >= questions.length * 0.7
                    ? "Très bon niveau. Quelques révisions et vous serez prêt."
                    : score >= questions.length * 0.5
                      ? "Niveau correct. Une formation structurée vous aidera à progresser."
                      : "La signalisation demande de la pratique. Inscrivez-vous pour progresser rapidement."}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium ring-1 ring-charcoal/15"
                >
                  <RotateCcw className="size-4" /> Recommencer
                </button>
                <Link
                  to="/panneaux"
                  className="inline-flex items-center gap-2 rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-white"
                >
                  Revoir les panneaux
                </Link>
                <Link
                  to="/"
                  hash="inscription"
                  className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-medium text-white"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-charcoal/5 bg-zinc-50 px-5 py-10">
        <p className="text-[11px] leading-relaxed text-charcoal/50">
          © {new Date().getFullYear()} L'Excellence Auto-École.
        </p>
      </footer>
    </div>
  );
}
