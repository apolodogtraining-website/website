/**
 * Accessoires recommandés (page /accessoires) : données éditoriales, avec liens partenaires Amazon.
 * Les textes sont ceux validés par Frédéric : ne pas les reformuler sans son accord.
 */

export type AccessoryIcon = "leash" | "tug" | "ball" | "calm" | "care" | "book";

export type Accessory = {
  name: string;
  /** Étiquette courte affichée en pastille. */
  tag: string;
  /** Pourquoi je le recommande. */
  why: string;
  /** Lien partenaire Amazon. */
  url: string;
};

export type AccessoryCategory = {
  /** Ancre de la section (`#id`). */
  id: string;
  title: string;
  intro: string;
  icon: AccessoryIcon;
  items: Accessory[];
};

export const amazonDisclosure =
  "En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.";

export const accessoryCategories: AccessoryCategory[] = [
  {
    id: "balade",
    title: "En balade et en séance",
    intro: "Le matériel qui donne de la liberté au chien sans vous la faire perdre.",
    icon: "leash",
    items: [
      {
        name: "Longe Biothane 10 m",
        tag: "Flair · rappel",
        url: "https://link.amazon/B0bGZ4JZu",
        why: "Ma longe de travail en mantrailing et en pistage. Le biothane ne prend pas l'eau, ne garde pas les odeurs et se nettoie d'un coup d'éponge. Dix mètres, c'est la bonne longueur pour laisser chercher sans perdre le contact.",
      },
      {
        name: "Laisse enrouleur Flexi 10 m",
        tag: "Grands espaces",
        url: "https://link.amazon/B0c8aDcyG",
        why: "Pour les balades en zone dégagée : le chien explore à son rythme, vous gardez la main. À réserver aux grands espaces, jamais en ville ni au bord d'une route.",
      },
      {
        name: "Gamelle en silicone",
        tag: "À emporter",
        url: "https://link.amazon/B0j1FzcVx",
        why: "Légère et souple, elle se glisse dans une poche ou un sac de friandises. De quoi faire boire votre chien pendant chaque séance et chaque balade.",
      },
      {
        name: "Bottines de protection",
        tag: "Coussinets",
        url: "https://link.amazon/B07p8uEJ8",
        why: "Pour les coussinets sensibles ou abîmés, et les sols agressifs : bitume brûlant, gravier, sel de déneigement. Prévoyez quelques séances d'habituation en douceur avant la première vraie sortie.",
      },
    ],
  },
  {
    id: "jeu",
    title: "Jouer ensemble",
    intro: "Le jeu de traction, bien cadré, est l'un des meilleurs outils de relation et de récompense.",
    icon: "tug",
    items: [
      {
        name: "Tug pour chiot",
        tag: "Chiot",
        url: "https://link.amazon/B05uea8Sl",
        why: "Souple et de petite taille, adapté aux mâchoires en pleine croissance. Idéal pour apprendre au chiot à jouer avec vous… plutôt qu'avec vos mains.",
      },
      {
        name: "Tug en polaire",
        tag: "Chien peu joueur",
        url: "https://link.amazon/B06nhLbfM",
        why: "La polaire est douce en gueule et très attractive. C'est souvent elle qui donne envie de jouer aux chiens qui ne s'y intéressaient pas.",
      },
      {
        name: "Tug",
        tag: "Récompense",
        url: "https://link.amazon/B0024rywp",
        why: "Le tug classique pour le chien adulte. Prise, lâcher sur demande, reprise : en quelques minutes, une vraie récompense et un excellent exercice de contrôle de soi.",
      },
      {
        name: "Boudin de tug",
        tag: "Prise ferme",
        url: "https://link.amazon/B02dQ5LxA",
        why: "Plus épais et plus ferme qu'un tug classique, il offre une vraie prise en gueule. Parfait pour les chiens qui aiment tirer fort et se dépenser.",
      },
      {
        name: "Puller résistant",
        tag: "Dépense physique",
        url: "https://link.amazon/B099EByun",
        why: "Des anneaux robustes pour courir, tirer et rapporter. Un bon jouet de dépense en extérieur, à partager avec votre chien plutôt qu'à lui laisser seul.",
      },
      {
        name: "Flirt pole",
        tag: "Instinct de poursuite",
        url: "https://link.amazon/B037eSvln",
        why: "Une canne avec un leurre au bout : le chien poursuit, attrape, lâche sur demande. Elle canalise l'instinct de poursuite et travaille le contrôle de soi en même temps.",
      },
    ],
  },
  {
    id: "balles",
    title: "Balles et jouets résistants",
    intro: "Des jouets qui durent, choisis pour la sécurité des dents autant que pour le plaisir.",
    icon: "ball",
    items: [
      {
        name: "Balle Chuckit",
        tag: "Rapport",
        url: "https://link.amazon/B0e81G8Op",
        why: "Elle rebondit bien, se voit de loin et remplace avantageusement la balle de tennis, dont le feutre use les dents.",
      },
      {
        name: "Balle Lotus",
        tag: "Jeu de flair",
        url: "https://link.amazon/B06MqR1fX",
        why: "Elle s'ouvre comme une fleur pour y cacher une friandise ou un leurre odorant. Le pont idéal entre le jeu et le travail de flair.",
      },
      {
        name: "Balle ultra résistante Wildfang",
        tag: "Gros mâcheurs",
        url: "https://link.amazon/B0h857gul",
        why: "Pour les chiens qui détruisent un jouet en quelques minutes : une balle pensée pour durer face aux mâchoires les plus déterminées. Toujours sous surveillance.",
      },
      {
        name: "Œuf d'autruche Wolters",
        tag: "Occupation",
        url: "https://link.amazon/B0hsMNsid",
        why: "Trop gros pour être attrapé d'un coup de gueule : le chien doit le pousser, le rouler, chercher comment s'y prendre. Une bonne occupation pour les jeunes chiens pleins d'énergie.",
      },
    ],
  },
  {
    id: "calme",
    title: "Apaiser et occuper",
    intro: "Lécher et mâcher sont des comportements auto-apaisants : autant leur offrir un bon support.",
    icon: "calm",
    items: [
      {
        name: "Tapis de léchage",
        tag: "Retour au calme",
        url: "https://link.amazon/B0fkmSLH8",
        why: "Étalez un peu de pâtée ou de yaourt nature et proposez-le pendant un soin, un orage ou un moment de solitude. Le léchage fait redescendre la tension en quelques minutes.",
      },
    ],
  },
  {
    id: "soins",
    title: "Soins et retour de balade",
    intro: "Pour que la boue et la pluie restent dehors, et que les soins deviennent un moment agréable.",
    icon: "care",
    items: [
      {
        name: "Pulseur pour chien",
        tag: "Séchage",
        url: "https://amzn.to/48dsyP3",
        why: "Un séchage rapide et complet jusqu'au sous-poil, après le bain ou une sortie sous la pluie. Précieux pour les poils longs et denses. Présentez-le progressivement : le bruit impressionne au début.",
      },
      {
        name: "Brosse en silicone",
        tag: "Toilettage",
        url: "https://link.amazon/B0fcvou9q",
        why: "Douce sur la peau, elle retire le poil mort et la boue séchée, et se rince en un instant. Parfaite aussi pour habituer en douceur un chien sensible à la manipulation.",
      },
      {
        name: "Tapis de voyage lavable",
        tag: "Voiture",
        url: "https://link.amazon/B0bAHLLo9",
        why: "Dans le coffre ou sur la banquette, il protège la voiture au retour d'une séance boueuse et passe en machine. Il devient aussi un repère rassurant pour le chien en trajet.",
      },
      {
        name: "Sèche-chaussures et bottes",
        tag: "Pour vous",
        url: "https://link.amazon/B0cgum9n6",
        why: "Celui-là n'est pas pour le chien : des chaussures sèches le lendemain d'une séance de pistage dans l'herbe mouillée. Une fois essayé, on ne s'en passe plus.",
      },
    ],
  },
  {
    id: "lectures",
    title: "Lectures pour comprendre son chien",
    intro: "Mieux lire son chien, c'est la moitié du travail d'éducation.",
    icon: "book",
    items: [
      {
        name: "Turid Rugaas, les signaux d'apaisement",
        tag: "Communication",
        url: "https://link.amazon/B087FSd93",
        why: "La référence sur les signaux d'apaisement : bâillement, tête détournée, reniflement… Le livre que je conseille pour apprendre à lire ce que votre chien vous dit.",
      },
      {
        name: "Le langage du chien pour les enfants",
        tag: "Famille",
        url: "https://link.amazon/B09JonOEA",
        why: "Pour apprendre aux enfants à approcher un chien, à reconnaître quand il veut être tranquille et à éviter les morsures. À lire ensemble.",
      },
    ],
  },
];

/** Nombre total d'accessoires, calculé (jamais saisi à la main). */
export const accessoryCount = accessoryCategories.reduce((n, c) => n + c.items.length, 0);
