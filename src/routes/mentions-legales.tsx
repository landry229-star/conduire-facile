import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — L'Excellence Auto-École" },
      {
        name: "description",
        content:
          "Éditeur, agrément ministériel, hébergement, propriété intellectuelle et conditions d'utilisation du site de L'Excellence Auto-École.",
      },
      { property: "og:title", content: "Mentions légales — L'Excellence Auto-École" },
      { property: "og:description", content: "Informations légales relatives au site et à l'auto-école." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MentionsPage,
});

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-benin-green">{titre}</h2>
      <div className="mt-2 space-y-2 text-xs leading-relaxed text-charcoal/70">{children}</div>
    </section>
  );
}

function MentionsPage() {
  return (
    <PublicShell>
      <main className="px-5 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>
        <p className="mt-2 text-xs text-charcoal/50">Dernière mise à jour : {new Date().getFullYear()}</p>

        <Bloc titre="Éditeur du site">
          <p>
            L'Excellence Auto-École — établissement d'enseignement de la conduite et de la sécurité routière.
            <br />
            Siège : Carrefour Sègbèya, avenue de la Marina, Akpakpa, Cotonou, République du Bénin.
            <br />
            Téléphone : +229 90 00 00 00 · Email : contact@excellence-autoecole.bj
            <br />
            Agrément Ministériel N°2024/MT-042 (Ministère des Infrastructures et des Transports).
            <br />
            RCCM : RB/COT/09 B 0000 · IFU : 0000000000000
          </p>
        </Bloc>

        <Bloc titre="Directeur de la publication">
          <p>Le directeur pédagogique de L'Excellence Auto-École.</p>
        </Bloc>

        <Bloc titre="Hébergement">
          <p>
            Le site est hébergé sur une infrastructure cloud mutualisée. Les données applicatives (comptes élèves,
            progression, résultats) sont stockées sur des serveurs gérés par notre prestataire technique.
          </p>
        </Bloc>

        <Bloc titre="Propriété intellectuelle">
          <p>
            L'ensemble des contenus du site — textes de cours, illustrations de panneaux, questions de quiz et
            d'examens blancs, logo et charte graphique — est la propriété exclusive de L'Excellence Auto-École.
            Toute reproduction, diffusion ou exploitation commerciale, totale ou partielle, sans autorisation
            écrite préalable est interdite.
          </p>
        </Bloc>

        <Bloc titre="Valeur des contenus pédagogiques">
          <p>
            Les cours, quiz, examens blancs et attestations générés sur ce site ont une valeur exclusivement
            pédagogique. <strong>L'attestation de réussite à l'examen blanc n'est pas un document officiel</strong>{" "}
            et ne remplace en aucun cas le permis de conduire délivré par les autorités béninoises compétentes.
          </p>
        </Bloc>

        <Bloc titre="Tarifs et prestations">
          <p>
            Les tarifs affichés sont indicatifs, exprimés en francs CFA, et peuvent évoluer. Ils ne comprennent pas
            les frais administratifs versés à l'administration (timbres, dossier, présentation à l'examen). Le
            contrat de formation signé en agence fait seul foi.
          </p>
        </Bloc>

        <Bloc titre="Responsabilité">
          <p>
            L'Excellence s'efforce de maintenir des informations exactes et à jour, notamment concernant la
            réglementation routière. Elle ne saurait toutefois être tenue responsable d'une inexactitude, d'une
            évolution réglementaire non encore répercutée, ou d'une indisponibilité temporaire du service.
          </p>
        </Bloc>

        <Bloc titre="Contact et réclamations">
          <p>
            Toute question ou réclamation peut être adressée par email à contact@excellence-autoecole.bj ou depuis
            la page <Link to="/contact" className="text-benin-green underline">Contact</Link>.
          </p>
        </Bloc>
      </main>
    </PublicShell>
  );
}
