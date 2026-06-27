import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Lock,
  PlayCircle,
  RotateCcw,
  Signpost,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/theorie")({
  head: () => ({
    meta: [
      { title: "Phase théorique en ligne — L'Excellence Auto-École" },
      {
        name: "description",
        content:
          "Suivez votre formation au code de la route en ligne : modules, leçons, progression et quiz. Accessible 24h/24 depuis votre téléphone.",
      },
    ],
  }),
  component: Theorie,
});

type Lesson = {
  id: string;
  title: string;
  duration: string;
  body: string;
  keyPoints: string[];
};

type Module = {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};

const modules: Module[] = [
  {
    id: "m1",
    title: "Module 1 — Bases du code de la route",
    summary: "Comprendre l'environnement routier et la réglementation béninoise.",
    lessons: [
      {
        id: "m1l1",
        title: "Le code de la route au Bénin",
        duration: "8 min",
        body: "Le code de la route en République du Bénin est régi par le décret n°96-415 et ses textes modificatifs. Il s'applique à tous les usagers : conducteurs, motocyclistes, cyclistes et piétons. Sa connaissance est obligatoire avant tout passage d'examen.",
        keyPoints: [
          "Tout conducteur doit détenir un permis valide de la catégorie correspondante.",
          "L'âge minimum est de 14 ans pour le AM (cyclomoteur) et 18 ans pour le B.",
          "Le port de la ceinture est obligatoire à l'avant comme à l'arrière.",
          "Le casque est obligatoire pour tout conducteur et passager de deux-roues.",
        ],
      },
      {
        id: "m1l2",
        title: "Les usagers de la route",
        duration: "6 min",
        body: "La route est un espace partagé entre véhicules motorisés, deux-roues, piétons et animaux. Chaque usager a des droits et des devoirs. Le conducteur doit toujours adapter sa conduite à la présence des usagers vulnérables (piétons, enfants, personnes âgées, zémidjans).",
        keyPoints: [
          "Priorité absolue au piéton engagé sur un passage protégé.",
          "Distance latérale d'au moins 1 m pour dépasser un deux-roues.",
          "Anticiper les écarts des zémidjans en milieu urbain.",
        ],
      },
      {
        id: "m1l3",
        title: "Documents obligatoires",
        duration: "5 min",
        body: "Tout conducteur doit présenter immédiatement à toute réquisition : permis de conduire, carte grise, attestation d'assurance en cours de validité et visite technique pour les véhicules concernés.",
        keyPoints: [
          "Permis : original, pas de photocopie.",
          "Assurance : vignette visible sur le pare-brise.",
          "Visite technique : tous les 2 ans (véhicules légers), annuelle (poids lourds).",
        ],
      },
    ],
  },
  {
    id: "m2",
    title: "Module 2 — Panneaux et signalisation",
    summary: "Reconnaître et interpréter les panneaux de signalisation.",
    lessons: [
      {
        id: "m2l1",
        title: "Panneaux de danger",
        duration: "7 min",
        body: "Les panneaux de danger ont une forme triangulaire à bord rouge sur fond blanc. Ils annoncent un danger à 150 m en rase campagne et à 50 m en agglomération. Ralentissez et redoublez d'attention.",
        keyPoints: [
          "Triangle rouge = danger à venir.",
          "Toujours réduire la vitesse à la vue d'un panneau de danger.",
          "Panneau du virage : indique le sens de la courbe.",
        ],
      },
      {
        id: "m2l2",
        title: "Panneaux d'interdiction",
        duration: "8 min",
        body: "Cercles à bord rouge sur fond blanc. Ils interdisent une manœuvre ou une catégorie de véhicules. L'interdiction s'applique jusqu'au prochain carrefour ou jusqu'à un panneau de fin d'interdiction.",
        keyPoints: [
          "Sens interdit : disque rouge à barre blanche.",
          "Limitation de vitesse : nombre noir dans un cercle rouge.",
          "Stationnement interdit : cercle rouge barré en bleu.",
        ],
      },
      {
        id: "m2l3",
        title: "Panneaux d'obligation et d'indication",
        duration: "6 min",
        body: "Les panneaux d'obligation sont ronds, bleus avec un pictogramme blanc. Les panneaux d'indication sont rectangulaires bleus ou verts : ils donnent une information utile (parking, hôpital, sens unique).",
        keyPoints: [
          "Rond bleu = obligation (direction, voie réservée).",
          "Rectangle bleu = indication ou service.",
          "Rectangle vert = itinéraire routier principal.",
        ],
      },
      {
        id: "m2l4",
        title: "STOP, cédez le passage et priorités",
        duration: "7 min",
        body: "Le panneau STOP impose un arrêt complet, pieds immobiles, avant de redémarrer. Le 'Cédez le passage' (triangle pointe en bas) oblige à ralentir et à laisser passer, sans nécessairement s'arrêter.",
        keyPoints: [
          "STOP : marquer un temps d'arrêt complet, même si la voie est libre.",
          "Cédez le passage : céder à tout véhicule venant de la voie principale.",
          "À défaut de signalisation, priorité à droite.",
        ],
      },
    ],
  },
  {
    id: "m3",
    title: "Module 3 — Règles de circulation",
    summary: "Vitesse, dépassement, croisement et stationnement.",
    lessons: [
      {
        id: "m3l1",
        title: "Limitations de vitesse au Bénin",
        duration: "5 min",
        body: "En agglomération : 50 km/h. Hors agglomération : 90 km/h. Sur autoroute (axes Cotonou-Porto-Novo, Cotonou-Calavi voie rapide) : 110 km/h. Ces limites sont abaissées par temps de pluie.",
        keyPoints: [
          "Agglomération : 50 km/h.",
          "Hors agglomération : 90 km/h, 80 km/h par pluie.",
          "Voie rapide : 110 km/h, 100 km/h par pluie.",
        ],
      },
      {
        id: "m3l2",
        title: "Le dépassement",
        duration: "8 min",
        body: "Le dépassement s'effectue par la gauche, après avoir vérifié qu'aucun véhicule ne suit à grande vitesse et que la visibilité est suffisante. Interdit avant un sommet de côte, un virage sans visibilité ou un passage piéton.",
        keyPoints: [
          "Toujours signaler son intention au clignotant gauche.",
          "Revenir à droite uniquement quand le véhicule dépassé est visible dans le rétroviseur intérieur.",
          "Dépassement interdit sur ligne continue.",
        ],
      },
      {
        id: "m3l3",
        title: "Stationnement",
        duration: "5 min",
        body: "Le stationnement doit se faire à droite, dans le sens de la circulation, sauf indication contraire. Il est interdit sur les passages piétons, devant les bouches d'incendie, à moins de 5 m d'une intersection.",
        keyPoints: [
          "Stationnement gênant : amende et mise en fourrière.",
          "Toujours serrer le frein à main et engager une vitesse.",
          "Roues braquées vers le trottoir en pente descendante.",
        ],
      },
    ],
  },
  {
    id: "m4",
    title: "Module 4 — Sécurité et conduite responsable",
    summary: "Alcool, fatigue, équipements, premiers secours.",
    lessons: [
      {
        id: "m4l1",
        title: "Alcool, drogue et médicaments",
        duration: "6 min",
        body: "Le taux d'alcool maximum autorisé au Bénin est de 0,5 g/L de sang (0,25 mg/L d'air expiré). Au-delà : suspension du permis, amende et peine de prison en cas d'accident. Certains médicaments altèrent la vigilance — lire la notice.",
        keyPoints: [
          "Un verre standard = environ 0,2 g/L.",
          "L'alcool diminue le champ visuel et allonge le temps de réaction.",
          "En cas de doute, ne pas prendre le volant : appeler un proche ou un taxi.",
        ],
      },
      {
        id: "m4l2",
        title: "Fatigue et vigilance",
        duration: "5 min",
        body: "La fatigue est responsable d'un accident mortel sur trois. Faites une pause de 15 à 20 minutes toutes les 2 heures sur long trajet. Évitez de conduire entre 2h et 5h du matin si vous n'êtes pas reposé.",
        keyPoints: [
          "Signes d'alerte : bâillements, paupières lourdes, écarts de trajectoire.",
          "S'arrêter dès le premier signe, ne pas attendre.",
          "Café et boissons énergisantes : effet temporaire seulement.",
        ],
      },
      {
        id: "m4l3",
        title: "Premiers gestes en cas d'accident",
        duration: "7 min",
        body: "Mémorisez la séquence P.A.S. : Protéger, Alerter, Secourir. Sécurisez la zone (triangle, feux de détresse), alertez les secours (112 ou 117), n'intervenez sur les blessés que si vous êtes formé.",
        keyPoints: [
          "Protéger : éloigner les véhicules, couper le contact.",
          "Alerter : 117 (police), 118 (pompiers), 112 (numéro européen reconnu).",
          "Ne jamais déplacer un blessé sauf danger immédiat (incendie).",
        ],
      },
    ],
  },
];

const STORAGE_KEY = "theorie:completed:v1";

function loadCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function Theorie() {
  const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), []);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  useEffect(() => {
    setCompleted(loadCompleted());
  }, []);

  const total = allLessons.length;
  const done = completed.size;
  const percent = Math.round((done / total) * 100);

  const activeLesson = activeLessonId
    ? allLessons.find((l) => l.id === activeLessonId) ?? null
    : null;
  const activeIndex = activeLesson
    ? allLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;

  function toggle(id: string, value: boolean) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      saveCompleted(next);
      return next;
    });
  }

  function reset() {
    if (!confirm("Réinitialiser toute votre progression ?")) return;
    setCompleted(new Set());
    saveCompleted(new Set());
  }

  // Lesson detail view
  if (activeLesson) {
    const isDone = completed.has(activeLesson.id);
    const prev = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
    const next =
      activeIndex >= 0 && activeIndex < allLessons.length - 1
        ? allLessons[activeIndex + 1]
        : null;

    return (
      <div className="min-h-screen bg-ivory text-charcoal">
        <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md">
          <button
            onClick={() => setActiveLessonId(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/70"
          >
            <ArrowLeft className="size-4" /> Retour au programme
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">
            {activeIndex + 1} / {total}
          </span>
        </nav>

        <article className="mx-auto max-w-[60ch] px-5 py-10">
          <span className="mb-3 inline-block rounded-sm bg-benin-yellow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-charcoal">
            Leçon · {activeLesson.duration}
          </span>
          <h1 className="mb-5 text-2xl font-semibold leading-tight md:text-3xl">
            {activeLesson.title}
          </h1>
          <p className="mb-8 text-base leading-relaxed text-charcoal/80">
            {activeLesson.body}
          </p>

          <div className="mb-8 rounded-xl bg-white p-5 ring-1 ring-black/5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-benin-green">
              Points clés à retenir
            </h2>
            <ul className="space-y-2">
              {activeLesson.keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <Check className="mt-0.5 size-4 shrink-0 text-benin-green" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => toggle(activeLesson.id, !isDone)}
            className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-transform active:scale-[0.98] ${
              isDone
                ? "bg-zinc-100 text-charcoal ring-1 ring-charcoal/10"
                : "bg-benin-green text-white ring-1 ring-benin-green"
            }`}
          >
            {isDone ? (
              <>
                <RotateCcw className="size-4" /> Marquer non terminé
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" /> Marquer comme terminé
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              disabled={!prev}
              onClick={() => prev && setActiveLessonId(prev.id)}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium ring-1 ring-charcoal/10 disabled:opacity-40"
            >
              <ArrowLeft className="size-4" /> Précédent
            </button>
            <button
              disabled={!next}
              onClick={() => next && setActiveLessonId(next.id)}
              className="inline-flex items-center gap-2 rounded-md bg-charcoal px-3 py-2 text-sm font-medium text-ivory disabled:opacity-40"
            >
              Suivant <ArrowRight className="size-4" />
            </button>
          </div>
        </article>
      </div>
    );
  }

  // Program overview
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/70">
          <ArrowLeft className="size-4" /> Accueil
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-benin-green">
          Phase théorique
        </span>
      </nav>

      <header className="px-5 pb-2 pt-10">
        <span className="mb-3 inline-block rounded-sm bg-benin-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-benin-green">
          Apprentissage en ligne
        </span>
        <h1 className="mb-3 text-3xl font-semibold leading-tight md:text-4xl">
          Votre code de la route, à votre rythme.
        </h1>
        <p className="mb-6 max-w-[56ch] text-base text-charcoal/70">
          {modules.length} modules, {total} leçons. Votre progression est
          enregistrée automatiquement sur cet appareil.
        </p>
      </header>

      {/* Progress */}
      <section className="px-5 pb-8">
        <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-benin-yellow" />
              <span className="text-sm font-semibold">Progression globale</span>
            </div>
            <span className="text-sm font-semibold text-benin-green">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full bg-benin-green transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-charcoal/60">
            <span>
              {done} leçon{done > 1 ? "s" : ""} terminée{done > 1 ? "s" : ""} sur {total}
            </span>
            {done > 0 && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-1 text-charcoal/50 hover:text-benin-red"
              >
                <RotateCcw className="size-3" /> Réinitialiser
              </button>
            )}
          </div>

          {percent === 100 && (
            <div className="mt-4 rounded-md bg-benin-green/10 p-3 text-xs leading-relaxed text-benin-green">
              <strong>Bravo !</strong> Vous avez terminé la phase théorique.
              Passez maintenant le quiz final pour valider vos acquis.
            </div>
          )}
        </div>
      </section>

      {/* Modules */}
      <section className="px-5 pb-10">
        <div className="space-y-5">
          {modules.map((mod, mIdx) => {
            const modDone = mod.lessons.filter((l) => completed.has(l.id)).length;
            const modPercent = Math.round((modDone / mod.lessons.length) * 100);
            const prevModuleComplete =
              mIdx === 0 ||
              modules[mIdx - 1].lessons.every((l) => completed.has(l.id));

            return (
              <div
                key={mod.id}
                className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
              >
                <div className="border-b border-charcoal/5 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen className="size-4 text-benin-red" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
                      {modDone}/{mod.lessons.length} leçons · {modPercent}%
                    </span>
                  </div>
                  <h2 className="text-base font-semibold">{mod.title}</h2>
                  <p className="mt-1 text-xs text-charcoal/60">{mod.summary}</p>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full bg-benin-yellow"
                      style={{ width: `${modPercent}%` }}
                    />
                  </div>
                </div>

                <ul className="divide-y divide-charcoal/5">
                  {mod.lessons.map((lesson, lIdx) => {
                    const isDone = completed.has(lesson.id);
                    const locked = !prevModuleComplete && mIdx > 0;

                    return (
                      <li key={lesson.id}>
                        <button
                          disabled={locked}
                          onClick={() => setActiveLessonId(lesson.id)}
                          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {locked ? (
                            <Lock className="size-5 shrink-0 text-charcoal/30" />
                          ) : isDone ? (
                            <CheckCircle2 className="size-5 shrink-0 text-benin-green" />
                          ) : (
                            <Circle className="size-5 shrink-0 text-charcoal/30" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">
                              {lIdx + 1}. {lesson.title}
                            </div>
                            <div className="text-[11px] text-charcoal/50">
                              {lesson.duration}
                              {locked && " · Terminez le module précédent"}
                            </div>
                          </div>
                          {!locked && (
                            <PlayCircle className="size-5 shrink-0 text-benin-green" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16">
        <div className="rounded-xl bg-zinc-900 p-6 text-ivory">
          <h2 className="mb-2 text-base font-semibold">Prêt à vous évaluer ?</h2>
          <p className="mb-4 text-xs leading-relaxed text-ivory/60">
            Testez vos acquis avec nos quiz officiels par catégorie et la
            galerie de panneaux.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-benin-green px-4 py-2.5 text-sm font-medium text-white"
            >
              <ClipboardCheck className="size-4" /> Quiz par catégorie
            </Link>
            <Link
              to="/panneaux"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2.5 text-sm font-medium text-ivory ring-1 ring-white/20"
            >
              <Signpost className="size-4" /> Galerie des panneaux
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
