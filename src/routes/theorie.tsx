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
  Lightbulb,
  Lock,
  PlayCircle,
  RotateCcw,
  Signpost,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import {
  ChausseeGlissanteIcon,
  DosDaneIcon,
  HospitalIcon,
  ParkingIcon,
  SensInterditIcon,
  SignShape,
  StationnementInterditIcon,
  TournerDroiteIcon,
  VirageDroiteIcon,
  Vitesse30Icon,
  Vitesse50Icon,
} from "@/components/TrafficSign";

export const Route = createFileRoute("/theorie")({
  head: () => ({
    meta: [
      { title: "Phase théorique en ligne — L'Excellence Auto-École" },
      {
        name: "description",
        content:
          "Cours de code de la route enrichis : leçons illustrées, résumés, points clés, exemples et erreurs à éviter. Progression sauvegardée.",
      },
    ],
  }),
  component: Theorie,
});

type Lesson = {
  id: string;
  title: string;
  duration: string;
  tldr: string;
  body: string[];
  keyPoints: string[];
  examples?: string[];
  mistakes?: string[];
  illustration?: "signs-danger" | "signs-interdiction" | "signs-obligation" | "signs-priority" | "speed" | "overtake";
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
    summary: "Cadre légal, usagers et documents obligatoires au Bénin.",
    lessons: [
      {
        id: "m1l1",
        title: "Le code de la route au Bénin",
        duration: "10 min",
        tldr: "Le code béninois (décret n°96-415) fixe les règles pour tous les usagers. Permis obligatoire, ceinture à l'avant comme à l'arrière, casque pour tout deux-roues.",
        body: [
          "Le code de la route en République du Bénin est régi par le décret n°96-415 du 4 octobre 1996, complété par l'arrêté interministériel n°2018-022. Il s'applique sur l'ensemble du territoire national, y compris les pistes rurales, et engage la responsabilité civile et pénale de chaque conducteur.",
          "Tout véhicule à moteur doit être conduit par une personne titulaire d'un permis valide de la catégorie correspondante. La conduite sans permis est punie d'une amende de 25 000 à 100 000 FCFA et peut entraîner une peine d'emprisonnement en cas de récidive ou d'accident corporel.",
          "Les contrôles routiers sont effectués par la Police Républicaine et la Gendarmerie Nationale. Tout refus d'obtempérer est considéré comme un délit grave. En cas d'infraction constatée, le conducteur peut se voir retirer le permis sur-le-champ, avec convocation devant le tribunal compétent.",
        ],
        keyPoints: [
          "Permis valide obligatoire pour chaque catégorie de véhicule.",
          "Âge minimum : 14 ans (AM), 16 ans (A1), 18 ans (B, A2), 21 ans (C, D).",
          "Ceinture obligatoire à l'avant ET à l'arrière, conducteur et passagers.",
          "Casque homologué obligatoire pour conducteur ET passager de deux-roues.",
          "Refus d'obtempérer = délit, peine de prison possible.",
        ],
        examples: [
          "Un conducteur sans permis arrêté sur le boulevard Saint-Michel : 50 000 FCFA d'amende + véhicule immobilisé.",
          "Passager arrière sans ceinture sur la voie Cotonou–Porto-Novo : amende solidaire au conducteur.",
        ],
        mistakes: [
          "Croire qu'un récépissé suffit : seul le permis définitif est valable au-delà de 3 mois.",
          "Penser que la ceinture n'est obligatoire qu'à l'avant — c'est faux depuis 2018.",
        ],
      },
      {
        id: "m1l2",
        title: "Les usagers de la route",
        duration: "8 min",
        tldr: "La route est partagée. Priorité aux piétons engagés, 1 m de distance pour dépasser un deux-roues, vigilance permanente face aux zémidjans.",
        body: [
          "La route est un espace partagé entre véhicules motorisés, deux-roues, cyclistes, piétons, charrettes et animaux. Chaque usager dispose de droits, mais doit respecter des devoirs. Le conducteur d'un véhicule à moteur est considéré comme l'usager le plus puissant : sa responsabilité est donc renforcée.",
          "Les usagers vulnérables (piétons, enfants, personnes âgées, personnes à mobilité réduite, cyclistes, conducteurs de deux-roues) doivent faire l'objet d'une attention particulière. Le code impose au conducteur d'anticiper leur comportement et de réduire sa vitesse à leur proximité.",
          "Au Bénin, les zémidjans (taxis-motos) sont nombreux en milieu urbain. Ils peuvent zigzaguer, freiner brusquement ou s'arrêter sans signal. Le conducteur prudent maintient une distance de sécurité accrue et signale clairement chacune de ses intentions.",
        ],
        keyPoints: [
          "Priorité absolue au piéton engagé sur un passage protégé.",
          "Distance latérale minimale de 1 m pour dépasser un deux-roues, 1,5 m hors agglomération.",
          "Ralentir près des écoles, marchés, arrêts de bus.",
          "Anticiper les changements de trajectoire des zémidjans.",
          "Klaxon limité aux situations de danger réel — pas pour saluer.",
        ],
        examples: [
          "Devant le marché Dantokpa : ralentir à 20 km/h, vigilance maximale face aux piétons et porteurs.",
          "Dépassement d'un zémidjan : déboîter franchement, laisser 1 m, ne jamais frôler.",
        ],
        mistakes: [
          "Klaxonner pour faire avancer un piéton engagé : interdit et dangereux.",
          "Dépasser un deux-roues sans changer de file : risque de collision latérale.",
        ],
      },
      {
        id: "m1l3",
        title: "Documents obligatoires à bord",
        duration: "6 min",
        tldr: "Quatre documents à présenter immédiatement : permis (original), carte grise, assurance en cours, visite technique. Pas de photocopie.",
        body: [
          "Tout conducteur doit pouvoir présenter immédiatement, à toute réquisition des forces de l'ordre, quatre documents essentiels : le permis de conduire original, la carte grise du véhicule, l'attestation d'assurance en cours de validité, et le procès-verbal de visite technique pour les véhicules concernés.",
          "L'assurance au tiers est le minimum légal au Bénin. La vignette doit être collée de manière visible sur le pare-brise avant. Conduire sans assurance valide expose à une amende lourde et à la mise en fourrière immédiate du véhicule.",
          "La visite technique est obligatoire tous les 2 ans pour les véhicules légers de plus de 4 ans, et annuelle pour les véhicules utilitaires, taxis et poids lourds. Elle vérifie freins, éclairage, pneumatiques, direction et émissions.",
        ],
        keyPoints: [
          "Permis : ORIGINAL uniquement, jamais une photocopie.",
          "Carte grise au nom du conducteur ou justificatif de prêt.",
          "Vignette d'assurance visible sur le pare-brise.",
          "Visite technique : 2 ans véhicules légers, 1 an utilitaires/PL.",
          "Triangle de signalisation et gilet réfléchissant recommandés à bord.",
        ],
        mistakes: [
          "Laisser le permis à la maison « pour ne pas le perdre » : amende garantie.",
          "Rouler avec une assurance expirée d'un jour : véhicule en fourrière.",
        ],
      },
    ],
  },
  {
    id: "m2",
    title: "Module 2 — Panneaux et signalisation",
    summary: "Reconnaître la forme, la couleur et le sens de chaque panneau.",
    lessons: [
      {
        id: "m2l1",
        title: "Panneaux de danger",
        duration: "9 min",
        tldr: "Triangle pointe en haut, bord rouge sur fond blanc. Annoncent un danger à 150 m (hors agglo) ou 50 m (agglo). Ralentir systématiquement.",
        body: [
          "Les panneaux de danger sont reconnaissables à leur forme triangulaire, pointe vers le haut, avec un bord rouge épais sur fond blanc. Le pictogramme noir au centre indique la nature précise du danger : virage, dos-d'âne, chaussée glissante, passage à niveau, traversée d'animaux, etc.",
          "Leur fonction est d'avertir le conducteur d'un danger à venir afin qu'il adapte son comportement. La distance d'implantation est normalisée : environ 150 mètres avant le danger en rase campagne, 50 mètres en agglomération. Cette distance laisse le temps de freiner ou de modifier sa trajectoire.",
          "À la vue d'un panneau de danger, le réflexe est triple : lever le pied, vérifier ses rétroviseurs, anticiper la zone dangereuse. Aucun panneau n'est posé inutilement — chacun signale un risque réel qui a justifié son installation.",
        ],
        keyPoints: [
          "Forme : triangle pointe en haut, bord rouge.",
          "Distance : 150 m (rase campagne), 50 m (agglomération).",
          "Réaction : ralentir + vérifier rétros + anticiper.",
          "Cas particuliers : passage à niveau, écoles, animaux sauvages.",
        ],
        illustration: "signs-danger",
        examples: [
          "Triangle avec courbe : virage dangereux, ralentir avant d'y entrer.",
          "Triangle avec deux bosses : dos-d'âne, ralentir à 30 km/h max.",
        ],
      },
      {
        id: "m2l2",
        title: "Panneaux d'interdiction",
        duration: "10 min",
        tldr: "Cercle rouge sur fond blanc. Interdisent une manœuvre ou une catégorie jusqu'au prochain carrefour ou panneau de fin.",
        body: [
          "Les panneaux d'interdiction sont circulaires, avec un bord rouge épais sur fond blanc. Le pictogramme noir au centre précise la nature de l'interdiction : sens interdit, stationnement, dépassement, vitesse maximale, accès à certaines catégories de véhicules.",
          "Une interdiction s'applique à partir du panneau et reste valable jusqu'au prochain carrefour, sauf panneau de fin d'interdiction (cercle blanc barré en noir ou en gris) ou indication contraire. Une nouvelle interdiction posée plus loin remplace la précédente.",
          "Le non-respect d'un panneau d'interdiction constitue une infraction. Selon sa gravité, elle peut être sanctionnée d'une simple amende (stationnement) ou d'un retrait de points et d'une convocation au tribunal (sens interdit, dépassement dangereux).",
        ],
        keyPoints: [
          "Forme : cercle, bord rouge, fond blanc.",
          "Validité : jusqu'au prochain carrefour ou panneau de fin.",
          "Limitation de vitesse : nombre noir dans le cercle rouge.",
          "Sens interdit : disque rouge plein barré de blanc.",
          "Stationnement interdit : cercle rouge barré sur fond bleu.",
        ],
        illustration: "signs-interdiction",
        mistakes: [
          "Croire qu'une limitation de 50 dure jusqu'à la prochaine ville : faux, elle se termine au premier carrefour.",
          "Stationner sous un panneau d'interdiction « juste 5 minutes » : amende immédiate.",
        ],
      },
      {
        id: "m2l3",
        title: "Panneaux d'obligation et d'indication",
        duration: "7 min",
        tldr: "Ronds bleus = obligation. Rectangles bleus ou verts = indication ou service. Pas de bord rouge.",
        body: [
          "Les panneaux d'obligation sont ronds, à fond bleu avec un pictogramme blanc. Ils imposent une action : direction obligatoire, voie réservée à une catégorie d'usagers, contournement obligatoire d'un obstacle. Leur non-respect est sanctionné comme une interdiction.",
          "Les panneaux d'indication sont rectangulaires, à fond bleu ou vert. Ils ne créent ni obligation ni interdiction : ils renseignent. Bleu pour les services (parking, hôpital, station-service, téléphone), vert pour les itinéraires routiers principaux et les directions interurbaines.",
          "La signalisation directionnelle utilise également des rectangles avec flèches, indiquant les villes desservies et les distances. Au Bénin, les axes majeurs (Cotonou-Porto-Novo, Cotonou-Bohicon) sont signalés en vert.",
        ],
        keyPoints: [
          "Rond bleu = obligation à respecter.",
          "Rectangle bleu = service ou indication locale.",
          "Rectangle vert = itinéraire interurbain principal.",
          "Pictogramme blanc systématique sur fond bleu/vert.",
        ],
        illustration: "signs-obligation",
      },
      {
        id: "m2l4",
        title: "STOP, cédez le passage et priorités",
        duration: "8 min",
        tldr: "STOP = arrêt complet obligatoire, même voie libre. Cédez = ralentir et laisser passer. Sans signal = priorité à droite.",
        body: [
          "Le panneau STOP (octogone rouge avec inscription blanche) impose un arrêt complet du véhicule, roues immobiles, à hauteur de la ligne de marquage au sol. Ce n'est qu'après cet arrêt que le conducteur peut redémarrer, en cédant le passage à tout véhicule circulant sur la voie qu'il s'apprête à croiser.",
          "Le « Cédez le passage » (triangle pointe en bas, bord rouge) n'impose pas l'arrêt mais oblige le conducteur à ralentir et à laisser passer tout véhicule prioritaire avant de s'engager. Si la voie est libre, on peut continuer sans s'arrêter.",
          "En l'absence de signalisation à un carrefour, la règle universelle au Bénin est la priorité à droite : le véhicule venant de votre droite passe avant vous. Cette règle s'applique aussi aux deux-roues et aux cyclistes.",
        ],
        keyPoints: [
          "STOP : arrêt complet OBLIGATOIRE, même si rien ne vient.",
          "Cédez le passage : ralentir, céder, mais pas forcément s'arrêter.",
          "Priorité à droite par défaut sans signalisation.",
          "Route prioritaire (losange jaune) : vous gardez la priorité.",
          "Feu rouge clignotant = STOP, feu orange clignotant = prudence.",
        ],
        illustration: "signs-priority",
        mistakes: [
          "Le « stop glissé » : ralentir sans s'arrêter — sanctionné comme un refus de priorité.",
          "Confondre cédez et stop : ralentir à un STOP est insuffisant.",
        ],
      },
    ],
  },
  {
    id: "m3",
    title: "Module 3 — Règles de circulation",
    summary: "Vitesse, dépassement, croisement, stationnement.",
    lessons: [
      {
        id: "m3l1",
        title: "Limitations de vitesse au Bénin",
        duration: "6 min",
        tldr: "Agglo : 50. Hors agglo : 90. Voie rapide : 110. Toutes ces limites baissent par temps de pluie.",
        body: [
          "Les limitations générales de vitesse au Bénin sont fixées par l'arrêté n°2018-022. En agglomération, la vitesse maximale autorisée est de 50 km/h, abaissée à 30 km/h dans les zones scolaires et hospitalières signalées.",
          "Hors agglomération, sur route ordinaire, la limite est de 90 km/h. Elle descend à 80 km/h par temps de pluie ou de brouillard. Sur les voies rapides (axe Cotonou-Porto-Novo, voie pavée Cotonou-Calavi), la limite passe à 110 km/h, abaissée à 100 km/h en conditions dégradées.",
          "Pour les jeunes conducteurs (permis de moins de 2 ans), une limitation à 80 km/h hors agglomération est recommandée. Pour les poids lourds et transports en commun, des limites spécifiques s'appliquent.",
        ],
        keyPoints: [
          "Agglomération : 50 km/h (30 en zone scolaire).",
          "Hors agglomération : 90 km/h, 80 par pluie.",
          "Voie rapide : 110 km/h, 100 par pluie.",
          "Poids lourd : 80 km/h max hors agglo.",
          "Excès > 50 km/h : retrait immédiat du permis.",
        ],
        illustration: "speed",
      },
      {
        id: "m3l2",
        title: "Le dépassement",
        duration: "9 min",
        tldr: "Toujours par la gauche, après vérification (rétro + angle mort + clignotant). Interdit en virage, sommet de côte, ligne continue, passage piéton.",
        body: [
          "Le dépassement est une manœuvre à haut risque qui nécessite préparation et anticipation. Avant tout dépassement, le conducteur doit s'assurer : que la visibilité est suffisante vers l'avant, qu'aucun véhicule ne dépasse par l'arrière, que la voie de gauche est libre sur une distance suffisante, et que le marquage au sol l'autorise (ligne discontinue).",
          "La séquence complète comporte cinq étapes : 1) regard rétroviseur intérieur, 2) regard rétroviseur extérieur gauche, 3) contrôle de l'angle mort par-dessus l'épaule, 4) clignotant gauche, 5) déboîtement franc et accélération. Le retour à droite s'effectue dès que le véhicule dépassé est visible dans le rétroviseur intérieur, après avoir mis le clignotant droit.",
          "Le dépassement est strictement interdit dans certaines situations : approche d'un sommet de côte, virage sans visibilité, passage piéton, passage à niveau, ligne continue au sol, intersection, et à l'approche d'un panneau d'interdiction de dépasser.",
        ],
        keyPoints: [
          "Toujours par la gauche, jamais par la droite.",
          "Séquence : rétros → angle mort → clignotant → dépasser.",
          "Distance latérale minimale : 1 m (agglo) / 1,5 m (hors agglo).",
          "Interdit en virage, côte, passage piéton, ligne continue.",
          "Retour à droite quand le véhicule dépassé est visible dans le rétro intérieur.",
        ],
        illustration: "overtake",
        mistakes: [
          "Dépasser sans contrôler l'angle mort : cause n°1 de collision latérale.",
          "Se rabattre trop tôt : risque d'accrocher l'avant du véhicule dépassé.",
        ],
      },
      {
        id: "m3l3",
        title: "Stationnement",
        duration: "6 min",
        tldr: "À droite, sens de circulation, jamais sur passage piéton ni à moins de 5 m d'une intersection. Frein à main + vitesse engagée systématiquement.",
        body: [
          "Le stationnement régulier se fait sur le côté droit de la chaussée, dans le sens de la circulation, sauf indication contraire (rue à sens unique, emplacement matérialisé). Le véhicule doit être garé parallèlement au trottoir, à moins de 50 cm de la bordure.",
          "Le stationnement est interdit, sous peine d'amende et de mise en fourrière, sur les passages piétons, devant les bouches d'incendie, à moins de 5 mètres d'une intersection, devant un accès de secours, sur les voies réservées aux transports en commun, et sur les emplacements pour personnes handicapées sans macaron.",
          "Avant de quitter le véhicule, le conducteur doit : serrer le frein à main à fond, engager une vitesse (première en montée, marche arrière en descente), tourner les roues vers le trottoir, couper le contact, retirer la clé, fermer toutes les ouvertures.",
        ],
        keyPoints: [
          "Stationner à droite, dans le sens de la circulation.",
          "Interdit à moins de 5 m d'une intersection ou d'un passage piéton.",
          "Frein à main + vitesse engagée systématiquement.",
          "Roues braquées vers le trottoir en pente descendante.",
          "Stationnement gênant : amende + fourrière + frais de gardiennage.",
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
        duration: "7 min",
        tldr: "Limite légale : 0,5 g/L de sang. Au-delà : suspension, amende, prison si accident. Certains médicaments altèrent la vigilance.",
        body: [
          "Le taux d'alcoolémie maximum autorisé au Bénin est de 0,5 g/L de sang, soit 0,25 mg/L d'air expiré. Au-delà, le conducteur s'expose à une suspension immédiate du permis, à une amende de 50 000 à 500 000 FCFA, et à une peine d'emprisonnement pouvant aller jusqu'à 2 ans en cas d'accident corporel.",
          "L'alcool agit sur trois plans : il diminue le champ visuel (vision tunnel), allonge le temps de réaction de 0,3 à 1 seconde, et altère le jugement (sous-estimation des risques, surestimation de ses capacités). Un seul verre suffit à dégrader la vigilance.",
          "Les drogues (cannabis, cocaïne, opiacés) sont strictement interdites au volant — tolérance zéro. Certains médicaments (anxiolytiques, somnifères, antihistaminiques) portent un pictogramme triangulaire d'avertissement : il est impératif de lire la notice avant de conduire.",
        ],
        keyPoints: [
          "Limite légale : 0,5 g/L de sang (0,25 mg/L d'air).",
          "Un verre standard = environ 0,2 g/L (variable selon le poids).",
          "Drogues : tolérance zéro, dépistage salivaire.",
          "Médicaments à pictogramme : ne pas conduire sans avis médical.",
          "Seul le temps fait baisser l'alcoolémie (≈ 0,15 g/L par heure).",
        ],
        mistakes: [
          "Café, douche froide, sport : aucun effet sur l'alcoolémie.",
          "« Un seul verre, ça passe » : déjà 0,2 g/L de moins de réaction.",
        ],
      },
      {
        id: "m4l2",
        title: "Fatigue et vigilance",
        duration: "6 min",
        tldr: "Une pause de 15-20 min toutes les 2 heures. S'arrêter dès le premier bâillement. Café = effet temporaire seulement.",
        body: [
          "La fatigue est responsable d'environ 30 % des accidents mortels. Elle agit insidieusement : la baisse de vigilance précède de plusieurs minutes la sensation d'endormissement. Lorsque les yeux se ferment 2 à 3 secondes à 90 km/h, le véhicule parcourt 75 mètres sans contrôle.",
          "Les signes d'alerte sont à connaître par cœur : bâillements répétés, paupières lourdes, picotements oculaires, raideur de nuque, difficulté à maintenir une vitesse constante, écarts de trajectoire involontaires. Dès le premier signe, il faut s'arrêter en sécurité.",
          "La meilleure prévention reste le repos avant le départ (7 à 8 heures de sommeil), des pauses régulières (15 à 20 minutes toutes les 2 heures), une alimentation légère, et l'évitement des créneaux à risque (entre 2 h et 5 h du matin, et entre 13 h et 15 h).",
        ],
        keyPoints: [
          "Pause de 15-20 min toutes les 2 heures sur long trajet.",
          "Signes d'alerte : bâillements, paupières lourdes, écarts.",
          "Ne JAMAIS attendre pour s'arrêter — premier signe = arrêt.",
          "Créneaux à risque : 2 h–5 h et 13 h–15 h.",
          "Café : effet seulement 20-30 min, suivi d'un effet rebond.",
        ],
      },
      {
        id: "m4l3",
        title: "Premiers gestes en cas d'accident",
        duration: "8 min",
        tldr: "Mémoriser PAS : Protéger, Alerter, Secourir. Numéros : 117 (police), 118 (pompiers), 112 (urgences).",
        body: [
          "La séquence PAS (Protéger, Alerter, Secourir) est universelle et doit être appliquée dans cet ordre strict. Inverser ces étapes peut provoquer un suraccident ou aggraver l'état des blessés.",
          "PROTÉGER : sécuriser la zone pour éviter un nouvel accident. Allumer les feux de détresse, placer le triangle de présignalisation à 30 m minimum (150 m sur voie rapide), faire descendre les passagers du côté opposé à la circulation, couper le contact des véhicules accidentés.",
          "ALERTER : appeler les secours en donnant des informations précises (lieu exact, nombre de véhicules, nombre et état apparent des blessés, présence de matières dangereuses). Numéros utiles : 117 (police), 118 (sapeurs-pompiers), 112 (numéro européen reconnu au Bénin).",
          "SECOURIR : n'intervenez sur les blessés que si vous êtes formé aux premiers secours. Ne déplacez jamais un blessé sauf danger immédiat (incendie, immersion). Parlez-lui pour le rassurer, couvrez-le pour éviter le choc thermique.",
        ],
        keyPoints: [
          "Séquence PAS : Protéger → Alerter → Secourir, dans cet ordre.",
          "Triangle à 30 m (route ordinaire) / 150 m (voie rapide).",
          "Numéros : 117 (police), 118 (pompiers), 112 (urgences).",
          "Ne JAMAIS déplacer un blessé sauf danger immédiat.",
          "Couper le contact pour éviter tout risque d'incendie.",
        ],
        mistakes: [
          "Se précipiter sur les blessés sans sécuriser la zone : risque de suraccident.",
          "Retirer le casque d'un motard blessé : risque de lésion cervicale.",
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

function LessonIllustration({ kind }: { kind: NonNullable<Lesson["illustration"]> }) {
  if (kind === "signs-danger") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="danger" icon={<VirageDroiteIcon />} /></div>
          <span className="text-[10px] text-charcoal/60">Virage</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="danger" icon={<DosDaneIcon />} /></div>
          <span className="text-[10px] text-charcoal/60">Dos d'âne</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="danger" icon={<ChausseeGlissanteIcon />} /></div>
          <span className="text-[10px] text-charcoal/60">Glissant</span>
        </div>
      </div>
    );
  }
  if (kind === "signs-interdiction") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="interdiction" icon={<SensInterditIcon />} /></div>
          <span className="text-[10px] text-charcoal/60">Sens interdit</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="interdiction" icon={<Vitesse50Icon />} /></div>
          <span className="text-[10px] text-charcoal/60">50 km/h</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="interdiction" icon={<StationnementInterditIcon />} /></div>
          <span className="text-[10px] text-charcoal/60">Stationnement</span>
        </div>
      </div>
    );
  }
  if (kind === "signs-obligation") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="obligation" icon={<TournerDroiteIcon />} /></div>
          <span className="text-[10px] text-charcoal/60">Tournez à droite</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-16 w-20"><SignShape type="indication" icon={<HospitalIcon />} /></div>
          <span className="text-[10px] text-charcoal/60">Hôpital</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-16 w-20"><SignShape type="indication" icon={<ParkingIcon />} /></div>
          <span className="text-[10px] text-charcoal/60">Parking</span>
        </div>
      </div>
    );
  }
  if (kind === "signs-priority") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="stop" icon={null} /></div>
          <span className="text-[10px] text-charcoal/60">Arrêt obligatoire</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="ceder" icon={null} /></div>
          <span className="text-[10px] text-charcoal/60">Cédez le passage</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="priority" icon={null} /></div>
          <span className="text-[10px] text-charcoal/60">Route prioritaire</span>
        </div>
      </div>
    );
  }
  if (kind === "speed") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="interdiction" icon={<Vitesse30Icon />} /></div>
          <span className="text-[10px] text-charcoal/60">Zone scolaire</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16"><SignShape type="interdiction" icon={<Vitesse50Icon />} /></div>
          <span className="text-[10px] text-charcoal/60">Agglomération</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="size-16">
            <svg viewBox="0 0 100 100" className="size-full">
              <circle cx="50" cy="50" r="45" fill="white" stroke="#e8112d" strokeWidth="6" />
              <text x="50" y="62" textAnchor="middle" fill="#18181b" fontSize="24" fontWeight="bold" fontFamily="sans-serif">90</text>
            </svg>
          </div>
          <span className="text-[10px] text-charcoal/60">Hors agglo</span>
        </div>
      </div>
    );
  }
  if (kind === "overtake") {
    return (
      <svg viewBox="0 0 320 120" className="w-full max-w-sm">
        <rect x="0" y="40" width="320" height="60" fill="#e5e5e5" />
        <line x1="0" y1="70" x2="320" y2="70" stroke="white" strokeWidth="2" strokeDasharray="14 10" />
        <rect x="60" y="76" width="44" height="20" rx="3" fill="#94a3b8" />
        <rect x="170" y="48" width="44" height="20" rx="3" fill="#008751" />
        <path d="M104,86 Q137,86 137,58 L165,58" fill="none" stroke="#e8112d" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#ar)" />
        <defs>
          <marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#e8112d" />
          </marker>
        </defs>
        <text x="160" y="20" textAnchor="middle" fontSize="11" fill="#18181b" fontFamily="sans-serif">Déboîtement franc à gauche</text>
      </svg>
    );
  }
  return null;
}

function Theorie() {
  const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), []);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [mode, setMode] = useState<"full" | "review">("full");

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

  function openLesson(id: string) {
    setActiveLessonId(id);
    setMode("full");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  // Lesson detail view
  if (activeLesson) {
    const isDone = completed.has(activeLesson.id);
    const prev = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
    const next =
      activeIndex >= 0 && activeIndex < allLessons.length - 1
        ? allLessons[activeIndex + 1]
        : null;
    const isReview = mode === "review";

    return (
      <div className="min-h-screen bg-ivory text-charcoal">
        <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md">
          <button
            onClick={() => setActiveLessonId(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/70"
          >
            <ArrowLeft className="size-4" /> Programme
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">
            {activeIndex + 1} / {total}
          </span>
        </nav>

        <article className="mx-auto max-w-[62ch] px-5 py-8">
          <span className="mb-3 inline-block rounded-sm bg-benin-yellow/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-charcoal">
            Leçon · {activeLesson.duration}
          </span>
          <h1 className="mb-4 text-2xl font-semibold leading-tight md:text-3xl">
            {activeLesson.title}
          </h1>

          {/* Mode toggle */}
          <div className="mb-6 inline-flex rounded-md bg-white p-1 ring-1 ring-black/5">
            <button
              onClick={() => setMode("full")}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "full" ? "bg-charcoal text-ivory" : "text-charcoal/60"
              }`}
            >
              <BookOpen className="size-3.5" /> Cours complet
            </button>
            <button
              onClick={() => setMode("review")}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "review" ? "bg-benin-green text-white" : "text-charcoal/60"
              }`}
            >
              <Zap className="size-3.5" /> Résumé
            </button>
          </div>

          {/* TL;DR — always visible */}
          <div className="mb-6 rounded-xl bg-benin-green/5 p-4 ring-1 ring-benin-green/20">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-benin-green" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-benin-green">
                À retenir en 1 phrase
              </span>
            </div>
            <p className="text-sm leading-relaxed text-charcoal">{activeLesson.tldr}</p>
          </div>

          {/* Illustration */}
          {activeLesson.illustration && (
            <div className="mb-6 rounded-xl bg-white p-5 ring-1 ring-black/5">
              <LessonIllustration kind={activeLesson.illustration} />
            </div>
          )}

          {/* Full body — hidden in review mode */}
          {!isReview &&
            activeLesson.body.map((p, i) => (
              <p key={i} className="mb-4 text-base leading-relaxed text-charcoal/80">
                {p}
              </p>
            ))}

          {/* Key points — always visible */}
          <div className="mb-6 rounded-xl bg-white p-5 ring-1 ring-black/5">
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

          {/* Examples — hidden in review mode */}
          {!isReview && activeLesson.examples && (
            <div className="mb-6 rounded-xl bg-benin-yellow/10 p-5 ring-1 ring-benin-yellow/30">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="size-4 text-charcoal" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Exemples concrets
                </h2>
              </div>
              <ul className="space-y-2">
                {activeLesson.examples.map((p, i) => (
                  <li key={i} className="text-sm leading-relaxed text-charcoal/80">
                    — {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mistakes — always visible (high-value for revision) */}
          {activeLesson.mistakes && (
            <div className="mb-6 rounded-xl bg-benin-red/5 p-5 ring-1 ring-benin-red/20">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-benin-red">
                Erreurs à éviter
              </h2>
              <ul className="space-y-2">
                {activeLesson.mistakes.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className="text-benin-red">✕</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              onClick={() => prev && openLesson(prev.id)}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium ring-1 ring-charcoal/10 disabled:opacity-40"
            >
              <ArrowLeft className="size-4" /> Précédent
            </button>
            <button
              disabled={!next}
              onClick={() => next && openLesson(next.id)}
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
          {modules.length} modules, {total} leçons enrichies avec exemples,
          illustrations et erreurs à éviter. Mode <strong>Résumé</strong> pour
          réviser avant le quiz.
        </p>
      </header>

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
                          onClick={() => openLesson(lesson.id)}
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
