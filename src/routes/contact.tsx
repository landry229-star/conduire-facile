import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
    head: () => ({
        meta: [
            { title: "Contact & agences — L'Excellence Auto-École" },
            {
                name: "description",
                content:
                    "Nos agences à Cotonou (Akpakpa, Calavi) et Porto-Novo : adresses, horaires, téléphone et WhatsApp de L'Excellence Auto-École.",
            },
            { property: "og:title", content: "Contact & agences — L'Excellence Auto-École" },
            {
                property: "og:description",
                content: "Adresses, horaires et contacts de nos agences au Bénin.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary" },
        ],
    }),
    component: ContactPage,
});

const agences = [
    {
        ville: "Cotonou — Akpakpa",
        adresse: "Carrefour Sègbèya, avenue de la Marina, Cotonou",
        tel: "+229 90 00 00 00",
        horaires: "Lun–Ven 8h–18h · Sam 8h–13h",
        services: ["Cours de code en salle", "Conduite B / BE", "Moto AM, A1, A"],
    },
    {
        ville: "Abomey-Calavi",
        adresse: "Route de Calavi, non loin du carrefour Tankpè",
        tel: "+229 91 00 00 00",
        horaires: "Lun–Ven 8h–18h · Sam 8h–13h",
        services: ["Cours de code en salle", "Conduite B", "Poids lourd C / CE"],
    },
    {
        ville: "Porto-Novo",
        adresse: "Quartier Djègan-Kpèvi, près du marché Ouando",
        tel: "+229 96 00 00 00",
        horaires: "Lun–Ven 8h30–17h30 · Sam 9h–13h",
        services: ["Cours de code en salle", "Conduite B", "Transport D1 / D"],
    },
];

function ContactPage() {
    return (
        <PublicShell>
            <main className="px-5 py-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-benin-green">
                    Nous joindre
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">Contact & agences</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal/60">
                    Passez nous voir, appelez-nous ou écrivez sur WhatsApp. Nos conseillers
                    répondent en français, fon et yoruba.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                    <a
                        href="tel:+22990000000"
                        className="inline-flex items-center gap-2 rounded-md bg-benin-green px-4 py-2.5 text-sm font-medium text-white"
                    >
                        <Phone className="size-4" /> Appeler
                    </a>
                    <a
                        href="https://wa.me/22990000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium ring-1 ring-charcoal/15 hover:bg-white"
                    >
                        <MessageCircle className="size-4" /> WhatsApp
                    </a>
                    <a
                        href="mailto:contact@excellence-autoecole.bj"
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium ring-1 ring-charcoal/15 hover:bg-white"
                    >
                        <Mail className="size-4" /> Email
                    </a>
                </div>

                <section className="mt-10 grid gap-4 md:grid-cols-3">
                    {agences.map((a) => (
                        <article
                            key={a.ville}
                            className="rounded-lg bg-white p-5 ring-1 ring-charcoal/10"
                        >
                            <h2 className="text-base font-semibold">{a.ville}</h2>
                            <p className="mt-3 flex items-start gap-2 text-xs text-charcoal/70">
                                <MapPin className="mt-0.5 size-3.5 shrink-0 text-benin-red" />{" "}
                                {a.adresse}
                            </p>
                            <p className="mt-2 flex items-start gap-2 text-xs text-charcoal/70">
                                <Clock className="mt-0.5 size-3.5 shrink-0 text-benin-green" />{" "}
                                {a.horaires}
                            </p>
                            <p className="mt-2 flex items-start gap-2 text-xs text-charcoal/70">
                                <Phone className="mt-0.5 size-3.5 shrink-0 text-charcoal/40" />
                                <a
                                    href={`tel:${a.tel.replace(/\s/g, "")}`}
                                    className="hover:underline"
                                >
                                    {a.tel}
                                </a>
                            </p>
                            <ul className="mt-4 space-y-1 border-t border-charcoal/5 pt-3">
                                {a.services.map((s) => (
                                    <li key={s} className="text-[11px] text-charcoal/60">
                                        · {s}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </section>

                <section className="mt-10 rounded-lg bg-benin-green/5 p-5 ring-1 ring-benin-green/20">
                    <h2 className="text-sm font-semibold">Vous voulez vous inscrire ?</h2>
                    <p className="mt-1 text-xs text-charcoal/60">
                        Remplissez le formulaire d'inscription sur la page d'accueil : nous vous
                        rappelons sous 24 h ouvrées.
                    </p>
                    <a
                        href="/#contact"
                        className="mt-3 inline-flex rounded-md bg-benin-red px-4 py-2 text-xs font-medium text-white"
                    >
                        Formulaire d'inscription
                    </a>
                </section>
            </main>
        </PublicShell>
    );
}
