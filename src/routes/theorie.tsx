import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Award,
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
import { ensurePrivateAccess } from "@/lib/access-control";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/theorie")({
    beforeLoad: async ({ location }) => {
        await ensurePrivateAccess(location.pathname);
    },
    head: () => ({
        meta: [
            { title: "Phase théorique en ligne — L'Excellence Auto-École" },
            {
                name: "description",
                content:
                    "Cours complet de code de la route : 27 leçons illustrées, comme en auto-école. Schémas, exemples, erreurs à éviter, résumés et progression sauvegardée.",
            },
        ],
    }),
    component: Theorie,
});

type IllustrationKind =
    | "signs-danger"
    | "signs-interdiction"
    | "signs-obligation"
    | "signs-priority"
    | "speed"
    | "overtake"
    | "intersection"
    | "roundabout"
    | "safety-distance"
    | "blind-spot"
    | "seatbelt"
    | "helmet"
    | "traffic-lights"
    | "rain"
    | "night"
    | "lane-position"
    | "pedestrian-crossing"
    | "tire-check"
    | "first-aid"
    | "alcohol"
    | "child-seat"
    | "parking-types"
    | "fog";

type Lesson = {
    id: string;
    title: string;
    duration: string;
    tldr: string;
    body: string[];
    keyPoints: string[];
    examples?: string[];
    mistakes?: string[];
    illustration?: IllustrationKind;
};

type Module = {
    id: string;
    title: string;
    summary: string;
    lessons: Lesson[];
};

const categoryGuidance: Record<string, { title: string; focus: string; practice: string }> = {
    AM: {
        title: "Parcours cyclomoteur",
        focus: "équilibre, visibilité, casque et anticipation des usagers vulnérables",
        practice: "contrôles avant départ et trajectoires sûres en ville",
    },
    A1: {
        title: "Parcours moto légère",
        focus: "positionnement, freinage progressif et lecture des intersections",
        practice: "regard, angle mort et maîtrise à basse vitesse",
    },
    A2: {
        title: "Parcours moto",
        focus: "adhérence, trajectoire de sécurité et distance d’arrêt",
        practice: "freinage d’urgence et partage de la chaussée",
    },
    A: {
        title: "Parcours motocycliste confirmé",
        focus: "anticipation, dynamique de la moto et prévention du risque",
        practice: "lecture avancée de la route et conduite défensive",
    },
    B1: {
        title: "Parcours voiture légère",
        focus: "manœuvres, signalisation et conduite urbaine",
        practice: "contrôles, priorités et stationnement sécurisé",
    },
    B: {
        title: "Parcours voiture",
        focus: "priorités, distances de sécurité et conduite préventive",
        practice: "circulation urbaine, route et manœuvres",
    },
    BE: {
        title: "Parcours voiture avec remorque",
        focus: "attelage, gabarit, arrimage et freinage avec remorque",
        practice: "marche arrière, virages et contrôle du chargement",
    },
    C: {
        title: "Parcours poids lourd",
        focus: "gabarit, surcharge, arrimage et freinage longue distance",
        practice: "contrôle du véhicule et anticipation des zones à risque",
    },
    D: {
        title: "Parcours transport de voyageurs",
        focus: "sécurité des passagers, arrêts, issues de secours et responsabilité",
        practice: "conduite souple, surveillance et gestion des incidents",
    },
    T: {
        title: "Parcours véhicule agricole",
        focus: "gabarit, lenteur, visibilité et équipements de signalisation",
        practice: "accès à la route, remorque et partage avec les autres usagers",
    },
};

const categoryCurriculum: Record<string, string[]> = {
    AM: [
        "Équipement et équilibre",
        "Usagers vulnérables",
        "Signalisation moto",
        "Circulation urbaine",
        "Prévention des chutes",
    ],
    A1: [
        "Moto légère et commandes",
        "Regard et trajectoire",
        "Freinage à basse vitesse",
        "Intersections",
        "Conduite défensive",
    ],
    A2: [
        "Dynamique de la moto",
        "Adhérence et freinage",
        "Dépassement",
        "Route et virages",
        "Prévention du risque",
    ],
    A: [
        "Anticipation avancée",
        "Trajectoires de sécurité",
        "Freinage d’urgence",
        "Conduite de nuit",
        "Analyse des dangers",
    ],
    B1: [
        "Commandes et contrôles",
        "Priorités urbaines",
        "Manœuvres",
        "Stationnement",
        "Conduite préventive",
    ],
    B: [
        "Conduite automobile",
        "Intersections",
        "Distances de sécurité",
        "Route et autoroute",
        "Éco-conduite",
    ],
    BE: ["Attelage et dételage", "Gabarit", "Arrimage", "Marche arrière", "Freinage avec remorque"],
    C: ["Contrôle poids lourd", "Angles morts", "Arrimage", "Freinage chargé", "Temps de conduite"],
    D: [
        "Sécurité des passagers",
        "Arrêts et montée",
        "Issues de secours",
        "Conduite souple",
        "Gestion des incidents",
    ],
    T: [
        "Engin et signalisation",
        "Gabarit agricole",
        "Remorque",
        "Accès à la route",
        "Conduite lente",
    ],
};

const categoryLessonContent: Record<string, string[]> = {
    AM: [
        "Maîtriser le cyclomoteur",
        "Se protéger à deux roues",
        "Anticiper les zémidjans",
        "Freiner et tourner en sécurité",
        "Rouler de nuit en cyclomoteur",
    ],
    A1: [
        "Commandes de la moto légère",
        "Position et regard",
        "Freinage progressif",
        "Intersections à moto",
        "Évitement d’obstacles",
    ],
    A2: [
        "Puissance et accélération",
        "Adhérence et trajectoires",
        "Dépassement sécurisé",
        "Virages hors agglomération",
        "Conduite défensive",
    ],
    A: [
        "Dynamique avancée",
        "Trajectoires rapides",
        "Freinage d’urgence",
        "Risques du deux-roues",
        "Anticipation experte",
    ],
    B1: [
        "Prise en main de la voiture",
        "Priorités urbaines",
        "Créneaux et manœuvres",
        "Stationnement sécurisé",
        "Conduite avec visibilité réduite",
    ],
    B: [
        "Conduite automobile",
        "Carrefours et priorités",
        "Distances de sécurité",
        "Route et autoroute",
        "Éco-conduite et prévention",
    ],
    BE: [
        "Atteler une remorque",
        "Gabarit et angles",
        "Arrimer le chargement",
        "Reculer avec remorque",
        "Freiner et tourner avec remorque",
    ],
    C: [
        "Contrôles du poids lourd",
        "Angles morts et gabarit",
        "Arrimage du chargement",
        "Freinage chargé",
        "Fatigue et temps de conduite",
    ],
    D: [
        "Contrôle du véhicule voyageurs",
        "Sécurité à la montée",
        "Passagers et issues",
        "Conduite souple",
        "Incident à bord",
    ],
    T: [
        "Contrôle de l’engin agricole",
        "Gabarit et visibilité",
        "Remorque agricole",
        "Entrer sur la route",
        "Véhicule lent et signalisation",
    ],
};

const modules: Module[] = [
    {
        id: "m1",
        title: "Module 1 — Bases du code de la route",
        summary: "Cadre légal, usagers, documents, équipements obligatoires.",
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
                    "Le permis béninois s'inscrit dans le cadre de la CEDEAO : il est reconnu dans la plupart des pays voisins (Togo, Nigeria, Burkina Faso, Niger) sous condition de validité. Pour conduire au-delà de la CEDEAO, un permis international peut être nécessaire — il s'obtient auprès du Centre National de Sécurité Routière (CNSR).",
                    "La législation distingue les contraventions (stationnement, défaut d'équipement), les délits (alcool, refus d'obtempérer, blessures involontaires) et les crimes (homicide involontaire avec circonstances aggravantes). Chaque catégorie entraîne des sanctions différentes : amendes, suspension, annulation, prison.",
                ],
                keyPoints: [
                    "Permis valide obligatoire pour chaque catégorie de véhicule.",
                    "Âge minimum : 14 ans (AM), 16 ans (A1), 18 ans (B, A2), 21 ans (C, D).",
                    "Ceinture obligatoire à l'avant ET à l'arrière, conducteur et passagers.",
                    "Casque homologué obligatoire pour conducteur ET passager de deux-roues.",
                    "Refus d'obtempérer = délit, peine de prison possible.",
                    "Permis reconnu dans la CEDEAO sous réserve de validité.",
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
                    "Les enfants représentent un danger imprévisible : ils peuvent surgir entre deux véhicules en stationnement, traverser sans regarder, jouer au bord de la route. Près des écoles aux heures d'entrée et de sortie, la vitesse doit être réduite à 30 km/h maximum, et la vigilance maintenue au plus haut niveau.",
                    "Les véhicules prioritaires (ambulance, pompiers, police, gendarmerie) en intervention, signalés par leurs feux bleus clignotants et leur sirène à deux tons, ont la priorité absolue. Tous les autres usagers doivent leur faciliter le passage en se rangeant sur la droite et en s'arrêtant si nécessaire.",
                ],
                keyPoints: [
                    "Priorité absolue au piéton engagé sur un passage protégé.",
                    "Distance latérale minimale de 1 m pour dépasser un deux-roues, 1,5 m hors agglomération.",
                    "Ralentir près des écoles, marchés, arrêts de bus.",
                    "Anticiper les changements de trajectoire des zémidjans.",
                    "Klaxon limité aux situations de danger réel — pas pour saluer.",
                    "Véhicules prioritaires : se ranger à droite, s'arrêter si nécessaire.",
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
                    "Pour les véhicules importés, la carte grise béninoise doit être obtenue dans les 30 jours suivant le dédouanement. Rouler avec une carte grise étrangère au-delà de ce délai constitue une infraction passible d'amende et de mise en fourrière.",
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
            {
                id: "m1l4",
                title: "Équipements obligatoires du véhicule",
                duration: "7 min",
                tldr: "Triangle, gilet réfléchissant, roue de secours, extincteur (PL), trousse de secours. Casque homologué obligatoire pour tout deux-roues.",
                body: [
                    "Le véhicule doit comporter à bord un certain nombre d'équipements de sécurité. Pour les voitures particulières : un triangle de présignalisation conforme à la norme, un gilet de haute visibilité (jaune ou orange) accessible depuis le poste de conduite, une roue de secours en bon état avec cric et manivelle, et une trousse de premiers secours.",
                    "Pour les véhicules utilitaires et poids lourds s'ajoutent : un extincteur à poudre de 2 kg minimum, des cales pour immobiliser le véhicule en pente, et une lampe-torche. Les taxis et véhicules de transport en commun doivent en plus afficher leur tarification et le numéro d'agrément.",
                    "Pour les deux-roues, le casque homologué (norme ECE 22-05 ou DOT) est obligatoire pour le conducteur comme pour le passager. Il doit être correctement attaché — un casque mal sanglé est considéré comme un casque absent. Les gants et chaussures fermées sont fortement recommandés.",
                    "Les feux et clignotants doivent être en parfait état de fonctionnement. Une simple ampoule grillée à l'arrière peut justifier un contrôle et une amende. Un test rapide chaque semaine est recommandé : feux de croisement, feux de route, feux de position, stop, clignotants, antibrouillards.",
                ],
                keyPoints: [
                    "Triangle + gilet réfléchissant accessibles depuis l'habitacle.",
                    "Roue de secours en bon état, cric et manivelle.",
                    "Extincteur 2 kg minimum pour utilitaires et PL.",
                    "Casque homologué attaché : conducteur ET passager de deux-roues.",
                    "Vérification hebdomadaire des feux : croisement, stop, clignotants.",
                ],
                illustration: "helmet",
                mistakes: [
                    "Gilet dans le coffre : illégal, il doit être accessible depuis le siège.",
                    "Casque non attaché : équivaut à pas de casque en cas de contrôle.",
                ],
            },
            {
                id: "m1l5",
                title: "Transport d'enfants et de passagers",
                duration: "6 min",
                tldr: "Enfants -10 ans à l'arrière, siège homologué adapté à l'âge et au poids. Jamais d'enfant sur les genoux. Verrouillage sécurité enfants activé.",
                body: [
                    "Le transport d'enfants à bord d'un véhicule obéit à des règles strictes. Tout enfant de moins de 10 ans doit voyager à l'arrière, sauf exception (absence de siège arrière, transport simultané de plusieurs enfants). Aucun enfant ne doit jamais voyager sur les genoux d'un passager — c'est interdit et extrêmement dangereux.",
                    "Le système de retenue doit être adapté à la morphologie de l'enfant : nacelle pour les nourrissons (0-13 kg), siège-coque dos à la route (jusqu'à 18 kg ou 4 ans), rehausseur avec dossier (15-36 kg ou 4-10 ans). Au-delà, la ceinture standard suffit, mais elle ne doit pas passer dans le cou.",
                    "Le verrouillage de sécurité enfants (présent sur les portes arrière de la plupart des véhicules) doit être activé dès qu'un enfant voyage à l'arrière. Il empêche l'ouverture intérieure de la porte. Vérifier également que les vitres électriques arrière sont verrouillées depuis le poste de conduite.",
                    "Sur les deux-roues, le transport d'enfants de moins de 5 ans est interdit. Au-delà, l'enfant doit pouvoir poser les pieds sur les repose-pieds, porter un casque adapté à sa taille, et un dispositif d'accroche (sangle ventrale, harnais) est recommandé.",
                ],
                keyPoints: [
                    "Enfants -10 ans à l'arrière, siège homologué adapté.",
                    "Jamais sur les genoux d'un passager.",
                    "Verrouillage portes et vitres arrière activé.",
                    "Pas de passager -5 ans en deux-roues.",
                    "Casque enfant adapté à sa taille, pas celui d'un adulte.",
                ],
                illustration: "child-seat",
                mistakes: [
                    "Installer un siège dos à la route à l'avant avec airbag activé : MORTEL.",
                    "Faire passer la ceinture sous le bras de l'enfant : risque de fracture grave.",
                ],
            },
        ],
    },
    {
        id: "m2",
        title: "Module 2 — Panneaux, signalisation et feux",
        summary: "Reconnaître la forme, la couleur et le sens de chaque panneau et signal.",
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
                    "Certains panneaux comportent un panonceau complémentaire indiquant la longueur de la zone dangereuse (« sur 2 km », « 500 m ») ou la nature précise du risque. Ces panonceaux affinent l'avertissement et doivent être lus attentivement.",
                ],
                keyPoints: [
                    "Forme : triangle pointe en haut, bord rouge.",
                    "Distance : 150 m (rase campagne), 50 m (agglomération).",
                    "Réaction : ralentir + vérifier rétros + anticiper.",
                    "Cas particuliers : passage à niveau, écoles, animaux sauvages.",
                    "Panonceau = précision sur la durée ou la nature du danger.",
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
                    "Certaines interdictions sont catégorielles : un panneau représentant un camion barré interdit l'accès aux poids lourds ; un panneau avec deux-roues barré interdit l'accès aux motos. Le pictogramme doit être lu précisément pour déterminer à qui s'applique l'interdiction.",
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
                    "Les panneaux de localisation (entrée et sortie d'agglomération) sont rectangulaires sur fond blanc, le nom barré d'un trait rouge marquant la sortie. Ils déterminent l'application automatique des limites de vitesse en agglomération (50 km/h) ou hors agglomération (90 km/h).",
                ],
                keyPoints: [
                    "Rond bleu = obligation à respecter.",
                    "Rectangle bleu = service ou indication locale.",
                    "Rectangle vert = itinéraire interurbain principal.",
                    "Pictogramme blanc systématique sur fond bleu/vert.",
                    "Entrée/sortie d'agglo : déclenchent la limite 50 / 90 km/h.",
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
                    "La route prioritaire est signalée par un panneau losange jaune cerclé de blanc. Tant que ce panneau est en vigueur, vous gardez la priorité à chaque intersection. Le panneau « fin de route prioritaire » (losange barré) vous fait revenir à la règle générale de priorité à droite.",
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
            {
                id: "m2l5",
                title: "Les feux tricolores et signaux lumineux",
                duration: "7 min",
                tldr: "Rouge : arrêt absolu avant la ligne. Orange fixe : arrêt si possible sans danger. Vert : passage libre mais vigilant. Flèches = direction autorisée uniquement.",
                body: [
                    "Le feu rouge fixe impose l'arrêt complet du véhicule avant la ligne d'effet des feux (ligne blanche transversale). Franchir un feu rouge est l'une des infractions les plus graves du code : amende lourde, retrait de points et risque de suspension immédiate du permis.",
                    "Le feu orange fixe annonce le passage au rouge. Le conducteur doit s'arrêter sauf si l'arrêt présenterait un danger (véhicule trop proche derrière, vitesse trop élevée pour un freinage sûr). Il ne s'agit pas d'un signal d'accélération.",
                    "Le feu vert autorise le passage, mais ne dispense pas de la vigilance : il faut vérifier qu'aucun piéton n'achève sa traversée, qu'aucun véhicule prioritaire n'arrive, et que l'intersection est dégagée. S'engager sur un feu vert dans un carrefour bloqué est une infraction.",
                    "Les flèches directionnelles (rouges, oranges ou vertes) ne s'appliquent qu'à la direction indiquée. Une flèche verte vers la droite avec un feu rouge principal autorise uniquement le virage à droite, en cédant le passage aux piétons et aux véhicules venant de la voie principale.",
                    "Le feu orange clignotant signale un carrefour à régulation normale temporairement désactivée. Le conducteur applique alors la signalisation classique présente (STOP, cédez, priorité à droite). Le feu rouge clignotant équivaut à un STOP — arrêt complet obligatoire.",
                ],
                keyPoints: [
                    "Rouge fixe : arrêt absolu avant la ligne d'effet.",
                    "Orange fixe : arrêt sauf danger.",
                    "Vert : passage autorisé, vigilance maintenue.",
                    "Flèches : ne s'appliquent qu'à la direction indiquée.",
                    "Orange clignotant : carrefour à régulation manuelle.",
                    "Rouge clignotant : équivalent STOP.",
                ],
                illustration: "traffic-lights",
                mistakes: [
                    "Accélérer sur un orange « pour passer » : franchissement de feu rouge garanti.",
                    "Démarrer dès le vert sans vérifier les piétons : accident à fort risque.",
                ],
            },
            {
                id: "m2l6",
                title: "Marquages au sol",
                duration: "6 min",
                tldr: "Ligne continue : interdiction de franchir. Discontinue : franchissable. Flèches : direction de la voie. Bandes jaunes : interdiction d'arrêt.",
                body: [
                    "Le marquage au sol complète la signalisation verticale et organise la circulation. La ligne blanche continue interdit tout franchissement et tout dépassement : la chevaucher est une infraction grave. Elle est généralement tracée dans les zones à visibilité réduite (virages, sommets de côte).",
                    "La ligne blanche discontinue peut être franchie pour dépasser, changer de voie ou tourner. Plus les segments sont longs et rapprochés, plus la ligne approche d'une continue : c'est une ligne d'annonce. Les flèches blanches en début de voie indiquent les directions autorisées : tout droit, tourner à gauche, tourner à droite, ou combinaisons.",
                    "Les bandes jaunes continues le long du trottoir interdisent l'arrêt et le stationnement. Les bandes jaunes discontinues interdisent seulement le stationnement — l'arrêt momentané (livraison, dépose) reste possible.",
                    "Les passages piétons sont matérialisés par de larges bandes blanches parallèles. À l'approche, le conducteur doit ralentir et s'arrêter si un piéton est engagé ou s'apprête à traverser. Les bandes en zigzag jaunes (zone d'arrêt-minute) sont réservées aux véhicules en livraison ou aux taxis.",
                ],
                keyPoints: [
                    "Ligne continue : interdiction de franchir/dépasser.",
                    "Ligne discontinue : franchissable selon manœuvre.",
                    "Flèches au sol : direction autorisée par la voie.",
                    "Bande jaune continue : arrêt et stationnement interdits.",
                    "Bande jaune discontinue : stationnement interdit, arrêt OK.",
                ],
                illustration: "lane-position",
            },
        ],
    },
    {
        id: "m3",
        title: "Module 3 — Règles de circulation",
        summary: "Vitesse, dépassement, intersections, ronds-points, stationnement.",
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
                    "La vitesse doit toujours être adaptée aux circonstances : état de la chaussée, visibilité, densité du trafic, type de véhicule. Le code parle de « vitesse adaptée » : une limite affichée à 90 ne signifie pas qu'il faut rouler à 90 dans le brouillard ou sur une route détrempée.",
                    "Le radar peut être mobile (jumelles laser, radar embarqué dans véhicule banalisé) ou fixe (cabines sur grands axes). La tolérance technique est de 5 km/h en dessous de 100 km/h, et 5 % au-dessus. Au-delà de 50 km/h de dépassement, le permis peut être retiré sur place.",
                ],
                keyPoints: [
                    "Agglomération : 50 km/h (30 en zone scolaire).",
                    "Hors agglomération : 90 km/h, 80 par pluie.",
                    "Voie rapide : 110 km/h, 100 par pluie.",
                    "Poids lourd : 80 km/h max hors agglo.",
                    "Excès > 50 km/h : retrait immédiat du permis.",
                    "Vitesse toujours adaptée aux conditions réelles.",
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
                    "L'angle mort est l'espace situé à l'arrière et sur le côté du véhicule, invisible dans les rétroviseurs. Il englobe environ deux fois la largeur du véhicule à l'arrière-droit et arrière-gauche. Un coup d'œil rapide par-dessus l'épaule est la seule façon fiable de le contrôler.",
                    "La règle du « ne pas dépasser un dépassement » : si un véhicule devant vous a déjà entamé un dépassement, vous ne pouvez pas le dépasser à votre tour. Attendez qu'il se soit rabattu avant d'envisager votre propre manœuvre.",
                ],
                keyPoints: [
                    "Toujours par la gauche, jamais par la droite.",
                    "Séquence : rétros → angle mort → clignotant → dépasser.",
                    "Distance latérale minimale : 1 m (agglo) / 1,5 m (hors agglo).",
                    "Interdit en virage, côte, passage piéton, ligne continue.",
                    "Retour à droite quand le véhicule dépassé est visible dans le rétro intérieur.",
                    "Ne pas dépasser un véhicule qui dépasse déjà.",
                ],
                illustration: "overtake",
                mistakes: [
                    "Dépasser sans contrôler l'angle mort : cause n°1 de collision latérale.",
                    "Se rabattre trop tôt : risque d'accrocher l'avant du véhicule dépassé.",
                ],
            },
            {
                id: "m3l3",
                title: "Angles morts et rétroviseurs",
                duration: "6 min",
                tldr: "Trois rétros bien réglés ne suffisent pas. Un regard par-dessus l'épaule reste obligatoire avant tout changement de file ou dépassement.",
                body: [
                    "Les rétroviseurs (intérieur, extérieur gauche, extérieur droit) couvrent environ 70 % de l'environnement arrière du véhicule. Les 30 % restants forment ce qu'on appelle les angles morts : zones invisibles depuis le poste de conduite, mais dans lesquelles un véhicule, un deux-roues ou un piéton peut parfaitement se trouver.",
                    "Le réglage correct des rétroviseurs extérieurs est essentiel : on doit voir une infime portion du flanc de son propre véhicule, et l'horizon au milieu du miroir. Le rétroviseur intérieur, lui, doit cadrer l'intégralité de la lunette arrière. Un réglage négligé multiplie la taille des angles morts.",
                    "Sur un poids lourd ou un bus, les angles morts sont énormes — particulièrement à droite et juste devant le pare-chocs. Un piéton ou un cycliste arrêté à hauteur de la cabine droite est totalement invisible. C'est pour cela qu'il ne faut jamais se placer juste à droite ou juste devant un camion à l'arrêt.",
                    "Le contrôle d'angle mort se fait par un coup d'œil rapide (1 seconde maximum) par-dessus l'épaule gauche avant un dépassement ou un changement de file à gauche, par-dessus l'épaule droite avant un changement de file à droite ou avant d'ouvrir sa portière côté circulation.",
                ],
                keyPoints: [
                    "Angles morts = ~30 % de l'environnement arrière.",
                    "Réglage : voir un peu de son véhicule + l'horizon centré.",
                    "Coup d'œil par-dessus l'épaule = obligatoire avant manœuvre.",
                    "Jamais se placer à droite ou devant un poids lourd à l'arrêt.",
                    "Avant d'ouvrir sa portière côté route : contrôler l'angle mort.",
                ],
                illustration: "blind-spot",
                mistakes: [
                    "Se fier uniquement aux rétros : un deux-roues invisible peut surgir.",
                    "Régler les rétros pour voir trop large : l'angle mort s'agrandit.",
                ],
            },
            {
                id: "m3l4",
                title: "Distances de sécurité",
                duration: "7 min",
                tldr: "Règle des 2 secondes : compter deux secondes entre votre véhicule et le précédent. Doubler par temps de pluie.",
                body: [
                    "La distance de sécurité est l'espace minimum qu'un conducteur doit conserver avec le véhicule qui le précède, pour pouvoir s'arrêter sans collision en cas de freinage brusque. Cette distance dépend de la vitesse, de l'état de la chaussée et de l'attention du conducteur.",
                    "La règle des 2 secondes est universelle et pratique : choisissez un point fixe sur la route (panneau, marquage), comptez « mille-un, mille-deux » à partir du moment où le véhicule devant vous le franchit. Si vous le franchissez à votre tour avant la fin du compte, vous êtes trop près.",
                    "Cette règle se traduit en mètres selon la vitesse : à 50 km/h, environ 28 m ; à 90 km/h, environ 50 m ; à 110 km/h, environ 62 m. Par temps de pluie, de brouillard ou sur chaussée glissante, doublez la distance — règle des 4 secondes.",
                    "La distance de freinage totale se décompose en deux phases : la distance de réaction (temps que met le conducteur à identifier le danger et à enfoncer la pédale, environ 1 seconde = 14 m à 50 km/h et 25 m à 90 km/h), puis la distance de freinage proprement dite (qui augmente avec le carré de la vitesse).",
                    "Sur autoroute ou voie rapide, des panneaux de signalisation horizontaux (chevrons espacés) permettent de matérialiser la distance de sécurité. Le conducteur doit toujours voir deux chevrons entre son véhicule et celui qui le précède.",
                ],
                keyPoints: [
                    "Règle des 2 secondes : intervalle minimum.",
                    "Doubler la distance par pluie ou brouillard (4 secondes).",
                    "Distance de freinage = réaction + freinage effectif.",
                    "À 90 km/h, prévoir 50 m minimum.",
                    "Voir deux chevrons entre soi et le véhicule précédent.",
                ],
                illustration: "safety-distance",
                mistakes: [
                    "Coller le véhicule devant pour « empêcher qu'on se rabatte » : carambolage assuré.",
                    "Réduire la distance sous la pluie : aquaplaning + non-freinage.",
                ],
            },
            {
                id: "m3l5",
                title: "Intersections et priorité à droite",
                duration: "8 min",
                tldr: "À une intersection sans signalisation, le véhicule venant de votre droite passe en premier. Cette règle simple est la plus violée du code.",
                body: [
                    "Une intersection est tout endroit où deux ou plusieurs voies se croisent ou se rejoignent. C'est l'un des lieux les plus accidentogènes de la circulation : il faut y arriver à allure modérée, en couvrant la pédale de frein, et en balayant le regard de gauche à droite.",
                    "À une intersection signalée par STOP, le conducteur s'arrête complètement avant la ligne, observe, puis s'engage si la voie est libre. À une intersection signalée par « cédez le passage », il ralentit et cède la priorité aux véhicules de la voie principale. Sous une route prioritaire (losange jaune), il garde la priorité.",
                    "En l'absence de toute signalisation — situation très fréquente sur les voies secondaires et les pistes —, la règle est la priorité à droite : tout véhicule venant de votre droite passe avant vous. Cette règle s'applique aux voitures, motos, vélos et même aux véhicules sortant d'un chemin ou d'une zone de stationnement.",
                    "Pour tourner à gauche dans une intersection, le conducteur doit signaler son intention (clignotant gauche bien à l'avance), se placer le plus à gauche possible de sa voie (sans déborder), céder le passage aux véhicules venant en face et aux piétons traversant la voie qu'il s'apprête à prendre, puis effectuer un virage serré sans couper la trajectoire de la voie d'en face.",
                    "Pour tourner à droite, le clignotant droit est mis bien avant, le véhicule serre la droite, et la trajectoire reste large pour éviter de monter sur le trottoir avec la roue arrière. Vérifier l'angle mort droit avant de tourner pour ne pas écraser un cycliste ou un piéton.",
                ],
                keyPoints: [
                    "Sans signalisation = priorité à droite ABSOLUE.",
                    "STOP : arrêt complet, observation, engagement.",
                    "Cédez : ralentir et laisser passer la voie principale.",
                    "Tourner à gauche : clignoter tôt, céder à la voie d'en face.",
                    "Tourner à droite : serrer la droite, contrôler l'angle mort.",
                ],
                illustration: "intersection",
                mistakes: [
                    "Croire que la « voie la plus large » a la priorité : faux, c'est la signalisation ou la droite.",
                    "Couper le virage à gauche : collision frontale possible.",
                ],
            },
            {
                id: "m3l6",
                title: "Les ronds-points (carrefours giratoires)",
                duration: "7 min",
                tldr: "Priorité aux véhicules déjà engagés dans l'anneau. Clignotant droit pour sortir, jamais pour entrer.",
                body: [
                    "Le rond-point (ou carrefour à sens giratoire) est un carrefour circulaire à sens unique. Sauf indication contraire, la règle universelle est : priorité aux véhicules déjà engagés dans l'anneau. Le véhicule qui arrive doit ralentir, céder le passage, et n'entrer que lorsque la voie est libre.",
                    "À l'entrée, le clignotant n'est PAS mis : il n'y a pas de manœuvre de changement de direction, on s'insère simplement dans le flux circulaire. En revanche, dès que l'on s'apprête à sortir (à la sortie qu'on a choisie), on met le clignotant droit pour avertir les autres usagers.",
                    "Sur un rond-point à plusieurs voies, le choix de la voie d'entrée dépend de la sortie visée : pour la première sortie (droite), prendre la voie de droite ; pour aller tout droit ou tourner à gauche, prendre la voie de gauche puis se déporter à droite avant la sortie en contrôlant l'angle mort.",
                    "Les ronds-points avec signalisation contraire (« Vous n'avez pas la priorité » à l'entrée + « cédez le passage » dans l'anneau) sont rares mais existent. Toujours lire les panneaux à l'approche pour identifier le régime de priorité.",
                    "À Cotonou et Porto-Novo, certains carrefours circulaires (place de l'Étoile Rouge, place Lénine) appliquent ce régime. Ralentir à 30 km/h à l'approche, ne pas s'engager sans visibilité dégagée à gauche, et utiliser le clignotant systématiquement pour sortir.",
                ],
                keyPoints: [
                    "Priorité aux véhicules DÉJÀ dans l'anneau.",
                    "Pas de clignotant à l'entrée.",
                    "Clignotant droit pour annoncer la sortie.",
                    "Voie de droite pour 1re sortie ; voie de gauche pour les suivantes.",
                    "Lire les panneaux : certains ronds-points inversent la règle.",
                ],
                illustration: "roundabout",
                mistakes: [
                    "Mettre le clignotant gauche pour entrer : signal incompréhensible.",
                    "Forcer le passage en pensant être prioritaire : refus de priorité.",
                ],
            },
            {
                id: "m3l7",
                title: "Passages piétons et protection des piétons",
                duration: "6 min",
                tldr: "Tout piéton engagé ou clairement en intention de traverser a la priorité ABSOLUE. Arrêt obligatoire, jamais de dépassement à l'approche d'un passage.",
                body: [
                    "Le passage piéton (zébré blanc) est un espace de la chaussée où le piéton bénéficie d'une priorité légale renforcée. Le conducteur qui approche doit ralentir et s'arrêter dès qu'un piéton est engagé sur la chaussée ou manifestement sur le point de s'engager (debout au bord, regard tourné vers la circulation).",
                    "L'arrêt doit avoir lieu avant le passage, jamais sur les bandes blanches. Stopper sur le passage empêche les piétons de traverser et constitue une infraction. Si vous êtes à l'arrêt à un feu rouge avant un passage piéton, gardez votre véhicule en deçà des zébras.",
                    "Le dépassement est strictement interdit à l'approche d'un passage piéton, même si aucun piéton n'est visible : un piéton peut surgir entre des véhicules à l'arrêt, masqué par le véhicule qu'on dépasse. C'est l'une des situations d'accident mortel les plus fréquentes.",
                    "Les enfants, les personnes âgées et les personnes à mobilité réduite ont une priorité renforcée : le conducteur doit s'arrêter même s'ils ne sont qu'en approche du passage. Devant les écoles, marchés et arrêts de bus, la vigilance doit être maximale.",
                ],
                keyPoints: [
                    "Piéton engagé = priorité absolue.",
                    "S'arrêter avant le passage, jamais dessus.",
                    "Dépassement interdit à l'approche d'un passage piéton.",
                    "Enfants et personnes âgées : priorité dès l'approche.",
                    "Ralentir à 30 km/h en zone scolaire signalée.",
                ],
                illustration: "pedestrian-crossing",
                mistakes: [
                    "Klaxonner pour faire avancer un piéton : interdit.",
                    "Dépasser un véhicule à l'arrêt devant un passage : collision avec piéton masqué.",
                ],
            },
            {
                id: "m3l8",
                title: "Stationnement",
                duration: "6 min",
                tldr: "À droite, sens de circulation, jamais sur passage piéton ni à moins de 5 m d'une intersection. Frein à main + vitesse engagée systématiquement.",
                body: [
                    "Le stationnement régulier se fait sur le côté droit de la chaussée, dans le sens de la circulation, sauf indication contraire (rue à sens unique, emplacement matérialisé). Le véhicule doit être garé parallèlement au trottoir, à moins de 50 cm de la bordure.",
                    "Le stationnement est interdit, sous peine d'amende et de mise en fourrière, sur les passages piétons, devant les bouches d'incendie, à moins de 5 mètres d'une intersection, devant un accès de secours, sur les voies réservées aux transports en commun, et sur les emplacements pour personnes handicapées sans macaron.",
                    "Avant de quitter le véhicule, le conducteur doit : serrer le frein à main à fond, engager une vitesse (première en montée, marche arrière en descente), tourner les roues vers le trottoir, couper le contact, retirer la clé, fermer toutes les ouvertures.",
                    "Les principaux modes de stationnement sont : en bataille (perpendiculaire au trottoir), en épi (oblique, ~45°), en créneau (parallèle entre deux véhicules). Le créneau est l'examen pratique le plus redouté : il s'effectue en marche arrière, en trois temps.",
                ],
                keyPoints: [
                    "Stationner à droite, dans le sens de la circulation.",
                    "Interdit à moins de 5 m d'une intersection ou d'un passage piéton.",
                    "Frein à main + vitesse engagée systématiquement.",
                    "Roues braquées vers le trottoir en pente descendante.",
                    "Stationnement gênant : amende + fourrière + frais de gardiennage.",
                ],
                illustration: "parking-types",
            },
        ],
    },
    {
        id: "m4",
        title: "Module 4 — Conduite par conditions difficiles",
        summary: "Pluie, brouillard, nuit, fatigue, chaussée dégradée.",
        lessons: [
            {
                id: "m4l1",
                title: "Conduite sous la pluie",
                duration: "7 min",
                tldr: "Vitesse réduite, distance doublée, feux de croisement allumés. Risque d'aquaplaning : si ça arrive, ne pas freiner brutalement.",
                body: [
                    "La pluie est la condition météorologique la plus fréquente au Bénin pendant les saisons humides (avril-juillet et septembre-octobre). Elle dégrade fortement l'adhérence des pneus, la visibilité et la perception des distances. Tous les paramètres de conduite doivent être ajustés.",
                    "La vitesse maximale légale baisse automatiquement de 10 km/h hors agglomération en cas de précipitations : 80 km/h sur route, 100 km/h sur voie rapide. La distance de sécurité doit être doublée (règle des 4 secondes). Les feux de croisement doivent être allumés, même en plein jour, pour être vu des autres usagers.",
                    "L'aquaplaning (ou hydroplaning) se produit lorsqu'une lame d'eau s'intercale entre le pneu et la chaussée, faisant perdre tout contact. Le véhicule ne répond plus ni à la direction ni au freinage. La bonne réaction : lever le pied de l'accélérateur SANS freiner, maintenir le volant droit, attendre que les pneus retrouvent l'adhérence.",
                    "Les premières gouttes de pluie sont les plus dangereuses : elles mélangent la poussière, la gomme et les hydrocarbures déposés sur la chaussée, formant un film gras extrêmement glissant. Pendant les 15 premières minutes d'une averse, redoubler de prudence — c'est statistiquement le moment de plus haute sinistralité.",
                    "Sur route inondée (fréquent à Cotonou en saison des pluies), ne jamais s'engager si on ne voit pas le fond : un nid-de-poule peut casser une roue, et 30 cm d'eau peuvent emporter une voiture. Si on doit traverser, rouler très lentement en première, en maintenant une accélération constante.",
                ],
                keyPoints: [
                    "Vitesse réduite : 80 km/h route, 100 km/h voie rapide.",
                    "Distance de sécurité doublée (règle des 4 secondes).",
                    "Feux de croisement allumés, même en journée.",
                    "Aquaplaning : lever le pied, ne pas freiner, garder le volant droit.",
                    "Premières minutes d'averse = risque maximum.",
                    "Route inondée : ne pas s'engager si fond invisible.",
                ],
                illustration: "rain",
                mistakes: [
                    "Freiner brutalement en aquaplaning : aggrave la perte de contrôle.",
                    "Allumer les feux de détresse en roulant sous la pluie : interdit, brouille la communication entre conducteurs.",
                ],
            },
            {
                id: "m4l2",
                title: "Conduite de nuit",
                duration: "7 min",
                tldr: "Feux de croisement en agglo, feux de route hors agglo (à éteindre au croisement). Vitesse adaptée à la portée des feux. Vigilance sur la fatigue.",
                body: [
                    "La nuit, la visibilité chute drastiquement : on perçoit moins de couleurs, les contrastes diminuent, les distances sont mal évaluées et la fatigue s'accumule plus vite. La proportion d'accidents graves est plus élevée la nuit, alors que le trafic est moindre.",
                    "Les feux de croisement (codes) éclairent à environ 30 mètres et sont obligatoires en agglomération et au croisement d'un autre véhicule. Les feux de route (pleins phares) éclairent à 100 mètres environ et sont utilisés hors agglomération sur route déserte. Ils doivent être éteints dès qu'on croise un véhicule, suit un véhicule à moins de 150 m, ou entre en agglomération.",
                    "La règle d'or : ne jamais rouler plus vite que ce que les feux permettent de voir. Si vos feux éclairent à 30 m, vous devez pouvoir vous arrêter en 30 m maximum. À 90 km/h, la distance d'arrêt avoisine 70 m — incompatible avec des feux de croisement seuls. Sur route de nuit sans pleins phares, réduire la vitesse à 70 km/h.",
                    "L'éblouissement par un véhicule venant en face est une cause fréquente d'accident. La bonne réaction : ne pas fixer ses phares, regarder la ligne blanche du bord droit de la chaussée, ralentir, et si besoin s'arrêter quelques secondes le temps que la vue se rétablisse.",
                    "La fatigue est multipliée la nuit. Sur long trajet, doubler la fréquence des pauses (toutes les 1h30 au lieu de 2h), éviter le créneau 2h-5h du matin (somnolence biologique maximale), garder la cabine fraîche et bien aérée, ne jamais conduire après plus de 16h d'éveil.",
                ],
                keyPoints: [
                    "Feux de croisement obligatoires en agglo et au croisement.",
                    "Feux de route : route déserte hors agglo, à éteindre au croisement.",
                    "Vitesse adaptée à la portée des feux (règle du « voir = pouvoir s'arrêter »).",
                    "Éblouissement : regarder le bas-côté droit, ralentir.",
                    "Pauses plus fréquentes la nuit, éviter 2h-5h.",
                ],
                illustration: "night",
                mistakes: [
                    "Garder les pleins phares face à un véhicule croisé : éblouit, accident probable.",
                    "Rouler à 90 km/h avec feux de croisement seuls : pas le temps de freiner.",
                ],
            },
            {
                id: "m4l3",
                title: "Brouillard et visibilité réduite",
                duration: "6 min",
                tldr: "Feux antibrouillard avant ET arrière. Vitesse très réduite. Ne jamais s'arrêter sur la chaussée — chercher un refuge.",
                body: [
                    "Le brouillard épais réduit la visibilité à moins de 50 mètres et transforme radicalement les conditions de conduite. Bien que rare au Bénin, il survient en saison sèche (harmattan) et en début de matinée sur les zones humides (lagunes, bas-fonds).",
                    "Les feux antibrouillard avant améliorent l'éclairage de la chaussée et la perception des bords. Les feux antibrouillard arrière, beaucoup plus puissants que les feux de position rouges classiques, signalent votre présence aux véhicules suivants — ils ne s'utilisent QUE par brouillard ou neige, jamais autrement (ils éblouissent).",
                    "Les feux de route sont à proscrire dans le brouillard : la lumière se réfléchit sur les gouttelettes et crée un mur blanc opaque. Utiliser uniquement les feux de croisement + antibrouillard avant. Adapter la vitesse pour pouvoir s'arrêter dans la distance visible.",
                    "S'il faut s'immobiliser à cause d'une panne, ne JAMAIS rester sur la chaussée : risque de choc arrière mortel. Tirer le véhicule au maximum sur le bas-côté, sortir par la portière côté opposé à la circulation, mettre le gilet, placer le triangle à 150 m minimum, et s'éloigner du véhicule.",
                ],
                keyPoints: [
                    "Feux antibrouillard AV uniquement avec feux de croisement.",
                    "Antibrouillards AR : QUE par brouillard, sinon éblouissants.",
                    "Jamais de feux de route dans le brouillard.",
                    "Vitesse adaptée à la distance visible.",
                    "Triangle à 150 m, sortir côté opposé à la circulation.",
                ],
                illustration: "fog",
            },
            {
                id: "m4l4",
                title: "Fatigue et vigilance",
                duration: "6 min",
                tldr: "Une pause de 15-20 min toutes les 2 heures. S'arrêter dès le premier bâillement. Café = effet temporaire seulement.",
                body: [
                    "La fatigue est responsable d'environ 30 % des accidents mortels. Elle agit insidieusement : la baisse de vigilance précède de plusieurs minutes la sensation d'endormissement. Lorsque les yeux se ferment 2 à 3 secondes à 90 km/h, le véhicule parcourt 75 mètres sans contrôle.",
                    "Les signes d'alerte sont à connaître par cœur : bâillements répétés, paupières lourdes, picotements oculaires, raideur de nuque, difficulté à maintenir une vitesse constante, écarts de trajectoire involontaires. Dès le premier signe, il faut s'arrêter en sécurité.",
                    "La meilleure prévention reste le repos avant le départ (7 à 8 heures de sommeil), des pauses régulières (15 à 20 minutes toutes les 2 heures), une alimentation légère, et l'évitement des créneaux à risque (entre 2 h et 5 h du matin, et entre 13 h et 15 h).",
                    "La micro-sieste est l'outil le plus efficace : 15 à 20 minutes les yeux fermés en position semi-allongée suffisent à restaurer la vigilance pendant 1 à 2 heures. Plus long, on entre en sommeil profond et le réveil est laborieux. Une micro-sieste suivie d'un café démultiplie l'effet.",
                ],
                keyPoints: [
                    "Pause de 15-20 min toutes les 2 heures sur long trajet.",
                    "Signes d'alerte : bâillements, paupières lourdes, écarts.",
                    "Ne JAMAIS attendre pour s'arrêter — premier signe = arrêt.",
                    "Créneaux à risque : 2 h–5 h et 13 h–15 h.",
                    "Micro-sieste 15-20 min = restauration vigilance 1-2h.",
                ],
            },
        ],
    },
    {
        id: "m5",
        title: "Module 5 — Sécurité, mécanique et urgences",
        summary: "Alcool, équipements de sécurité, vérifications, premiers secours.",
        lessons: [
            {
                id: "m5l1",
                title: "Alcool, drogue et médicaments",
                duration: "7 min",
                tldr: "Limite légale : 0,5 g/L de sang. Au-delà : suspension, amende, prison si accident. Certains médicaments altèrent la vigilance.",
                body: [
                    "Le taux d'alcoolémie maximum autorisé au Bénin est de 0,5 g/L de sang, soit 0,25 mg/L d'air expiré. Au-delà, le conducteur s'expose à une suspension immédiate du permis, à une amende de 50 000 à 500 000 FCFA, et à une peine d'emprisonnement pouvant aller jusqu'à 2 ans en cas d'accident corporel.",
                    "L'alcool agit sur trois plans : il diminue le champ visuel (vision tunnel), allonge le temps de réaction de 0,3 à 1 seconde, et altère le jugement (sous-estimation des risques, surestimation de ses capacités). Un seul verre suffit à dégrader la vigilance.",
                    "Les drogues (cannabis, cocaïne, opiacés) sont strictement interdites au volant — tolérance zéro. Certains médicaments (anxiolytiques, somnifères, antihistaminiques) portent un pictogramme triangulaire d'avertissement : il est impératif de lire la notice avant de conduire.",
                    "Le métabolisme de l'alcool est lent et incompressible : aucun « remède miracle » ne fait baisser l'alcoolémie. Café, douche froide, exercice, citron, eau gazeuse n'ont aucun effet — seul le temps agit (environ 0,15 g/L par heure). Pour une soirée avec 3 verres, il faut au moins 4 heures avant de reprendre le volant en sécurité.",
                ],
                keyPoints: [
                    "Limite légale : 0,5 g/L de sang (0,25 mg/L d'air).",
                    "Un verre standard = environ 0,2 g/L (variable selon le poids).",
                    "Drogues : tolérance zéro, dépistage salivaire.",
                    "Médicaments à pictogramme : ne pas conduire sans avis médical.",
                    "Seul le temps fait baisser l'alcoolémie (≈ 0,15 g/L par heure).",
                ],
                illustration: "alcohol",
                mistakes: [
                    "Café, douche froide, sport : aucun effet sur l'alcoolémie.",
                    "« Un seul verre, ça passe » : déjà 0,2 g/L de moins de réaction.",
                ],
            },
            {
                id: "m5l2",
                title: "Ceinture, airbag et systèmes de retenue",
                duration: "6 min",
                tldr: "La ceinture multiplie par 3 vos chances de survie en cas de choc. Obligatoire pour TOUS les occupants. Airbag = complément, pas substitut.",
                body: [
                    "La ceinture de sécurité est le dispositif le plus efficace jamais inventé pour la sécurité automobile. À 50 km/h, un choc frontal sans ceinture équivaut à une chute du 4e étage. La ceinture maintient le corps en place, répartit l'énergie du choc sur les zones les plus résistantes (bassin, thorax) et empêche l'éjection — première cause de mortalité en cas d'accident.",
                    "Au Bénin, la ceinture est obligatoire pour tous les occupants (avant et arrière) depuis l'arrêté de 2018. Le non-port est sanctionné d'une amende de 10 000 à 25 000 FCFA. La sangle doit passer sur l'épaule (pas sous le bras), à plat sur le bassin (pas sur le ventre), sans vrille.",
                    "L'airbag (coussin gonflable) est un complément qui ne fonctionne efficacement qu'avec une ceinture bouclée. Sans ceinture, l'airbag se déploie à 300 km/h et peut blesser gravement (fractures, brûlures). Il se déclenche en quelques millisecondes lors d'un choc frontal violent.",
                    "Pour les enfants : siège dos à la route OBLIGATOIRE jusqu'à 13 kg, et l'airbag passager DOIT être désactivé si un siège dos à la route est installé à l'avant — son déclenchement projetterait l'enfant violemment contre le siège.",
                ],
                keyPoints: [
                    "Ceinture obligatoire pour TOUS, devant et derrière.",
                    "Sangle sur l'épaule, à plat sur le bassin, sans vrille.",
                    "Airbag = complément, inefficace voire dangereux sans ceinture.",
                    "Siège dos à la route à l'avant : DÉSACTIVER l'airbag passager.",
                    "Choc à 50 km/h sans ceinture = chute du 4e étage.",
                ],
                illustration: "seatbelt",
                mistakes: [
                    "Passer la sangle sous le bras : fracture de côtes ou de clavicule au choc.",
                    "Désactiver le rappel sonore et ne pas boucler : amende + risque vital.",
                ],
            },
            {
                id: "m5l3",
                title: "Vérifications mécaniques de base",
                duration: "8 min",
                tldr: "Avant chaque long trajet : pneus (pression, usure), niveaux (huile, liquide de frein, refroidissement), feux, essuie-glaces.",
                body: [
                    "Un véhicule en bon état est la première condition de la sécurité. Les vérifications de base ne demandent que 5 à 10 minutes et préviennent la majorité des pannes et incidents. Elles se font à froid, véhicule à plat, moteur arrêté depuis au moins 15 minutes pour les niveaux.",
                    "Les PNEUS méritent une attention prioritaire. Vérifier la pression au moins une fois par mois et avant chaque long trajet (valeurs constructeur indiquées sur l'étiquette dans la portière conducteur). Une pression incorrecte augmente la consommation, dégrade la tenue de route et fait éclater le pneu en autoroute. L'usure se contrôle avec les témoins d'usure (petits reliefs dans les rainures) : si la gomme arrive à leur niveau, le pneu est à remplacer immédiatement. Profondeur minimale légale : 1,6 mm.",
                    "Les NIVEAUX à contrôler tous les 1 000 km : huile moteur (jauge entre MIN et MAX), liquide de refroidissement (vase d'expansion entre MIN et MAX), liquide de frein (réservoir transparent près du maître-cylindre), liquide lave-glace, et batterie pour les modèles à entretien. Un voyant rouge au tableau de bord = arrêt immédiat. Un voyant orange = consultation du concessionnaire rapidement.",
                    "Les ÉQUIPEMENTS LUMINEUX doivent être testés régulièrement : feux de position, croisement, route, antibrouillard avant/arrière, clignotants avant/arrière, stop, feux de recul, plaque. Tester seul est faisable en se garant face à un mur ou en sollicitant un proche. Les essuie-glaces doivent laisser le pare-brise net en un passage : sinon, remplacer les balais (durée de vie ~1 an).",
                ],
                keyPoints: [
                    "Pression des pneus : 1×/mois + avant long trajet.",
                    "Profondeur de gomme minimum légale : 1,6 mm.",
                    "Niveaux tous les 1 000 km : huile, refroidissement, frein.",
                    "Voyant rouge = arrêt immédiat. Orange = consultation rapide.",
                    "Tester feux et clignotants chaque semaine.",
                ],
                illustration: "tire-check",
                mistakes: [
                    "Vérifier le niveau d'huile à chaud : lecture faussée, surplus possible.",
                    "Rouler avec un pneu lisse : aquaplaning + éclatement = perte de contrôle.",
                ],
            },
            {
                id: "m5l4",
                title: "Premiers gestes en cas d'accident",
                duration: "8 min",
                tldr: "Mémoriser PAS : Protéger, Alerter, Secourir. Numéros : 117 (police), 118 (pompiers), 112 (urgences).",
                body: [
                    "La séquence PAS (Protéger, Alerter, Secourir) est universelle et doit être appliquée dans cet ordre strict. Inverser ces étapes peut provoquer un suraccident ou aggraver l'état des blessés.",
                    "PROTÉGER : sécuriser la zone pour éviter un nouvel accident. Allumer les feux de détresse, placer le triangle de présignalisation à 30 m minimum (150 m sur voie rapide), faire descendre les passagers du côté opposé à la circulation, couper le contact des véhicules accidentés.",
                    "ALERTER : appeler les secours en donnant des informations précises (lieu exact, nombre de véhicules, nombre et état apparent des blessés, présence de matières dangereuses). Numéros utiles : 117 (police), 118 (sapeurs-pompiers), 112 (numéro européen reconnu au Bénin).",
                    "SECOURIR : n'intervenez sur les blessés que si vous êtes formé aux premiers secours. Ne déplacez jamais un blessé sauf danger immédiat (incendie, immersion). Parlez-lui pour le rassurer, couvrez-le pour éviter le choc thermique.",
                    "Le constat amiable doit être rempli même en cas de désaccord — chaque partie remplit sa version. Photographier la scène, les plaques d'immatriculation, les dégâts, et noter les coordonnées des témoins. Ne JAMAIS reconnaître sa responsabilité sur place : c'est l'assurance qui détermine les responsabilités à partir du constat.",
                ],
                keyPoints: [
                    "Séquence PAS : Protéger → Alerter → Secourir, dans cet ordre.",
                    "Triangle à 30 m (route ordinaire) / 150 m (voie rapide).",
                    "Numéros : 117 (police), 118 (pompiers), 112 (urgences).",
                    "Ne JAMAIS déplacer un blessé sauf danger immédiat.",
                    "Couper le contact pour éviter tout risque d'incendie.",
                    "Constat à remplir + photos + témoins. Ne pas reconnaître de tort.",
                ],
                illustration: "first-aid",
                mistakes: [
                    "Se précipiter sur les blessés sans sécuriser la zone : risque de suraccident.",
                    "Retirer le casque d'un motard blessé : risque de lésion cervicale.",
                ],
            },
        ],
    },
];

async function loadCompleted(): Promise<Set<string>> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user)
        throw userError ?? new Error("Session utilisateur introuvable");

    const { data, error } = await supabase
        .from("theorie_progress")
        .select("lesson_id")
        .eq("user_id", userData.user.id);
    if (error) throw error;
    return new Set((data ?? []).map((row) => row.lesson_id));
}

async function saveCompleted(set: Set<string>) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user)
        throw userError ?? new Error("Session utilisateur introuvable");

    const userId = userData.user.id;
    const { data: currentRows, error: currentError } = await supabase
        .from("theorie_progress")
        .select("lesson_id")
        .eq("user_id", userId);
    if (currentError) throw currentError;

    const nextIds = new Set(set);
    const removedIds = (currentRows ?? [])
        .map((row) => row.lesson_id)
        .filter((lessonId) => !nextIds.has(lessonId));
    if (removedIds.length) {
        const { error } = await supabase
            .from("theorie_progress")
            .delete()
            .eq("user_id", userId)
            .in("lesson_id", removedIds);
        if (error) throw error;
    }

    const rows = [...nextIds].map((lesson_id) => ({ user_id: userId, lesson_id }));
    if (rows.length) {
        const { error } = await supabase
            .from("theorie_progress")
            .upsert(rows, { onConflict: "user_id,lesson_id" });
        if (error) throw error;
    }
}

/* ───────── Illustrations ───────── */

function SignThumb({
    type,
    icon,
    label,
    wide,
}: {
    type: "danger" | "interdiction" | "obligation" | "indication" | "stop" | "priority" | "ceder";
    icon: React.ReactNode;
    label: string;
    wide?: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className={wide ? "h-16 w-20" : "size-16"}>
                <SignShape type={type} icon={icon} />
            </div>
            <span className="text-[10px] text-charcoal/60">{label}</span>
        </div>
    );
}

function LessonIllustration({ kind }: { kind: IllustrationKind }) {
    if (kind === "signs-danger") {
        return (
            <div className="grid grid-cols-3 gap-3">
                <SignThumb type="danger" icon={<VirageDroiteIcon />} label="Virage" />
                <SignThumb type="danger" icon={<DosDaneIcon />} label="Dos d'âne" />
                <SignThumb type="danger" icon={<ChausseeGlissanteIcon />} label="Glissant" />
            </div>
        );
    }
    if (kind === "signs-interdiction") {
        return (
            <div className="grid grid-cols-3 gap-3">
                <SignThumb type="interdiction" icon={<SensInterditIcon />} label="Sens interdit" />
                <SignThumb type="interdiction" icon={<Vitesse50Icon />} label="50 km/h" />
                <SignThumb
                    type="interdiction"
                    icon={<StationnementInterditIcon />}
                    label="Stationnement"
                />
            </div>
        );
    }
    if (kind === "signs-obligation") {
        return (
            <div className="grid grid-cols-3 gap-3">
                <SignThumb
                    type="obligation"
                    icon={<TournerDroiteIcon />}
                    label="Tournez à droite"
                />
                <SignThumb type="indication" icon={<HospitalIcon />} label="Hôpital" wide />
                <SignThumb type="indication" icon={<ParkingIcon />} label="Parking" wide />
            </div>
        );
    }
    if (kind === "signs-priority") {
        return (
            <div className="grid grid-cols-3 gap-3">
                <SignThumb type="stop" icon={null} label="Arrêt obligatoire" />
                <SignThumb type="ceder" icon={null} label="Cédez le passage" />
                <SignThumb type="priority" icon={null} label="Route prioritaire" />
            </div>
        );
    }
    if (kind === "speed") {
        return (
            <div className="grid grid-cols-3 gap-3">
                <SignThumb type="interdiction" icon={<Vitesse30Icon />} label="Zone scolaire" />
                <SignThumb type="interdiction" icon={<Vitesse50Icon />} label="Agglomération" />
                <div className="flex flex-col items-center gap-1.5">
                    <div className="size-16">
                        <svg viewBox="0 0 100 100" className="size-full">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="white"
                                stroke="#e8112d"
                                strokeWidth="6"
                            />
                            <text
                                x="50"
                                y="62"
                                textAnchor="middle"
                                fill="#18181b"
                                fontSize="24"
                                fontWeight="bold"
                                fontFamily="sans-serif"
                            >
                                90
                            </text>
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
                <line
                    x1="0"
                    y1="70"
                    x2="320"
                    y2="70"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="14 10"
                />
                <rect x="60" y="76" width="44" height="20" rx="3" fill="#94a3b8" />
                <rect x="170" y="48" width="44" height="20" rx="3" fill="#008751" />
                <path
                    d="M104,86 Q137,86 137,58 L165,58"
                    fill="none"
                    stroke="#e8112d"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    markerEnd="url(#ar)"
                />
                <defs>
                    <marker
                        id="ar"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                    >
                        <path d="M0,0 L10,5 L0,10 z" fill="#e8112d" />
                    </marker>
                </defs>
                <text
                    x="160"
                    y="20"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#18181b"
                    fontFamily="sans-serif"
                >
                    Déboîtement franc à gauche
                </text>
            </svg>
        );
    }
    if (kind === "intersection") {
        return (
            <svg viewBox="0 0 240 200" className="w-full max-w-xs">
                {/* roads */}
                <rect x="90" y="0" width="60" height="200" fill="#d4d4d8" />
                <rect x="0" y="80" width="240" height="60" fill="#d4d4d8" />
                {/* dashed center lines */}
                <line
                    x1="120"
                    y1="0"
                    x2="120"
                    y2="80"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                />
                <line
                    x1="120"
                    y1="140"
                    x2="120"
                    y2="200"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                />
                <line
                    x1="0"
                    y1="110"
                    x2="90"
                    y2="110"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                />
                <line
                    x1="150"
                    y1="110"
                    x2="240"
                    y2="110"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                />
                {/* car coming from right (priority) */}
                <rect x="186" y="100" width="34" height="18" rx="3" fill="#008751" />
                <text
                    x="203"
                    y="92"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#008751"
                    fontWeight="bold"
                >
                    PRIORITÉ
                </text>
                {/* my car (waiting) */}
                <rect x="106" y="148" width="22" height="34" rx="3" fill="#e8112d" />
                <text
                    x="117"
                    y="195"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#e8112d"
                    fontWeight="bold"
                >
                    VOUS
                </text>
                {/* arrow priority */}
                <path
                    d="M186,109 L150,109"
                    stroke="#008751"
                    strokeWidth="2"
                    markerEnd="url(#ar2)"
                />
                <defs>
                    <marker
                        id="ar2"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                    >
                        <path d="M0,0 L10,5 L0,10 z" fill="#008751" />
                    </marker>
                </defs>
            </svg>
        );
    }
    if (kind === "roundabout") {
        return (
            <svg viewBox="0 0 240 240" className="w-full max-w-xs">
                {/* roads */}
                <rect x="100" y="0" width="40" height="80" fill="#d4d4d8" />
                <rect x="100" y="160" width="40" height="80" fill="#d4d4d8" />
                <rect x="0" y="100" width="80" height="40" fill="#d4d4d8" />
                <rect x="160" y="100" width="80" height="40" fill="#d4d4d8" />
                {/* roundabout ring */}
                <circle cx="120" cy="120" r="60" fill="none" stroke="#d4d4d8" strokeWidth="40" />
                <circle cx="120" cy="120" r="22" fill="#86efac" />
                {/* arrows */}
                <path
                    d="M120,75 A45,45 0 0,1 165,120"
                    fill="none"
                    stroke="#008751"
                    strokeWidth="3"
                    markerEnd="url(#ar3)"
                />
                <defs>
                    <marker
                        id="ar3"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                    >
                        <path d="M0,0 L10,5 L0,10 z" fill="#008751" />
                    </marker>
                </defs>
                {/* my car entering */}
                <rect x="109" y="190" width="22" height="32" rx="3" fill="#e8112d" />
                <text
                    x="120"
                    y="235"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#e8112d"
                    fontWeight="bold"
                >
                    CÉDEZ
                </text>
                <text
                    x="120"
                    y="125"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#18181b"
                    fontWeight="bold"
                >
                    Sens unique
                </text>
            </svg>
        );
    }
    if (kind === "safety-distance") {
        return (
            <svg viewBox="0 0 320 100" className="w-full max-w-sm">
                <rect x="0" y="30" width="320" height="50" fill="#d4d4d8" />
                <line
                    x1="0"
                    y1="55"
                    x2="320"
                    y2="55"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="14 10"
                />
                <rect x="30" y="38" width="44" height="22" rx="3" fill="#94a3b8" />
                <rect x="210" y="38" width="44" height="22" rx="3" fill="#008751" />
                <line
                    x1="76"
                    y1="50"
                    x2="208"
                    y2="50"
                    stroke="#e8112d"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                />
                <text
                    x="142"
                    y="22"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#e8112d"
                >
                    ~ 2 secondes
                </text>
                <text x="142" y="90" textAnchor="middle" fontSize="9" fill="#18181b">
                    50 m à 90 km/h
                </text>
            </svg>
        );
    }
    if (kind === "blind-spot") {
        return (
            <svg viewBox="0 0 240 180" className="w-full max-w-xs">
                {/* car */}
                <rect x="100" y="60" width="40" height="80" rx="6" fill="#18181b" />
                <rect x="105" y="68" width="30" height="24" rx="2" fill="#60a5fa" opacity="0.7" />
                {/* mirrors fields */}
                <polygon points="100,80 30,40 30,140 100,120" fill="#86efac" opacity="0.35" />
                <polygon points="140,80 210,40 210,140 140,120" fill="#86efac" opacity="0.35" />
                {/* blind spots */}
                <polygon points="100,120 30,140 30,180 100,180" fill="#e8112d" opacity="0.35" />
                <polygon points="140,120 210,140 210,180 140,180" fill="#e8112d" opacity="0.35" />
                <text x="60" y="170" fontSize="9" fill="#e8112d" fontWeight="bold">
                    Angle mort
                </text>
                <text x="155" y="170" fontSize="9" fill="#e8112d" fontWeight="bold">
                    Angle mort
                </text>
                <text x="50" y="35" fontSize="9" fill="#16a34a" fontWeight="bold">
                    Vu dans rétro
                </text>
            </svg>
        );
    }
    if (kind === "seatbelt") {
        return (
            <svg viewBox="0 0 200 160" className="w-full max-w-xs">
                {/* seat */}
                <rect x="60" y="30" width="80" height="110" rx="10" fill="#52525b" />
                {/* body */}
                <circle cx="100" cy="55" r="14" fill="#fbbf24" />
                <rect x="82" y="70" width="36" height="50" rx="6" fill="#fbbf24" />
                {/* belt */}
                <path
                    d="M75,40 L120,85 L120,120 L80,120"
                    fill="none"
                    stroke="#e8112d"
                    strokeWidth="5"
                    strokeLinejoin="round"
                />
                <circle cx="120" cy="85" r="3" fill="#18181b" />
                <text
                    x="100"
                    y="155"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#18181b"
                    fontWeight="bold"
                >
                    Sangle : épaule + bassin
                </text>
            </svg>
        );
    }
    if (kind === "helmet") {
        return (
            <svg viewBox="0 0 200 160" className="w-full max-w-xs">
                {/* helmet shape */}
                <path d="M50,90 Q50,30 100,30 Q150,30 150,90 L150,110 L50,110 Z" fill="#18181b" />
                <path
                    d="M65,80 Q65,45 100,45 Q135,45 135,80 L135,95 L65,95 Z"
                    fill="#60a5fa"
                    opacity="0.85"
                />
                <rect x="50" y="105" width="100" height="8" fill="#27272a" />
                {/* strap */}
                <path
                    d="M55,110 L70,135 L130,135 L145,110"
                    fill="none"
                    stroke="#e8112d"
                    strokeWidth="3"
                />
                <text
                    x="100"
                    y="155"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#18181b"
                    fontWeight="bold"
                >
                    Norme ECE 22-05 + jugulaire
                </text>
            </svg>
        );
    }
    if (kind === "traffic-lights") {
        return (
            <div className="flex items-center justify-center gap-4">
                {(["#e8112d", "#fbbf24", "#16a34a"] as const).map((color, i) => (
                    <div key={color} className="flex flex-col items-center gap-1.5">
                        <svg viewBox="0 0 60 140" className="h-28">
                            <rect x="10" y="5" width="40" height="130" rx="8" fill="#18181b" />
                            <circle cx="30" cy="30" r="14" fill={i === 0 ? color : "#27272a"} />
                            <circle cx="30" cy="70" r="14" fill={i === 1 ? color : "#27272a"} />
                            <circle cx="30" cy="110" r="14" fill={i === 2 ? color : "#27272a"} />
                        </svg>
                        <span className="text-[10px] text-charcoal/60">
                            {i === 0 ? "Arrêt" : i === 1 ? "Prudence" : "Passage"}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    if (kind === "rain") {
        return (
            <svg viewBox="0 0 240 160" className="w-full max-w-xs">
                <rect x="0" y="100" width="240" height="60" fill="#475569" />
                <line
                    x1="0"
                    y1="125"
                    x2="240"
                    y2="125"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="12 8"
                />
                <rect x="90" y="108" width="50" height="22" rx="3" fill="#008751" />
                {/* rain drops */}
                {Array.from({ length: 25 }).map((_, i) => (
                    <line
                        key={i}
                        x1={(i * 11) % 240}
                        y1={(i * 13) % 90}
                        x2={((i * 11) % 240) - 4}
                        y2={((i * 13) % 90) + 12}
                        stroke="#60a5fa"
                        strokeWidth="1.5"
                        opacity="0.7"
                    />
                ))}
                <text
                    x="120"
                    y="22"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#60a5fa"
                >
                    Vitesse −10 km/h · feux ON
                </text>
            </svg>
        );
    }
    if (kind === "night") {
        return (
            <svg viewBox="0 0 240 140" className="w-full max-w-xs">
                <rect x="0" y="0" width="240" height="140" fill="#0f172a" />
                <rect x="0" y="80" width="240" height="60" fill="#1e293b" />
                <line
                    x1="0"
                    y1="110"
                    x2="240"
                    y2="110"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="10 8"
                />
                <rect x="100" y="92" width="40" height="22" rx="3" fill="#27272a" />
                {/* headlight cones */}
                <polygon points="140,98 220,80 220,118 140,112" fill="#fef3c7" opacity="0.45" />
                <polygon points="140,108 220,118 220,140 140,118" fill="#fef3c7" opacity="0.2" />
                <text
                    x="120"
                    y="25"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#fef3c7"
                >
                    Portée codes ≈ 30 m
                </text>
            </svg>
        );
    }
    if (kind === "fog") {
        return (
            <svg viewBox="0 0 240 140" className="w-full max-w-xs">
                <rect x="0" y="0" width="240" height="140" fill="#e2e8f0" />
                <rect x="0" y="90" width="240" height="50" fill="#cbd5e1" />
                <rect x="100" y="98" width="40" height="22" rx="3" fill="#475569" opacity="0.6" />
                <circle cx="60" cy="70" r="22" fill="white" opacity="0.7" />
                <circle cx="170" cy="55" r="28" fill="white" opacity="0.6" />
                <circle cx="200" cy="80" r="18" fill="white" opacity="0.7" />
                <text
                    x="120"
                    y="25"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#475569"
                >
                    Antibrouillards AV + AR · pas de pleins phares
                </text>
            </svg>
        );
    }
    if (kind === "lane-position") {
        return (
            <svg viewBox="0 0 240 160" className="w-full max-w-xs">
                <rect x="0" y="0" width="240" height="160" fill="#d4d4d8" />
                {/* solid line */}
                <line x1="120" y1="0" x2="120" y2="55" stroke="white" strokeWidth="3" />
                {/* dashed line */}
                <line
                    x1="120"
                    y1="60"
                    x2="120"
                    y2="160"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray="12 8"
                />
                {/* yellow curb line */}
                <line x1="6" y1="0" x2="6" y2="160" stroke="#fbbf24" strokeWidth="4" />
                <line
                    x1="234"
                    y1="0"
                    x2="234"
                    y2="160"
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeDasharray="10 6"
                />
                <text x="60" y="40" fontSize="9" fontWeight="bold" fill="white">
                    Continue
                </text>
                <text x="60" y="110" fontSize="9" fontWeight="bold" fill="white">
                    Discontinue
                </text>
                <text x="180" y="35" fontSize="9" fontWeight="bold" fill="#a16207">
                    Stat. interdit
                </text>
            </svg>
        );
    }
    if (kind === "pedestrian-crossing") {
        return (
            <svg viewBox="0 0 240 140" className="w-full max-w-xs">
                <rect x="0" y="40" width="240" height="80" fill="#d4d4d8" />
                {/* zebra */}
                {Array.from({ length: 7 }).map((_, i) => (
                    <rect key={i} x={90 + i * 10} y={42} width="6" height="76" fill="white" />
                ))}
                {/* pedestrian */}
                <circle cx="120" cy="55" r="5" fill="#18181b" />
                <rect x="116" y="60" width="8" height="20" rx="2" fill="#18181b" />
                <line x1="120" y1="80" x2="116" y2="95" stroke="#18181b" strokeWidth="2" />
                <line x1="120" y1="80" x2="124" y2="95" stroke="#18181b" strokeWidth="2" />
                {/* car stopped */}
                <rect x="30" y="68" width="40" height="22" rx="3" fill="#e8112d" />
                <text
                    x="50"
                    y="25"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#e8112d"
                >
                    Arrêt obligatoire
                </text>
            </svg>
        );
    }
    if (kind === "tire-check") {
        return (
            <svg viewBox="0 0 240 140" className="w-full max-w-xs">
                <circle cx="80" cy="70" r="50" fill="#18181b" />
                <circle cx="80" cy="70" r="22" fill="#71717a" />
                {/* tread marks */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <rect
                        key={i}
                        x={75}
                        y={28}
                        width="10"
                        height="14"
                        transform={`rotate(${i * 45} 80 70)`}
                        fill="#3f3f46"
                    />
                ))}
                <text x="160" y="40" fontSize="10" fontWeight="bold" fill="#18181b">
                    Pression OK
                </text>
                <text x="160" y="60" fontSize="10" fill="#18181b">
                    Témoin d'usure
                </text>
                <text x="160" y="76" fontSize="10" fill="#18181b">
                    ≥ 1,6 mm
                </text>
                <text x="160" y="100" fontSize="10" fontWeight="bold" fill="#16a34a">
                    Vérif. mensuelle
                </text>
            </svg>
        );
    }
    if (kind === "first-aid") {
        return (
            <svg viewBox="0 0 240 140" className="w-full max-w-xs">
                <rect x="0" y="0" width="240" height="140" fill="white" />
                {[
                    { x: 30, color: "#e8112d", letter: "P", label: "Protéger" },
                    { x: 100, color: "#fbbf24", letter: "A", label: "Alerter" },
                    { x: 170, color: "#008751", letter: "S", label: "Secourir" },
                ].map((step) => (
                    <g key={step.letter}>
                        <circle cx={step.x + 20} cy="50" r="28" fill={step.color} />
                        <text
                            x={step.x + 20}
                            y="58"
                            textAnchor="middle"
                            fontSize="26"
                            fontWeight="bold"
                            fill="white"
                        >
                            {step.letter}
                        </text>
                        <text
                            x={step.x + 20}
                            y="100"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#18181b"
                        >
                            {step.label}
                        </text>
                    </g>
                ))}
                <text x="120" y="128" textAnchor="middle" fontSize="10" fill="#18181b">
                    117 Police · 118 Pompiers · 112 Urgences
                </text>
            </svg>
        );
    }
    if (kind === "alcohol") {
        return (
            <svg viewBox="0 0 240 140" className="w-full max-w-xs">
                {/* limit bar */}
                <rect x="20" y="60" width="200" height="20" rx="4" fill="#e5e5e5" />
                <rect x="20" y="60" width="100" height="20" rx="4" fill="#16a34a" />
                <rect x="120" y="60" width="100" height="20" rx="4" fill="#e8112d" />
                <line x1="120" y1="50" x2="120" y2="90" stroke="#18181b" strokeWidth="2" />
                <text
                    x="120"
                    y="42"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#18181b"
                >
                    0,5 g/L
                </text>
                <text
                    x="70"
                    y="105"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#16a34a"
                    fontWeight="bold"
                >
                    Légal
                </text>
                <text
                    x="170"
                    y="105"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#e8112d"
                    fontWeight="bold"
                >
                    Sanction + risque vital
                </text>
                <text x="120" y="128" textAnchor="middle" fontSize="9" fill="#18181b">
                    Métabolisme : −0,15 g/L par heure
                </text>
            </svg>
        );
    }
    if (kind === "child-seat") {
        return (
            <svg viewBox="0 0 240 140" className="w-full max-w-xs">
                {/* car interior simplified */}
                <rect x="20" y="20" width="200" height="100" rx="10" fill="#e5e5e5" />
                {/* seat */}
                <rect x="80" y="40" width="80" height="70" rx="8" fill="#52525b" />
                {/* child seat */}
                <path d="M95,55 L145,55 L145,100 L95,100 Z" fill="#fbbf24" />
                <circle cx="120" cy="70" r="9" fill="#fef3c7" />
                <rect x="115" y="78" width="10" height="18" rx="2" fill="#fef3c7" />
                <text
                    x="120"
                    y="135"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#18181b"
                >
                    Siège homologué à l'arrière
                </text>
            </svg>
        );
    }
    if (kind === "parking-types") {
        return (
            <svg viewBox="0 0 240 140" className="w-full max-w-xs">
                {/* curb */}
                <line x1="0" y1="35" x2="240" y2="35" stroke="#fbbf24" strokeWidth="3" />
                {/* parallel (créneau) */}
                <rect x="10" y="45" width="60" height="28" rx="3" fill="#008751" />
                <text x="40" y="90" textAnchor="middle" fontSize="9" fill="#18181b">
                    Créneau
                </text>
                {/* perpendicular */}
                <rect x="95" y="40" width="28" height="55" rx="3" fill="#e8112d" />
                <rect x="130" y="40" width="28" height="55" rx="3" fill="#94a3b8" />
                <text x="125" y="108" textAnchor="middle" fontSize="9" fill="#18181b">
                    Bataille
                </text>
                {/* angled */}
                <g transform="translate(180,40) rotate(35)">
                    <rect x="0" y="0" width="28" height="55" rx="3" fill="#fbbf24" />
                </g>
                <text x="195" y="125" textAnchor="middle" fontSize="9" fill="#18181b">
                    Épi
                </text>
            </svg>
        );
    }
    return null;
}

function Theorie() {
    const [category, setCategory] = useState<string | null>(null);
    const displayModules = useMemo(() => {
        const names = categoryLessonContent[category ?? ""] ?? [];
        const focus = categoryCurriculum[category ?? ""] ?? [];
        return modules.map((module, moduleIndex) => ({
            ...module,
            title: names[moduleIndex]
                ? `${categoryGuidance[category ?? ""]?.title ?? "Parcours"} — ${names[moduleIndex]}`
                : module.title,
            summary:
                focus[moduleIndex] ?? categoryGuidance[category ?? ""]?.focus ?? module.summary,
            lessons: module.lessons.map((lesson, lessonIndex) =>
                lessonIndex === 0 && names[moduleIndex]
                    ? {
                          ...lesson,
                          title: names[moduleIndex],
                          tldr: `${names[moduleIndex]} : ${categoryGuidance[category ?? ""]?.focus ?? lesson.tldr}.`,
                      }
                    : lesson,
            ),
        }));
    }, [category]);
    const allLessons = useMemo(() => displayModules.flatMap((m) => m.lessons), [displayModules]);
    const [completed, setCompleted] = useState<Set<string>>(new Set());
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [mode, setMode] = useState<"full" | "review">("full");
    const [progressError, setProgressError] = useState<string | null>(null);
    const [lessonCheckPassed, setLessonCheckPassed] = useState(false);
    const [lessonCheckAnswer, setLessonCheckAnswer] = useState<number | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            if (!data.user) return;
            const { data: profile } = await supabase
                .from("profiles")
                .select("category")
                .eq("id", data.user.id)
                .maybeSingle();
            setCategory(profile?.category ?? null);
        });
        loadCompleted()
            .then((next) => setCompleted(next))
            .catch((error: unknown) => {
                setProgressError(
                    error instanceof Error
                        ? error.message
                        : "Impossible de charger la progression.",
                );
            });
    }, []);

    const total = allLessons.length;
    const done = completed.size;
    const percent = Math.round((done / total) * 100);

    const activeLesson = activeLessonId
        ? (allLessons.find((l) => l.id === activeLessonId) ?? null)
        : null;
    const activeIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1;

    async function toggle(id: string, value: boolean) {
        const next = new Set(completed);
        if (value) next.add(id);
        else next.delete(id);
        try {
            await saveCompleted(next);
            setProgressError(null);
            setCompleted(next);
        } catch (error) {
            setProgressError(
                error instanceof Error ? error.message : "Impossible d'enregistrer la progression.",
            );
        }
    }

    async function reset() {
        if (!confirm("Réinitialiser toute votre progression ?")) return;
        try {
            await saveCompleted(new Set());
            setCompleted(new Set());
            setProgressError(null);
        } catch (error) {
            setProgressError(
                error instanceof Error
                    ? error.message
                    : "Impossible de réinitialiser la progression.",
            );
        }
    }

    function openLesson(id: string) {
        setActiveLessonId(id);
        setMode("full");
        setLessonCheckPassed(completed.has(id));
        setLessonCheckAnswer(null);
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
                        <figure className="mb-6 rounded-xl bg-white p-5 ring-1 ring-black/5">
                            <LessonIllustration kind={activeLesson.illustration} />
                            <figcaption className="mt-3 text-center text-[11px] text-charcoal/50">
                                Schéma pédagogique
                            </figcaption>
                        </figure>
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
                                    <li
                                        key={i}
                                        className="text-sm leading-relaxed text-charcoal/80"
                                    >
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

                    {!isDone && (
                        <div className="mb-5 rounded-xl bg-benin-yellow/10 p-5 ring-1 ring-benin-yellow/30">
                            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider">
                                Vérification de compréhension
                            </h2>
                            <p className="mb-3 text-sm">
                                Quel est le point essentiel de cette leçon ?
                            </p>
                            <div className="space-y-2">
                                {[
                                    activeLesson.keyPoints[0],
                                    "Je peux ignorer cette règle si la route est vide.",
                                    "Cette règle ne concerne que les professionnels.",
                                ].map((answer, index) => (
                                    <button
                                        key={answer}
                                        type="button"
                                        onClick={() => {
                                            setLessonCheckAnswer(index);
                                            setLessonCheckPassed(index === 0);
                                        }}
                                        className={`w-full rounded-md px-3 py-2 text-left text-sm ring-1 ${
                                            lessonCheckAnswer === index
                                                ? index === 0
                                                    ? "bg-benin-green/10 ring-benin-green"
                                                    : "bg-benin-red/10 ring-benin-red"
                                                : "bg-white ring-black/10"
                                        }`}
                                    >
                                        {answer}
                                    </button>
                                ))}
                            </div>
                            {lessonCheckAnswer !== null && !lessonCheckPassed && (
                                <p className="mt-2 text-xs text-benin-red">
                                    Relisez la leçon puis choisissez la règle correcte.
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        disabled={!isDone && !lessonCheckPassed}
                        onClick={() => toggle(activeLesson.id, !isDone)}
                        className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-transform active:scale-[0.98] ${
                            isDone
                                ? "bg-zinc-100 text-charcoal ring-1 ring-charcoal/10"
                                : "bg-benin-green text-white ring-1 ring-benin-green disabled:cursor-not-allowed disabled:opacity-40"
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
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/70"
                >
                    <ArrowLeft className="size-4" /> Tableau de bord
                </Link>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-benin-green">
                    Phase théorique
                </span>
            </nav>

            <header className="px-5 pb-2 pt-10">
                {progressError && (
                    <div className="mb-4 rounded-md bg-benin-red/10 p-3 text-sm text-benin-red">
                        {progressError}
                    </div>
                )}
                <span className="mb-3 inline-block rounded-sm bg-benin-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-benin-green">
                    Programme complet en ligne
                </span>
                <h1 className="mb-3 text-3xl font-semibold leading-tight md:text-4xl">
                    {categoryGuidance[category ?? ""]?.title ?? "Cours de théorie"}
                </h1>
                <p className="mb-6 max-w-[56ch] text-base text-charcoal/70">
                    {displayModules.length} modules, {total} leçons adaptées à la catégorie
                    sélectionnée, illustrées avec schémas, exemples concrets et erreurs à éviter —
                    comme en auto-école. Mode <strong>Résumé</strong> pour réviser avant chaque
                    quiz.
                </p>
                {category && categoryGuidance[category] && (
                    <div className="mb-2 rounded-xl bg-benin-yellow/15 p-4 text-sm ring-1 ring-benin-yellow/30">
                        <p>
                            <strong>Objectif moniteur — permis {category} :</strong>{" "}
                            {categoryGuidance[category].focus}.
                        </p>
                        <p className="mt-1 text-charcoal/70">
                            Mise en pratique : {categoryGuidance[category].practice}.
                        </p>
                    </div>
                )}
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
                            {done} leçon{done > 1 ? "s" : ""} terminée{done > 1 ? "s" : ""} sur{" "}
                            {total}
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
                            <strong>Bravo !</strong> Vous avez terminé la phase théorique. Passez
                            Vous pouvez maintenant passer les quiz, puis l'examen blanc.
                        </div>
                    )}
                </div>
            </section>

            <section className="px-5 pb-10">
                <div className="space-y-5">
                    {displayModules.map((mod, mIdx) => {
                        const modDone = mod.lessons.filter((l) => completed.has(l.id)).length;
                        const modPercent = Math.round((modDone / mod.lessons.length) * 100);
                        const prevModuleComplete =
                            mIdx === 0 ||
                            displayModules[mIdx - 1].lessons.every((l) => completed.has(l.id));

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
                                    {categoryCurriculum[category ?? ""]?.[mIdx] && (
                                        <p className="mt-2 text-xs font-medium text-benin-red">
                                            Parcours {category} :{" "}
                                            {categoryCurriculum[category ?? ""][mIdx]}
                                        </p>
                                    )}
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
                                                            {locked &&
                                                                " · Terminez le module précédent"}
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
                    <h2 className="mb-2 text-base font-semibold">Suite du parcours</h2>
                    <p className="text-xs leading-relaxed text-ivory/70">
                        Validez chaque leçon avec sa question pédagogique. Quand le cours est
                        terminé, ouvrez le menu latéral « Évaluations » pour les quiz séparés, puis
                        l’examen blanc mixte.
                    </p>
                </div>
            </section>
        </div>
    );
}
