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
    lastUpdated: "24 septembre 2026",
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

/**
 * FAQ générale : affichée sur l'accueil et sur /faq, et balisée en `FAQPage`
 * sur la page dédiée. Source unique — le composant et le balisage lisent ici.
 *
 * Objectif à terme : 12 à 15 questions reprenant les formulations réellement
 * tapées dans Google (« combien coûte un éducateur canin à Bordeaux »,
 * « différence entre éducateur et comportementaliste »), et non seulement des
 * objections de vente.
 */
export const faqGeneral: ServiceFaq[] = [
  {
    q: "Mon chien est très réactif : pouvez-vous l'accompagner ?",
    a: "Oui. L'évaluation comportementale permet de comprendre les déclencheurs, d'évaluer la situation et de proposer un accompagnement progressif, adapté à votre chien.",
  },
  {
    q: "Combien de séances faut-il prévoir ?",
    a: "Cela dépend de votre objectif, de l'historique de votre chien et de votre disponibilité. Après la première évaluation, vous aurez une recommandation claire et réaliste.",
  },
  {
    q: "Faut-il du matériel particulier ?",
    a: "Non, pas pour démarrer. Selon l'accompagnement, je vous guide vers le matériel le plus confortable et adapté à votre chien.",
  },
  {
    q: "Utilisez-vous des méthodes coercitives ?",
    a: "Non. Le travail repose sur l'observation, la coopération et des apprentissages respectueux du chien, sans rapport de force.",
  },
  {
    q: "Toute la famille peut-elle participer ?",
    a: "Oui. Pour obtenir des repères cohérents au quotidien, l'implication des personnes qui vivent avec le chien est toujours la bienvenue.",
  },
];
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
    title: "Étude de comportement",
    slug: "bilan-comportemental-chien-bordeaux",
    description:
      "Analyse fine des comportements gênants (peurs, réactivité, agressivité, anxiété) pour comprendre leur origine et mettre en place un vrai plan d'action.",
    icon: "behaviour",
    h1: "Bilan comportemental pour chien à Bordeaux : comprendre avant de corriger",
    metaTitle: "Bilan comportemental chien à Bordeaux",
    metaDescription:
      "Votre chien aboie, tire, grogne ou ne supporte pas la solitude ? Le bilan comportemental cherche la cause avant la solution. Bordeaux et rive droite.",
    intro: [
      "Un bilan comportemental n'est pas une séance d'éducation. C'est une enquête. On ne cherche pas à faire disparaître un comportement, on cherche à comprendre à quoi il sert — parce qu'un chien ne fait jamais rien sans raison, même quand la raison nous échappe.",
      "La plupart des maîtres arrivent avec une étiquette : il est dominant, il est têtu, il est jaloux, il le fait exprès. Ces mots décrivent ce qu'on voit, pas ce qui se passe. Un chien qui grogne quand on approche de sa gamelle ne conteste pas votre autorité ; il a peur qu'on lui retire sa nourriture. La nuance n'est pas de la sémantique : elle change complètement ce qu'il faut faire.",
      "À la fin du bilan, vous repartez avec une hypothèse claire sur l'origine du comportement, un plan d'action écrit et hiérarchisé, et une idée réaliste du temps que cela demandera. Y compris quand la réponse honnête est que le problème ne relève pas de moi.",
    ],
    forWhom: [
      {
        title: "Le chien qui réagit en laisse",
        text: "Aboiements, ruées, corps tendu dès qu'un congénère apparaît. C'est le motif de consultation le plus fréquent, et celui où l'écart entre ce que le maître croit voir et ce qui se joue réellement est le plus grand.",
      },
      {
        title: "Le chien qui ne supporte pas la solitude",
        text: "Destructions, vocalises, malpropreté en votre absence. Derrière ces trois symptômes se cachent des causes très différentes, et le plan d'action n'a rien à voir de l'une à l'autre.",
      },
      {
        title: "Le chien qui grogne, pince ou a mordu",
        text: "Situation délicate qui demande une évaluation posée, sans précipitation ni jugement. Le grognement est une information précieuse — un chien qui prévient est un chien qui communique encore.",
      },
      {
        title: "Le chien qui a changé",
        text: "Un comportement qui apparaît ou s'aggrave en quelques semaines mérite toujours d'être pris au sérieux. Un déménagement, un deuil, une douleur : les causes sont rarement là où on les cherche.",
      },
    ],
    sessionFlow: [
      {
        title: "L'entretien",
        text: "Avant d'observer quoi que ce soit, je vous écoute. L'historique du chien, son quotidien, ses journées type, ce qui a changé, ce que vous avez déjà essayé. C'est souvent là que se trouve la moitié de la réponse.",
      },
      {
        title: "L'observation",
        text: "Sur votre lieu de vie ou en situation réelle, selon le problème. J'observe le chien, mais aussi l'environnement et les interactions. Je ne provoque jamais délibérément le comportement qui pose problème.",
      },
      {
        title: "L'hypothèse",
        text: "Je vous explique ce que je pense qu'il se passe, en termes concrets, et pourquoi. Vous devez pouvoir contester : si l'explication ne colle pas à ce que vous vivez, c'est qu'elle est incomplète.",
      },
      {
        title: "Le plan et le suivi",
        text: "Un document écrit avec les priorités dans l'ordre, ce qui se travaille en séance et ce qui se travaille sans moi. Puis un suivi, parce qu'un plan qui ne s'ajuste pas au réel ne sert à rien.",
      },
    ],
    benefits: [
      "Une explication du comportement, pas seulement une technique pour le masquer",
      "Des priorités claires : ce qui se règle d'abord, ce qui attendra",
      "Un plan écrit que toute la famille peut appliquer de la même façon",
      "Une estimation honnête du temps nécessaire, y compris quand elle déplaît",
      "Une orientation vers le bon professionnel quand le problème n'est pas de mon ressort",
    ],
    faq: [
      {
        q: "Quelle différence entre un éducateur canin et un comportementaliste ?",
        a: "L'éducateur apprend au chien des comportements : le rappel, la marche en laisse, l'autocontrôle. Le comportementaliste cherche pourquoi un comportement existe avant de chercher à le modifier. Les deux métiers se complètent, et la plupart des situations demandent les deux — d'abord comprendre, ensuite entraîner.",
      },
      {
        q: "Mon chien a déjà mordu. Pouvez-vous intervenir ?",
        a: "Oui, mais avec une précision importante : si la morsure a été déclarée en mairie, la loi impose une évaluation comportementale réalisée par un vétérinaire inscrit sur la liste départementale. Mon bilan ne la remplace pas et n'a aucune valeur légale. Il vient en complément, pour le travail de fond.",
      },
      {
        q: "Faut-il consulter un vétérinaire avant ?",
        a: "Souvent, oui. La douleur est une cause fréquente et sous-estimée de changement de comportement, en particulier chez le chien qui devient irritable ou qui refuse le contact. Quand un doute existe, je vous demande de faire vérifier avant d'engager un travail comportemental.",
      },
      {
        q: "Combien de temps dure un bilan ?",
        a: "Comptez entre une heure trente et deux heures pour la rencontre, auxquelles s'ajoute le temps de rédaction du plan. C'est plus long qu'une séance classique, et c'est normal : l'essentiel du travail consiste à observer et à écouter.",
      },
      {
        q: "Est-ce qu'une séance suffit à régler le problème ?",
        a: "Non, et personne ne devrait vous le promettre. Le bilan pose le diagnostic et le plan ; le changement vient de ce que vous mettez en place ensuite, semaine après semaine. Selon les situations, cela va de quelques semaines à plusieurs mois.",
      },
    ],
    related: [
      "education-canine-bordeaux",
      "balades-educatives-bordeaux",
      "mantrailing-bordeaux",
    ],
  },
  {
    title: "Éducation & obéissance fonctionnelle",
    slug: "education-canine-bordeaux",
    description:
      "Les bases d'une relation sereine au quotidien : rappel, marche en laisse, autocontrôle et gestion des situations de la vie de tous les jours.",
    icon: "obedience",
  },
  {
    title: "Balades éducatives & collectives",
    slug: "balades-educatives-bordeaux",
    description:
      "Apprendre en s'amusant, au contact d'autres chiens : socialisation, communication canine et travail en conditions réelles, en pleine nature.",
    icon: "walk",
  },
  {
    title: "Hunting games (jeux de chasse)",
    slug: "jeux-de-chasse-chien-bordeaux",
    tag: "Hunting games",
    description:
      "Des jeux qui répondent aux instincts naturels du chien de façon canalisée et sécurisée, pour un chien épanoui et équilibré.",
    icon: "hunting",
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
    title: "Tracking (pistage)",
    slug: "tracking-chien-bordeaux",
    tag: "Tracking",
    description:
      "Le pistage sportif : suivre une trace au sol, marquer les objets, développer la concentration et l'autonomie de votre chien.",
    icon: "tracking",
    h1: "Tracking à Bordeaux : le pistage sportif, pas après pas",
    metaTitle: "Tracking et pistage canin à Bordeaux",
    metaDescription:
      "Le pistage sportif à Bordeaux et rive droite : votre chien suit une trace au sol, foulée après foulée, et apprend la concentration. Tous âges, toutes races.",
    intro: [
      "En tracking, votre chien suit une trace au sol. Pas une odeur qui flotte dans l'air : la perturbation laissée par les pas d'une personne — végétation écrasée, terre retournée, micro-organismes libérés. Il travaille truffe au sol, lentement, foulée après foulée, sans sauter une étape.",
      "C'est la différence avec le mantrailing, et elle est plus grande qu'il n'y paraît. En mantrailing le chien suit une personne et s'autorise à couper, contourner, remonter au vent. En tracking il suit un tracé, et l'exercice consiste précisément à ne pas couper. Là où le mantrailing récompense l'initiative, le pistage récompense la méthode.",
      "Sur le parcours, des objets sont déposés — un bout de cuir, un morceau de bois, un textile. Le chien doit les signaler au passage sans quitter la trace. C'est ce qui transforme une promenade olfactive en discipline : il faut tenir la ligne et rester attentif en même temps.",
    ],
    forWhom: [
      {
        title: "Le chien qui s'excite trop vite",
        text: "Le pistage impose un rythme lent et une concentration continue. Pour un chien qui passe de zéro à cent en une seconde, c'est un apprentissage de la régulation bien plus efficace qu'un exercice de calme imposé.",
      },
      {
        title: "Le chien sportif qui cherche une discipline",
        text: "Le pistage est une épreuve à part entière dans plusieurs disciplines canines officielles. Pour un binôme qui veut progresser sur des critères mesurables, il y a de quoi travailler pendant des années.",
      },
      {
        title: "Le maître qui aime la précision",
        text: "Ici on mesure : longueur du tracé, nombre d'angles, âge de la piste, objets signalés. Chaque séance se lit et se compare à la précédente. Ceux que le flou du travail comportemental frustre s'y retrouvent.",
      },
      {
        title: "Le binôme qui a besoin de se retrouver",
        text: "Le chien travaille seul devant, vous suivez derrière sans intervenir. Cette configuration répétée change souvent la relation plus vite que des exercices d'obéissance.",
      },
    ],
    sessionFlow: [
      {
        title: "Les premières traces",
        text: "Courtes, rectilignes, fraîches, sur herbe. On dépose de la nourriture dans chaque empreinte : le chien n'a rien à comprendre, il apprend seulement que suivre les pas vaut le coup.",
      },
      {
        title: "L'espacement",
        text: "On raréfie progressivement ce qui est déposé, jusqu'à ce que le chien suive la trace elle-même et non la récompense. C'est l'étape la plus délicate, et celle qu'on rate en allant trop vite.",
      },
      {
        title: "Les angles et les objets",
        text: "Les virages obligent le chien à chercher au lieu de courir tout droit. Les objets lui apprennent à signaler sans perdre la trace. On introduit l'un puis l'autre, jamais les deux le même jour.",
      },
      {
        title: "L'âge et le terrain",
        text: "On laisse vieillir la piste — trente minutes, une heure, plus — et on change de surface : herbe haute, labour, sous-bois, gravier. Chaque terrain est un nouvel apprentissage.",
      },
    ],
    benefits: [
      "Une dépense mentale intense pour une dépense physique modérée",
      "Un apprentissage concret de la concentration dans la durée",
      "Des progrès mesurables d'une séance à l'autre",
      "Un travail individuel, sans contact avec d'autres chiens",
      "Une passerelle vers les épreuves de pistage en compétition",
    ],
    faq: [
      {
        q: "Quelle différence entre le tracking et le mantrailing ?",
        a: "Le tracking suit un tracé au sol, foulée après foulée, et le chien ne doit pas couper. Le mantrailing suit l'odeur d'une personne précise telle qu'elle se disperse dans l'environnement, et le chien coupe, contourne, s'adapte au vent. L'un travaille la rigueur, l'autre l'initiative.",
      },
      {
        q: "Faut-il un terrain particulier pour commencer ?",
        a: "Un pré ou une prairie suffit pour les premières traces. La rive droite et les environs de Bordeaux offrent ce qu'il faut. Les terrains plus difficiles — labour, sous-bois, surfaces dures — arrivent quand le chien est prêt, pas avant.",
      },
      {
        q: "Mon chien renifle partout en balade, est-ce qu'il sera doué ?",
        a: "Renifler et pister sont deux choses différentes. En balade, le chien butine ce qui l'intéresse ; en pistage, il suit une trace donnée sans se laisser distraire par les autres odeurs. Un chien très olfactif part avec un avantage de motivation, pas de méthode.",
      },
      {
        q: "À quelle fréquence faut-il s'entraîner ?",
        a: "Deux à trois traces par semaine valent mieux qu'une longue séance mensuelle. Les pistes sont courtes et rapides à poser : une fois la technique acquise, vous travaillez seul entre deux séances, ce qui est d'ailleurs l'objectif.",
      },
      {
        q: "Peut-on concourir en pistage ?",
        a: "Oui. Le pistage figure au programme de plusieurs disciplines canines officielles, avec des niveaux progressifs. Rien n'oblige à y aller : beaucoup de binômes pratiquent pour le plaisir du travail et n'entrent jamais sur un terrain de concours.",
      },
    ],
    related: [
      "mantrailing-bordeaux",
      "nosework-bordeaux",
      "jeux-de-chasse-chien-bordeaux",
    ],
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

/** Menu du header : identique à `nav`, sans FAQ ni Contact (gardés dans le footer). */
export const headerNav = nav.filter(
  (item) => item.href !== "/faq" && item.href !== "/contact"
);

/** Menu du footer : `nav` complet + Zone d'intervention (pas dans le header). */
export const footerNav = [...nav, { label: "Zone d'intervention", href: "/zone-intervention" }];

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
      "Éducatrice canine à Cestas spécialisée en agility, hoopers et soins coopératifs. Séances individuelles ou collectives pour tous niveaux, dans une approche bienveillante.",
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
