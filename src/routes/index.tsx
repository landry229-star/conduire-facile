import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ClipboardCheck, Signpost } from "lucide-react";
import heroImage from "@/assets/hero-formation.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L'Excellence Auto-École — Permis de conduire au Bénin" },
      {
        name: "description",
        content:
          "Auto-école agréée au Bénin. Formation pour toutes catégories de permis : voiture (B), moto/zem (AM, A), poids lourd (C), bus (D), remorque (BE). Cotonou et Porto-Novo.",
      },
      { property: "og:title", content: "L'Excellence Auto-École — Permis de conduire au Bénin" },
      {
        property: "og:description",
        content:
          "Formation professionnelle pour toutes catégories de permis au Bénin. Code, conduite, examen blanc.",
      },
    ],
  }),
  component: Index,
});

type Category = {
  code: string;
  title: string;
  detail: string;
  price: string;
  tag: string;
  tagTone: "green" | "muted";
};

const categories: Category[] = [
  {
    code: "AM",
    title: "Cyclomoteur / Zémidjan",
    detail: "≤ 50 cm³, dès 14 ans",
    price: "45.000 FCFA",
    tag: "Populaire",
    tagTone: "green",
  },
  {
    code: "A1",
    title: "Moto légère",
    detail: "125 cm³, dès 16 ans",
    price: "70.000 FCFA",
    tag: "Dispo",
    tagTone: "green",
  },
  {
    code: "A2",
    title: "Moto intermédiaire",
    detail: "≤ 35 kW, dès 18 ans",
    price: "85.000 FCFA",
    tag: "Dispo",
    tagTone: "green",
  },
  {
    code: "A",
    title: "Moto toutes cylindrées",
    detail: "Sans limite de puissance",
    price: "110.000 FCFA",
    tag: "Dispo",
    tagTone: "green",
  },
  {
    code: "B1",
    title: "Quadricycle lourd",
    detail: "Voiturette, dès 16 ans",
    price: "90.000 FCFA",
    tag: "Dispo",
    tagTone: "green",
  },
  {
    code: "B",
    title: "Voiture légère",
    detail: "Manuelle ou automatique",
    price: "150.000 FCFA",
    tag: "Populaire",
    tagTone: "green",
  },
  {
    code: "BE",
    title: "Voiture + remorque",
    detail: "Remorque > 750 kg",
    price: "95.000 FCFA",
    tag: "Dispo",
    tagTone: "green",
  },
  {
    code: "C1",
    title: "Camion léger",
    detail: "3,5 à 7,5 tonnes",
    price: "180.000 FCFA",
    tag: "Dispo",
    tagTone: "green",
  },
  {
    code: "C",
    title: "Poids lourd",
    detail: "> 7,5 tonnes, marchandises",
    price: "250.000 FCFA",
    tag: "Sur devis",
    tagTone: "muted",
  },
  {
    code: "CE",
    title: "Poids lourd + remorque",
    detail: "Semi-remorque, ensemble routier",
    price: "300.000 FCFA",
    tag: "Sur devis",
    tagTone: "muted",
  },
  {
    code: "D1",
    title: "Minibus",
    detail: "Jusqu'à 16 passagers",
    price: "260.000 FCFA",
    tag: "Dispo",
    tagTone: "green",
  },
  {
    code: "D",
    title: "Bus / Transport en commun",
    detail: "> 8 passagers, voyageurs",
    price: "320.000 FCFA",
    tag: "Sur devis",
    tagTone: "muted",
  },
  {
    code: "DE",
    title: "Bus + remorque",
    detail: "Autocar articulé",
    price: "360.000 FCFA",
    tag: "Sur devis",
    tagTone: "muted",
  },
  {
    code: "T",
    title: "Tracteur agricole",
    detail: "Engins agricoles et forestiers",
    price: "120.000 FCFA",
    tag: "Dispo",
    tagTone: "green",
  },
];

const method = [
  {
    n: "01",
    title: "Code de la Route",
    body: "Salles climatisées et simulateurs interactifs pour un apprentissage théorique sans faille.",
  },
  {
    n: "02",
    title: "Conduite Accompagnée",
    body: "Pratique sur véhicules récents avec nos moniteurs certifiés pour une maîtrise parfaite.",
  },
  {
    n: "03",
    title: "Examen Blanc",
    body: "Simulation en conditions réelles avec un examinateur senior pour garantir votre succès.",
  },
];

const testimonials = [
  {
    name: "Afiwa K.",
    role: "Étudiante, Cotonou",
    quote:
      "Permis B obtenu en 4 semaines. Les moniteurs sont patients et la méthode très claire.",
  },
  {
    name: "Boris A.",
    role: "Conducteur Zem",
    quote:
      "J'ai passé mon AM ici, accompagnement nickel et tarif honnête. Je recommande à tous mes collègues.",
  },
];

const faqs = [
  {
    q: "Quels documents pour s'inscrire ?",
    a: "Pièce d'identité, certificat médical, deux photos d'identité et le paiement de la première tranche.",
  },
  {
    q: "Combien de temps dure la formation ?",
    a: "Entre 3 et 8 semaines selon la catégorie et votre rythme. Sessions intensives possibles.",
  },
  {
    q: "Acceptez-vous le paiement échelonné ?",
    a: "Oui, jusqu'à trois tranches sans frais supplémentaires, à discuter à l'inscription.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-sm bg-benin-green">
            <span className="block size-2 rounded-full bg-benin-yellow" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-tight">
            L'Excellence
          </span>
        </a>
        <div className="flex items-center gap-2">
          <Link
            to="/panneaux"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-benin-red ring-1 ring-benin-red/30 transition-colors hover:bg-benin-red/5"
          >
            <Signpost className="size-3" /> Panneaux
          </Link>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-benin-green ring-1 ring-benin-green/30 transition-colors hover:bg-benin-green/5"
          >
            <ClipboardCheck className="size-3" /> Quiz
          </Link>
          <a
            href="#contact"
            className="rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-charcoal/10 transition-colors hover:bg-white"
          >
            S'inscrire
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section id="top" className="px-5 pb-2 pt-10">
        <div className="max-w-[56ch]">
          <span className="mb-4 inline-block rounded-sm bg-benin-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-benin-green">
            Auto-école agréée au Bénin
          </span>
          <h1 className="mb-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Maîtrisez la route avec assurance et rigueur.
          </h1>
          <p className="mb-8 text-pretty text-base text-charcoal/70">
            Une formation d'élite pour toutes les catégories de permis, du
            cyclomoteur au poids lourd. Cotonou, Calavi et Porto-Novo.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-benin-green px-4 py-3 text-sm font-medium text-white ring-1 ring-benin-green transition-transform active:scale-[0.98] sm:w-auto"
            >
              S'inscrire maintenant
              <ArrowRight className="size-4 shrink-0" />
            </a>
            <a
              href="#categories"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-medium text-charcoal ring-1 ring-charcoal/10 sm:w-auto"
            >
              Voir nos catégories
            </a>
          </div>
        </div>
      </section>

      {/* Hero image */}
      <div className="px-5 pt-8">
        <img
          src={heroImage}
          alt="Moniteur remettant les clés à une élève après une leçon de conduite à Cotonou"
          width={1280}
          height={800}
          className="aspect-[16/10] w-full rounded-xl object-cover outline outline-1 -outline-offset-1 outline-black/5"
        />
      </div>

      {/* Categories */}
      <section id="categories" className="px-5 py-14">
        <div className="mb-8">
          <h2 className="mb-2 text-xl font-semibold md:text-2xl">Nos catégories</h2>
          <div className="h-1 w-12 bg-benin-yellow" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between rounded-lg bg-white p-4 ring-1 ring-black/5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="grid size-10 place-items-center rounded-md border border-zinc-100 bg-zinc-50 text-sm font-semibold text-benin-red">
                  {c.code}
                </div>
                <div>
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-charcoal/50">{c.detail}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{c.price}</div>
                <div
                  className={`text-[10px] font-medium uppercase ${
                    c.tagTone === "green" ? "text-benin-green" : "text-charcoal/40"
                  }`}
                >
                  {c.tag}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl bg-benin-green/5 p-5 ring-1 ring-benin-green/20 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-semibold text-charcoal">
              Pas sûr de votre niveau ?
            </div>
            <p className="mt-1 text-xs text-charcoal/60">
              Faites le quiz d'évaluation gratuit pour votre catégorie avant de
              vous inscrire.
            </p>
          </div>
          <Link
            to="/quiz"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-benin-green px-4 py-2.5 text-sm font-medium text-white ring-1 ring-benin-green"
          >
            <ClipboardCheck className="size-4" /> Passer le quiz
          </Link>
        </div>

        <p className="mt-6 text-[11px] italic text-charcoal/50">
          Tarifs indicatifs incluant frais de dossier et fournitures pédagogiques.
        </p>
      </section>


      {/* Methodology */}
      <section className="bg-zinc-900 px-5 py-16 text-ivory">
        <div className="mx-auto max-w-[56ch]">
          <h2 className="mb-2 text-2xl font-semibold">La méthode d'excellence</h2>
          <div className="mb-10 h-1 w-12 bg-benin-yellow" />
          <div className="space-y-8">
            {method.map((m) => (
              <div key={m.n} className="flex gap-4">
                <span className="text-sm font-medium text-benin-yellow">{m.n}</span>
                <div>
                  <h3 className="mb-2 text-base font-medium">{m.title}</h3>
                  <p className="text-sm leading-relaxed text-ivory/60">{m.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-14">
        <h2 className="mb-2 text-xl font-semibold md:text-2xl">Ils ont réussi</h2>
        <div className="mb-8 h-1 w-12 bg-benin-yellow" />
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-xl bg-white p-5 ring-1 ring-black/5"
            >
              <blockquote className="text-sm leading-relaxed text-charcoal/80">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2 text-xs">
                <span className="font-semibold">{t.name}</span>
                <span className="text-charcoal/40">— {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-14">
        <h2 className="mb-2 text-xl font-semibold md:text-2xl">Questions fréquentes</h2>
        <div className="mb-8 h-1 w-12 bg-benin-yellow" />
        <div className="divide-y divide-charcoal/10 rounded-xl bg-white ring-1 ring-black/5">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {f.q}
                <span className="ml-4 text-benin-green transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/60">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-5 py-16">
        <div className="rounded-xl bg-white p-6 ring-1 ring-black/5">
          <h2 className="mb-2 text-lg font-semibold">Réservez votre essai gratuit</h2>
          <p className="mb-6 text-sm text-charcoal/60">
            Un conseiller vous rappelle sous 24h.
          </p>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              form.reset();
              alert("Merci, nous vous recontactons sous 24h.");
            }}
          >
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
                Nom complet
              </label>
              <input
                required
                type="text"
                className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm outline-none ring-1 ring-charcoal/10 focus:ring-benin-green"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
                Téléphone
              </label>
              <input
                required
                type="tel"
                placeholder="+229 ..."
                className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm outline-none ring-1 ring-charcoal/10 focus:ring-benin-green"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
                Catégorie de permis
              </label>
              <select
                className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm outline-none ring-1 ring-charcoal/10 focus:ring-benin-green"
                defaultValue="B"
              >
                {categories.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
                Localisation
              </label>
              <select className="w-full rounded-md bg-zinc-50 px-3 py-2 text-sm outline-none ring-1 ring-charcoal/10 focus:ring-benin-green">
                <option>Cotonou - Akpakpa</option>
                <option>Cotonou - Calavi</option>
                <option>Porto-Novo</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-benin-red py-3 text-sm font-medium text-white transition-transform active:scale-[0.98]"
            >
              <Check className="size-4" /> Envoyer ma demande
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-charcoal/5 bg-zinc-50 px-5 py-10">
        <div className="mb-6 flex items-center gap-2">
          <span className="size-4 bg-benin-green" />
          <span className="size-4 bg-benin-yellow" />
          <span className="size-4 bg-benin-red" />
        </div>
        <p className="text-[11px] leading-relaxed text-charcoal/50">
          © {new Date().getFullYear()} L'Excellence Auto-École. Agrément Ministériel
          N°2024/MT-042.
          <br />
          Cotonou, République du Bénin · +229 90 00 00 00
        </p>
      </footer>
    </div>
  );
}
