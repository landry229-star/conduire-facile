import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";
import { Award, Users, Car, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — L'Excellence Auto-École au Bénin" },
      {
        name: "description",
        content:
          "Depuis 2009, L'Excellence forme des conducteurs responsables au Bénin : moniteurs agréés, véhicules double commande, 98 % de réussite au code.",
      },
      { property: "og:title", content: "À propos — L'Excellence Auto-École" },
      { property: "og:description", content: "Notre histoire, notre équipe et notre flotte au service de votre permis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AProposPage,
});

const chiffres = [
  { icon: Users, value: "12 400+", label: "élèves formés depuis 2009" },
  { icon: Award, value: "98 %", label: "de réussite à l'examen du code" },
  { icon: Car, value: "24", label: "véhicules à double commande" },
  { icon: ShieldCheck, value: "18", label: "moniteurs agréés par le Ministère" },
];

const equipe = [
  { nom: "Rachidou A.", role: "Directeur pédagogique", detail: "22 ans d'expérience, formateur de moniteurs." },
  { nom: "Sylvie H.", role: "Responsable code", detail: "Anime les salles de code à Cotonou et Porto-Novo." },
  { nom: "Bienvenu T.", role: "Moniteur poids lourd", detail: "Spécialiste C, CE et transport de marchandises." },
  { nom: "Grâce D.", role: "Monitrice moto", detail: "Formation AM, A1, A et sécurité des zémidjans." },
];

function AProposPage() {
  return (
    <PublicShell>
      <main className="px-5 py-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-benin-green">Qui sommes-nous</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Former des conducteurs responsables au Bénin
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/60">
          L'Excellence Auto-École est née en 2009 à Cotonou d'un constat simple : la route béninoise exige plus
          qu'un permis, elle exige des réflexes. Nous formons chaque année des centaines d'élèves — futurs
          conducteurs de voiture, conducteurs de zémidjan, chauffeurs de poids lourd et de transport en commun —
          avec la même exigence : comprendre avant de mémoriser, maîtriser avant de passer l'examen.
        </p>

        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {chiffres.map((c) => (
            <div key={c.label} className="rounded-lg bg-white p-4 ring-1 ring-charcoal/10">
              <c.icon className="size-4 text-benin-green" />
              <p className="mt-2 text-xl font-semibold">{c.value}</p>
              <p className="mt-1 text-[11px] leading-snug text-charcoal/60">{c.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Notre approche</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <article className="rounded-lg bg-white p-5 ring-1 ring-charcoal/10">
              <h3 className="text-sm font-semibold">1. Le code, en salle ou en ligne</h3>
              <p className="mt-2 text-xs leading-relaxed text-charcoal/60">
                25 leçons illustrées, quiz corrigés et examens blancs chronométrés. Vous choisissez la salle avec
                un moniteur ou la plateforme en ligne, à votre rythme.
              </p>
            </article>
            <article className="rounded-lg bg-white p-5 ring-1 ring-charcoal/10">
              <h3 className="text-sm font-semibold">2. La conduite, pas à pas</h3>
              <p className="mt-2 text-xs leading-relaxed text-charcoal/60">
                Chaque leçon valide des compétences précises (créneau, démarrage en côte, ronds-points) consignées
                dans votre livret de conduite numérique.
              </p>
            </article>
            <article className="rounded-lg bg-white p-5 ring-1 ring-charcoal/10">
              <h3 className="text-sm font-semibold">3. L'examen, sans surprise</h3>
              <p className="mt-2 text-xs leading-relaxed text-charcoal/60">
                Nous ne présentons un élève que lorsque ses résultats blancs sont stables. C'est ce qui explique
                notre taux de réussite.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">L'équipe</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {equipe.map((m) => (
              <article key={m.nom} className="rounded-lg bg-white p-5 ring-1 ring-charcoal/10">
                <div className="mb-3 grid size-10 place-items-center rounded-full bg-benin-green/10 text-sm font-semibold text-benin-green">
                  {m.nom.charAt(0)}
                </div>
                <p className="text-sm font-semibold">{m.nom}</p>
                <p className="text-[11px] font-medium text-benin-red">{m.role}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-charcoal/60">{m.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-lg bg-charcoal p-6 text-white">
          <h2 className="text-lg font-semibold">Agrément et conformité</h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/70">
            L'Excellence Auto-École est agréée par le Ministère des Infrastructures et des Transports sous le
            numéro N°2024/MT-042. Nos véhicules sont assurés, contrôlés techniquement et équipés de la double
            commande. Nos moniteurs détiennent le certificat d'aptitude à l'enseignement de la conduite.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-md bg-benin-yellow px-4 py-2 text-xs font-semibold text-charcoal"
          >
            Venir nous rencontrer
          </Link>
        </section>
      </main>
    </PublicShell>
  );
}
