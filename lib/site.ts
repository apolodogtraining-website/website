export const site = {
  name: "Apolo Dog Training",
  trainer: "Frédéric",
  role: "Entraîneur, éducateur & comportementaliste canin",
  slogan: "Connaissez-vous le super pouvoir de votre chien ?",
  tagline:
    "J'accompagne vos chiens avec bienveillance, expertise & engagement.",
  area: "Bordeaux et alentours",
  areaLong: "Bordeaux et alentours",
  url: "https://apolodogtraining.com",
  // Hôte secondaire redirigé en 301 vers `url` — voir next.config.ts
  altHost: "www.apolodogtraining.com",
  siren: "821 785 177",
  siret: "821 785 177 00022",
  // NAP : doit rester strictement identique au site, à la fiche Google et aux annuaires.
  // `street` n'est affiché que dans les mentions légales (obligation LCEN) et
  // dans le JSON-LD ; le footer se limite à la commune.
  address: {
    street: "17 chemin du Grand Camé",
    locality: "Bassens",
    postalCode: "33530",
    region: "Nouvelle-Aquitaine",
    country: "FR",
  },
  email: "apolo.dogtraining@gmail.com",
  phone: "06 23 80 76 59",
  phoneIntl: "+33623807659",
  instagram: {
    handle: "@apolodog.training",
    url: "https://www.instagram.com/apolodog.training",
  },
  facebook: {
    handle: "Apolo Dog Training",
    url: "https://www.facebook.com/apolodogtraining/",
  },
  // Informations des pages légales : identité de l'éditeur, directeur de
  // publication, hébergeur (LCEN) et médiateur de la consommation.
  // Toute modification ici se répercute sur /mentions-legales et /confidentialite.
  legal: {
    publisherStatus: "Entrepreneur individuel",
    /** Nom d'usage, celui employé dans les textes du site. */
    publisherFullName: "Jean-Frédéric Gateau",
    /** Identité telle qu'enregistrée au répertoire SIRENE. */
    publisherLegalName: "GATEAU Jean-Frédéric Nicolas",
    ape: "96.09Z — Autres services personnels n.c.a.",
    hostName: "Vercel Inc.",
    hostAddress: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    hostContact: "vercel.com",
    // Médiateur de la consommation (art. L.616-1 du code de la consommation).
    mediatorName: "CMAP — Centre de Médiation et d'Arbitrage de Paris",
    mediatorAddress: "39 avenue Franklin D. Roosevelt, 75008 Paris",
    mediatorUrl: "https://www.cmap.fr/saisir-cmap-mediation-consommation/",
    lastUpdated: "15 septembre 2026",
  },
  google: {
    // Lien court de la fiche Google Business Profile (bouton « Partager »).
    url: "https://share.google/dlBCJSUxqU4P9xuP0",
    // TODO : lien direct du formulaire d'avis — Google Business Profile →
    // « Demander des avis ». C'est celui à envoyer par SMS après une séance :
    // il ouvre le formulaire en un clic au lieu de faire chercher la fiche.
    reviewUrl: "",
    rating: 5,
    count: 30,
  },
} as const;

export const serviceAreas: string[] = [
  "Ambarès-et-Lagrave",
  "Ambès",
  "Artigues-près-Bordeaux",
  "Bassens",
  "Bègles",
  "Blanquefort",
  "Bordeaux",
  "Bouliac",
  "Bruges",
  "Carbon-Blanc",
  "Cenon",
  "Eysines",
  "Floirac",
  "Gradignan",
  "Le Bouscat",
  "Le Haillan",
  "Le Taillan-Médoc",
  "Lormont",
  "Martignas-sur-Jalle",
  "Mérignac",
  "Parempuyre",
  "Pessac",
  "Saint-Aubin-de-Médoc",
  "Saint-Louis-de-Montferrand",
  "Saint-Médard-en-Jalles",
  "Saint-Vincent-de-Paul",
  "Talence",
  "Villenave-d'Ornon",
];

export type ServiceFaq = { q: string; a: string };
export type ServiceStep = { title: string; text: string };

export type Service = {
  title: string;
  slug: string;
  tag?: string;
  /** Résumé court : cartes de la page d'accueil, listing /services, meta de repli. */
  description: string;
  icon:
    | "obedience"
    | "behaviour"
    | "walk"
    | "mantrailing"
    | "tracking"
    | "nosework"
    | "hunting";

  // ── Contenu long ────────────────────────────────────────────────────────────
  // Tant que `intro` est absent, la page bascule sur le gabarit court.
  // Objectif : 600 à 900 mots réellement propres au service, sinon les pages
  // se ressemblent trop et Google n'en positionne aucune.
  /** Titre H1 de la page — porte la requête visée, pas le nom commercial. */
  h1?: string;
  /** ≤ 60 caractères. */
  metaTitle?: string;
  /** ≤ 155 caractères : promesse, preuve, appel à l'action. */
  metaDescription?: string;
  intro?: string[];
  forWhom?: { title: string; text: string }[];
  sessionFlow?: ServiceStep[];
  benefits?: string[];
  faq?: ServiceFaq[];
  /** Slugs des services connexes — alimente le maillage interne en bas de page. */
  related?: string[];
};

export const services: Service[] = [
  {
    title: "Éducation & obéissance fonctionnelle",
    slug: "education-canine-bordeaux",
    description:
      "Les bases d'une relation sereine au quotidien : rappel, marche en laisse, autocontrôle et gestion des situations de la vie de tous les jours.",
    icon: "obedience",
  },
  {
    title: "Étude de comportement",
    slug: "bilan-comportemental-chien-bordeaux",
    description:
      "Analyse fine des comportements gênants (peurs, réactivité, agressivité, anxiété) pour comprendre leur origine et mettre en place un vrai plan d'action.",
    icon: "behaviour",
  },
  {
    title: "Balades éducatives & collectives",
    slug: "balades-educatives-bordeaux",
    description:
      "Apprendre en s'amusant, au contact d'autres chiens : socialisation, communication canine et travail en conditions réelles, en pleine nature.",
    icon: "walk",
  },
  {
    title: "Mantrailing (recherche de personnes)",
    slug: "mantrailing-bordeaux",
    tag: "Mantrailing",
    description:
      "Votre chien suit une piste odorante pour retrouver une personne. Une activité qui canalise l'énergie et renforce votre complicité.",
    icon: "mantrailing",
    h1: "Mantrailing à Bordeaux : votre chien apprend à retrouver une personne",
    metaTitle: "Mantrailing à Bordeaux et rive droite",
    metaDescription:
      "Séances de mantrailing à Bordeaux et sur la rive droite. Votre chien canalise son énergie et gagne en confiance dès les premières pistes. Tous âges, toutes races.",
    intro: [
      "Le mantrailing, c'est la recherche de personne par l'odeur. On présente au chien un objet porteur de l'odeur de quelqu'un de précis — un tee-shirt, une chaussette, un trousseau de clés — et il part suivre la trace de cette personne-là, au milieu de toutes les autres. Il travaille en harnais, au bout d'une longe de cinq à dix mètres, et c'est lui qui mène.",
      "C'est cette dernière phrase qui change tout. Dans la plupart des activités canines, l'humain décide et le chien exécute. En mantrailing le rapport s'inverse : votre chien sait quelque chose que vous ne saurez jamais, et votre travail consiste à le suivre, à lire ce qu'il vous dit, à lui faire confiance. Beaucoup de maîtres découvrent leur chien à ce moment-là.",
      "Contrairement à ce qu'on imagine, l'activité n'est réservée ni aux bergers belges ni aux chiens de sauvetage. Un teckel, un bichon, un chien de dix ans ou un chien qui ne supporte pas ses congénères peuvent tous y trouver leur compte : le nez ne dépend ni de la taille, ni de la condition physique, ni du caractère.",
    ],
    forWhom: [
      {
        title: "Le chien qui déborde d'énergie",
        text: "Vingt minutes de piste fatiguent davantage qu'une heure de balle. Le travail olfactif mobilise une part considérable du cerveau — la plupart des chiens dorment profondément après une séance.",
      },
      {
        title: "Le chien réactif ou craintif",
        text: "On travaille seul, à distance des autres chiens, sur des terrains choisis. Le chien reprend la main sur son environnement au lieu de le subir, et c'est souvent ce qui fait bouger les choses.",
      },
      {
        title: "Le chien âgé ou limité physiquement",
        text: "Une piste se marche. L'intensité se règle au mètre près, et l'activité reste stimulante pour un chien qui ne peut plus courir.",
      },
      {
        title: "Le maître qui veut comprendre son chien",
        text: "Apprendre à lire un ralentissement, une hésitation, un retour en arrière : cette lecture se transfère directement dans la vie de tous les jours.",
      },
    ],
    sessionFlow: [
      {
        title: "L'odeur de référence",
        text: "Une personne s'éloigne et laisse derrière elle un objet porteur de son odeur. On part toujours d'une situation simple et lisible pour le chien.",
      },
      {
        title: "Le départ",
        text: "Le chien sent l'objet, prend une direction et s'engage. Vous suivez à la longe, sans le guider : c'est lui qui décide où passe la piste.",
      },
      {
        title: "La piste",
        text: "Trois à dix minutes de travail selon le niveau. Virages, changements de surface, croisements avec d'autres passages : chaque difficulté est introduite quand le chien est prêt, jamais avant.",
      },
      {
        title: "La retrouvaille, puis le débriefing",
        text: "Le chien trouve la personne et la fête. On reprend ensuite ensemble ce qui s'est passé : là où il a hésité, là où vous auriez gagné à le laisser faire.",
      },
    ],
    benefits: [
      "Une dépense mentale réelle, mesurable au calme du chien dans les heures qui suivent",
      "Une relation qui se rééquilibre : il décide, vous suivez",
      "De la confiance en soi pour les chiens qui en manquent",
      "Une activité praticable seul, sans contact avec d'autres chiens",
      "Un travail qui se poursuit partout : forêt, ville, bords de Garonne",
    ],
    faq: [
      {
        q: "Mon chien n'est pas un chien de travail, est-ce que ça peut marcher ?",
        a: "Oui. Tous les chiens ont un odorat très supérieur au nôtre, y compris les races à museau court et les petits gabarits. Ce qui varie d'une race à l'autre, c'est l'endurance et le style de travail, pas la capacité à suivre une odeur.",
      },
      {
        q: "À partir de quel âge peut-on commencer le mantrailing ?",
        a: "Dès le chiot, avec des pistes très courtes et ludiques, et jusqu'à un âge avancé. C'est une des rares activités qui accompagne le chien toute sa vie sans jamais devenir trop exigeante physiquement.",
      },
      {
        q: "Mon chien est réactif aux autres chiens, est-ce compatible ?",
        a: "C'est même souvent indiqué. Les séances sont individuelles, sur des créneaux et des terrains choisis pour éviter les rencontres. Le travail olfactif abaisse le niveau d'excitation au lieu de l'augmenter.",
      },
      {
        q: "Quelle différence entre le mantrailing et le pistage ?",
        a: "Le pistage suit une trace au sol, foulée par foulée, sur un tracé généralement balisé. Le mantrailing suit l'odeur d'une personne précise telle qu'elle se disperse dans l'environnement : le chien coupe, contourne, s'adapte au vent.",
      },
      {
        q: "Quel matériel faut-il prévoir ?",
        a: "Un harnais confortable et une longue longe. Je fournis le nécessaire pour les premières séances, le temps de voir ce qui convient vraiment à votre chien.",
      },
    ],
    related: [
      "nosework-bordeaux",
      "tracking-chien-bordeaux",
      "bilan-comportemental-chien-bordeaux",
    ],
  },
  {
    title: "Tracking (pistage)",
    slug: "tracking-chien-bordeaux",
    tag: "Tracking",
    description:
      "Le pistage sportif : suivre une trace au sol, marquer les objets, développer la concentration et l'autonomie de votre chien.",
    icon: "tracking",
  },
  {
    title: "Nosework (détection sportive)",
    slug: "nosework-bordeaux",
    tag: "Nosework",
    description:
      "Le sport du flair : votre chien apprend à détecter et signaler des odeurs cibles. Idéal pour la confiance en soi et la stimulation mentale.",
    icon: "nosework",
    h1: "Nosework à Bordeaux : le sport du flair, accessible à tous les chiens",
    metaTitle: "Nosework & détection sportive à Bordeaux",
    metaDescription:
      "Séances de nosework à Bordeaux et rive droite. Votre chien apprend à détecter et signaler une odeur cible. Tous âges, toutes races, même les plus craintifs.",
    intro: [
      "Le nosework — ou détection sportive — reprend le principe du travail des chiens de détection professionnels, transposé en loisir. Votre chien apprend à reconnaître une odeur cible, à la chercher dans un espace donné, puis à signaler l'endroit exact où elle se trouve.",
      "Les odeurs de travail sont neutres et sans intérêt alimentaire : selon les règlements, on utilise généralement le bouleau, l'anis ou le clou de girofle, déposés en quantité infime sur un support. Le chien ne cherche ni nourriture ni jouet, il cherche une odeur — et c'est précisément ce qui rend l'exercice exigeant, donc gratifiant.",
      "Les recherches se déroulent sur quatre types de supports : des contenants alignés, un intérieur, un extérieur, des véhicules. On commence toujours par le plus simple, dans un cadre où le chien ne peut pas se tromper, et on complexifie à mesure qu'il comprend le jeu.",
    ],
    forWhom: [
      {
        title: "Le chien craintif ou peu sûr de lui",
        text: "C'est l'usage où les changements sont les plus visibles. Le chien réussit, seul, sans que personne ne lui dise comment faire. Cette réussite répétée se lit dans sa posture au bout de quelques séances.",
      },
      {
        title: "Le chien qui ne peut pas se dépenser physiquement",
        text: "Convalescence, arthrose, chiot en pleine croissance, race à museau court : une recherche de cinq minutes fatigue sans solliciter les articulations.",
      },
      {
        title: "Le chien qui s'ennuie à la maison",
        text: "Le nosework se pratique en intérieur, y compris les jours de pluie, dans un couloir ou un salon. Les exercices entre deux séances prennent dix minutes.",
      },
      {
        title: "Le maître qui cherche une progression",
        text: "Il existe des concours de détection sportive, organisés par niveaux. Pour ceux que ça intéresse, l'activité a un horizon bien au-delà du loisir.",
      },
    ],
    sessionFlow: [
      {
        title: "L'imprégnation",
        text: "Le chien associe l'odeur cible à quelque chose de très positif. À ce stade il n'y a rien à chercher : on construit seulement la valeur de l'odeur.",
      },
      {
        title: "Le marquage",
        text: "On installe le comportement de signalement : s'asseoir, se figer, poser le nez. Chaque chien a sa manière naturelle de dire « c'est là », on part de la sienne.",
      },
      {
        title: "La recherche",
        text: "L'odeur est cachée de plus en plus loin, de plus en plus haut, dans des contextes de plus en plus riches. Le chien apprend à gérer les courants d'air, les odeurs résiduelles et les distractions.",
      },
      {
        title: "Les recherches à l'aveugle",
        text: "Vous ne savez plus où se trouve l'odeur. C'est le moment où l'on découvre si l'on fait vraiment confiance à son chien — et où les progrès du maître comptent autant que les siens.",
      },
    ],
    benefits: [
      "Une activité praticable partout, y compris en intérieur et par mauvais temps",
      "Une dépense mentale importante pour un effort physique minime",
      "De la confiance en soi pour les chiens anxieux ou peu sûrs",
      "Des exercices courts à reproduire seul entre deux séances",
      "Une porte d'entrée vers la détection sportive en concours",
    ],
    faq: [
      {
        q: "Les odeurs utilisées sont-elles dangereuses pour mon chien ?",
        a: "Non. Ce sont des huiles essentielles usuelles, déposées en quantité infime sur un support que le chien ne touche pas. Les quantités en jeu n'ont rien de comparable avec un usage domestique de ces huiles.",
      },
      {
        q: "Faut-il une race particulière pour faire du nosework ?",
        a: "Non. Si les chiens de détection professionnels sont souvent des malinois ou des springers, c'est pour leur endurance et leur motivation au travail, pas parce qu'ils sentent mieux. En loisir, un carlin, un caniche ou un croisé font très bien l'affaire.",
      },
      {
        q: "À partir de quel âge commencer le nosework ?",
        a: "Dès deux à trois mois sous forme de jeu, et sans limite haute. Un chien qui perd la vue ou l'audition continue à travailler au nez — c'est souvent le sens qui lui reste le plus fiable.",
      },
      {
        q: "Combien de séances avant de voir des résultats ?",
        a: "Un marquage propre sur une odeur simple s'obtient généralement en trois à cinq séances. Les recherches à l'aveugle en contexte riche demandent plusieurs mois de pratique régulière.",
      },
      {
        q: "Quelle différence avec le mantrailing ?",
        a: "Le nosework cherche une odeur cible dans une zone délimitée ; le mantrailing suit l'odeur d'une personne précise sur un parcours. L'un est une recherche en espace, l'autre un suivi de trace.",
      },
    ],
    related: [
      "mantrailing-bordeaux",
      "tracking-chien-bordeaux",
      "jeux-de-chasse-chien-bordeaux",
    ],
  },
  {
    title: "Hunting games (jeux de chasse)",
    slug: "jeux-de-chasse-chien-bordeaux",
    tag: "Hunting games",
    description:
      "Des jeux qui répondent aux instincts naturels du chien de façon canalisée et sécurisée, pour un chien épanoui et équilibré.",
    icon: "hunting",
  },
];

export const nav = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Services", href: "/services" },
  { label: "Avis", href: "/avis" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

/** Pages légales : hors menu principal, mais liées depuis le footer et présentes dans le sitemap. */
export const legalNav = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
];

export type Partner = {
  name: string;
  tag: string;
  location: string;
  description: string;
  url: string;
  logo?: string;
};

export const partners: Partner[] = [
  {
    name: "CynoTrust",
    tag: "Formation pro canine",
    location: "Charente",
    description:
      "Centre de formation pour devenir éducateur comportementaliste canin. Alternance théorie à distance et mises en situation réelles, avec une pédagogie fondée sur les méthodes positives.",
    url: "https://cynotrust.fr/formation-educateur-comportementaliste-canin/",
    logo: "/partners/cynotrust.png",
  },
  {
    name: "ActivCanin",
    tag: "Agility, hooper",
    location: "Cestas (33)",
    description:
      "Éducatrice canine à Cestas spécialisée en agility, hoopers et école du chiot. Séances individuelles ou collectives pour tous niveaux, dans une approche bienveillante.",
    url: "https://activcanin.com/",
    logo: "/partners/activcanin.png",
  },
  {
    name: "Anima Canis Dog Training",
    tag: "Nutrition, mantrailing",
    location: "Toulouse — Haute-Garonne (31)",
    description:
      "Éducatrice canine à Toulouse spécialisée en accompagnement relationnel, mantrailing et nutrition. Intervient sur tous les âges et toutes les races.",
    url: "https://www.animacanis-dogtraining.com/partenaires/",
    logo: "/partners/anima-canis.png",
  },
  {
    name: "Zoomalia",
    tag: "Animalerie",
    location: "Lastrene (33)",
    description:
      "Animalerie en ligne avec plus de 845 000 références : alimentation, accessoires et produits de santé pour chiens. Magasin physique disponible en Gironde.",
    url: "https://www.zoomalia.com/",
    logo: "/partners/zoomalia.png",
  },
];
