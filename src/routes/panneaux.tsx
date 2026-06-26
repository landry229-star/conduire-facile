import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  Ban,
  CircleCheck,
  Info,
  ChevronRight,
} from "lucide-react";
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

export const Route = createFileRoute("/panneaux")({
  head: () => ({
    meta: [
      { title: "Panneaux de signalisation — L'Excellence Auto-École" },
      {
        name: "description",
        content:
          "Apprenez à reconnaître les panneaux de signalisation au Bénin : danger, interdiction, obligation, indication, STOP, priorité, cédez le passage.",
      },
      {
        property: "og:title",
        content: "Panneaux de signalisation — L'Excellence Auto-École",
      },
      {
        property: "og:description",
        content: "Galerie interactive des panneaux du code de la route au Bénin.",
      },
    ],
  }),
  component: PanneauxPage,
});

type Section = {
  key: "danger" | "interdiction" | "obligation" | "indication" | "priorite";
  title: string;
  icon: React.ReactNode;
  desc: string;
  signs: SignData[];
};

const sections: Section[] = [
  {
    key: "danger",
    title: "Panneaux de danger",
    icon: <AlertTriangle className="size-4" />,
    desc: "Triangulaires à bord rouge. Ils annoncent un danger ou un obstacle sur la route.",
    signs: [
      { type: "danger", label: "Virage dangereux à droite", desc: "La route tourne brusquement vers la droite. Réduisez votre vitesse." },
      { type: "danger", label: "Virage dangereux à gauche", desc: "La route tourne brusquement vers la gauche. Ne vous rapprochez pas de la ligne médiane." },
      { type: "danger", label: "Dos d'âne", desc: "Ralentissez fortement. Franchissez lentement pour protéger les suspensions." },
      { type: "danger", label: "Passage à niveau", desc: "Préparez-vous à céder le passage aux trains. Ne vous engagez pas si la barrière descend." },
      { type: "danger", label: "Chaussée rétrécie", desc: "La largeur utile diminue. Cédez le passage si nécessaire." },
      { type: "danger", label: "Chaussée glissante", desc: "Adaptez votre allure. Évitez les freinages brusques en cas de pluie." },
    ],
  },
  {
    key: "interdiction",
    title: "Panneaux d'interdiction",
    icon: <Ban className="size-4" />,
    desc: "Circulaires à bord rouge. Ils interdisent une manœuvre ou un comportement.",
    signs: [
      { type: "interdiction", label: "Interdiction de tourner à gauche", desc: "Vous ne pouvez pas effectuer ce virage. Continuez tout droit." },
      { type: "interdiction", label: "Sens interdit", desc: "Ne pas entrer par cette voie. Contournement obligatoire." },
      { type: "interdiction", label: "Stationnement interdit", desc: "Vous ne pouvez ni vous arrêter ni stationner ici." },
      { type: "interdiction", label: "Limitation de vitesse — 50 km/h", desc: "Vitesse maximale autorisée dans cette zone. Radar en agglomération." },
      { type: "interdiction", label: "Limitation de vitesse — 30 km/h", desc: "Zone à circulation apaisée ou zone scolaire." },
    ],
  },
  {
    key: "obligation",
    title: "Panneaux d'obligation",
    icon: <CircleCheck className="size-4" />,
    desc: "Circulaires à fond bleu. Ils imposent une manœuvre précise.",
    signs: [
      { type: "obligation", label: "Virage à droite obligatoire", desc: "Vous devez tourner obligatoirement à droite." },
      { type: "obligation", label: "Contournement obligatoire", desc: "Contournez l'obstacle par la droite uniquement." },
    ],
  },
  {
    key: "indication",
    title: "Panneaux d'indication",
    icon: <Info className="size-4" />,
    desc: "Rectangulaires ou carrés. Ils informent sur les services ou la réglementation.",
    signs: [
      { type: "indication", label: "Sens unique", desc: "La circulation est autorisée uniquement dans le sens de la flèche." },
      { type: "indication", label: "Hôpital", desc: "Établissement de soins à proximité. Donnez la priorité aux ambulances." },
      { type: "indication", label: "Parking", desc: "Stationnement autorisé et aménagé dans cette zone." },
    ],
  },
  {
    key: "priorite",
    title: "Priorité & cédez le passage",
    icon: <ChevronRight className="size-4" />,
    desc: "Règles de priorité entre usagers de la route.",
    signs: [
      { type: "stop", label: "STOP", desc: "Arrêt complet obligatoire. Cédez le passage à tous les autres usagers." },
      { type: "priority", label: "Priorité ponctuelle", desc: "Vous avez la priorité sur la route qui se croise." },
      { type: "ceder", label: "Cédez le passage", desc: "Cédez le passage aux usagers arrivant à hauteur. Ralentissez et stoppez si nécessaire." },
    ],
  },
];

const iconMap: Record<string, React.ReactNode> = {
  "Virage dangereux à droite": <VirageDroiteIcon />,
  "Virage dangereux à gauche": <VirageGaucheIcon />,
  "Dos d'âne": <DosDaneIcon />,
  "Passage à niveau": <PassageNiveauIcon />,
  "Chaussée rétrécie": <RetrecissementIcon />,
  "Chaussée glissante": <ChausseeGlissanteIcon />,
  "Interdiction de tourner à gauche": <NoLeftTurnIcon />,
  "Sens interdit": <SensInterditIcon />,
  "Stationnement interdit": <StationnementInterditIcon />,
  "Limitation de vitesse — 50 km/h": <Vitesse50Icon />,
  "Limitation de vitesse — 30 km/h": <Vitesse30Icon />,
  "Virage à droite obligatoire": <TournerDroiteIcon />,
  "Contournement obligatoire": <ContournementIcon />,
  "Sens unique": <SensUniqueIcon />,
  "Hôpital": <HospitalIcon />,
  "Parking": <ParkingIcon />,
};

function PanneauxPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

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
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-charcoal/10 transition-colors hover:bg-white"
        >
          <ArrowLeft className="size-3" /> Accueil
        </Link>
      </nav>

      <header className="px-5 pb-2 pt-10">
        <div className="max-w-[60ch]">
          <span className="mb-4 inline-block rounded-sm bg-benin-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-benin-green">
            Apprentissage gratuit
          </span>
          <h1 className="mb-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Panneaux de signalisation
          </h1>
          <p className="text-pretty text-base text-charcoal/70">
            Maîtrisez les panneaux du code de la route avant même votre première
            leçon. Cliquez sur une famille pour découvrir les significations.
          </p>
        </div>
      </header>

      <main className="px-5 py-8">
        {/* Section selector */}
        <div className="mb-8 flex flex-wrap gap-2">
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() =>
                setActiveSection(activeSection === s.key ? null : s.key)
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeSection === s.key
                  ? "bg-benin-green text-white ring-1 ring-benin-green"
                  : "bg-white text-charcoal ring-1 ring-charcoal/10 hover:bg-zinc-50"
              }`}
            >
              {s.icon}
              {s.title}
            </button>
          ))}
        </div>

        {/* All sections or active one */}
        {(activeSection
          ? sections.filter((s) => s.key === activeSection)
          : sections
        ).map((s) => (
          <section key={s.key} className="mb-10">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="text-sm text-charcoal/60">{s.desc}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {s.signs.map((sign) => (
                <SignCard key={sign.label} sign={sign} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* CTA */}
      <section className="grid gap-4 px-5 pb-16 md:grid-cols-2">
        <div className="rounded-xl bg-benin-green/5 p-6 ring-1 ring-benin-green/20">
          <h3 className="text-base font-semibold text-charcoal">
            Quiz panneaux — testez-vous
          </h3>
          <p className="mt-1 text-sm text-charcoal/60">
            12 questions à choix multiples avec correction et explications.
          </p>
          <Link
            to="/quiz-panneaux"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-benin-green px-4 py-2.5 text-sm font-medium text-white ring-1 ring-benin-green"
          >
            Passer le quiz panneaux <ChevronRight className="size-4" />
          </Link>
        </div>
        <div className="rounded-xl bg-white p-6 ring-1 ring-charcoal/10">
          <h3 className="text-base font-semibold text-charcoal">
            Quiz d'évaluation par catégorie
          </h3>
          <p className="mt-1 text-sm text-charcoal/60">
            Évaluez votre niveau par type de permis (moto, voiture, poids lourd…).
          </p>
          <Link
            to="/quiz"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-charcoal px-4 py-2.5 text-sm font-medium text-white"
          >
            Quiz par catégorie <ChevronRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-charcoal/5 bg-zinc-50 px-5 py-10">
        <p className="text-[11px] leading-relaxed text-charcoal/50">
          © {new Date().getFullYear()} L'Excellence Auto-École. Référentiel basé
          sur la Convention de Vienne sur la signalisation routière.
        </p>
      </footer>
    </div>
  );
}

function SignCard({ sign }: { sign: SignData }) {
  return (
    <div className="flex gap-4 rounded-xl bg-white p-4 ring-1 ring-black/5">
      <div className="shrink-0">
        <div className="size-20">
          <SignShape type={sign.type} icon={iconMap[sign.label] ?? null} />
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{sign.label}</h3>
        <p className="mt-1 text-xs leading-relaxed text-charcoal/60">
          {sign.desc}
        </p>
      </div>
    </div>
  );
}
