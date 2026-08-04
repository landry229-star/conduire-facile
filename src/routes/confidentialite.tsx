import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — L'Excellence Auto-École" },
      {
        name: "description",
        content:
          "Quelles données personnelles nous collectons, pourquoi, combien de temps nous les conservons et comment exercer vos droits auprès de L'Excellence Auto-École.",
      },
      { property: "og:title", content: "Politique de confidentialité — L'Excellence Auto-École" },
      { property: "og:description", content: "Traitement des données personnelles des élèves et visiteurs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfidentialitePage,
});

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-benin-green">{titre}</h2>
      <div className="mt-2 space-y-2 text-xs leading-relaxed text-charcoal/70">{children}</div>
    </section>
  );
}

function ConfidentialitePage() {
  return (
    <PublicShell>
      <main className="px-5 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Politique de confidentialité</h1>
        <p className="mt-2 text-xs text-charcoal/50">Dernière mise à jour : {new Date().getFullYear()}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/60">
          L'Excellence Auto-École traite vos données personnelles dans le respect de la loi n°2017-20 portant code
          du numérique en République du Bénin. Cette page explique simplement ce que nous collectons et pourquoi.
        </p>

        <Bloc titre="Données collectées">
          <ul className="list-disc space-y-1 pl-4">
            <li>Demande d'inscription : nom, téléphone, email, catégorie de permis, ville, mode de formation.</li>
            <li>Compte élève : nom complet, email et/ou numéro de téléphone, photo de profil facultative.</li>
            <li>
              Formation : progression dans les leçons, résultats de quiz et d'examens blancs, compétences validées,
              heures de conduite, échéances de paiement.
            </li>
            <li>Dossier administratif : pièces justificatives que vous nous transmettez pour votre inscription.</li>
            <li>Données techniques : journaux de connexion nécessaires à la sécurité du service.</li>
          </ul>
        </Bloc>

        <Bloc titre="Finalités">
          <p>
            Gérer votre inscription et votre formation, suivre votre progression, planifier vos leçons de conduite,
            suivre vos paiements, constituer votre dossier de présentation à l'examen et vous contacter (rappels de
            séance, résultats, informations administratives).
          </p>
        </Bloc>

        <Bloc titre="Base légale">
          <p>
            L'exécution du contrat de formation, votre consentement pour les demandes d'inscription envoyées depuis
            le site, et nos obligations légales vis-à-vis de l'administration des transports.
          </p>
        </Bloc>

        <Bloc titre="Destinataires">
          <p>
            Seuls les personnels habilités de l'auto-école (direction, secrétariat, moniteurs assignés) accèdent à
            vos données. Certaines informations sont transmises à l'administration compétente lors de la
            présentation à l'examen. Nous ne vendons ni ne louons vos données à des tiers.
          </p>
        </Bloc>

        <Bloc titre="Durée de conservation">
          <p>
            Demandes d'inscription non converties : 12 mois. Dossier élève et résultats de formation : 5 ans après
            la fin de la formation, conformément aux obligations de traçabilité. Comptes inactifs : suppression sur
            demande à tout moment.
          </p>
        </Bloc>

        <Bloc titre="Sécurité">
          <p>
            Les accès sont protégés par authentification (mot de passe, code SMS ou compte Google) et les données
            sont cloisonnées : un élève ne peut consulter que son propre dossier. Les échanges sont chiffrés.
          </p>
        </Bloc>

        <Bloc titre="Cookies et stockage local">
          <p>
            Le site n'utilise pas de cookies publicitaires. Nous utilisons uniquement le stockage local du
            navigateur pour maintenir votre session ouverte et mémoriser votre progression hors connexion.
          </p>
        </Bloc>

        <Bloc titre="Vos droits">
          <p>
            Vous pouvez accéder à vos données, les rectifier, en demander la suppression ou la portabilité, et vous
            opposer à certains traitements. Écrivez à contact@excellence-autoecole.bj ou passez en agence muni d'une
            pièce d'identité. Réponse sous 30 jours. Voir la page{" "}
            <Link to="/contact" className="text-benin-green underline">Contact</Link>.
          </p>
        </Bloc>

        <Bloc titre="Mineurs">
          <p>
            Pour les élèves de moins de 18 ans (catégories AM et A1 notamment), l'inscription et le traitement des
            données sont soumis à l'autorisation d'un parent ou tuteur légal.
          </p>
        </Bloc>
      </main>
    </PublicShell>
  );
}
