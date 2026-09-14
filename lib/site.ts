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
  google: {
    // Lien vers la fiche Google (bouton « voir tous les avis »)
    url: "https://www.google.com/search?q=Apolo+Dog+Training+Bordeaux",
    rating: 5,
    count: 30,
  },
} as const;

export const serviceAreas: string[] = [
  "Bordeaux",
  "Bassens",
  "Cenon",
  "Lormont",
  "Floirac",
  "Bouliac",
  "Carbon-Blanc",
  "Bruges",
  "Mérignac",
  "Talence",
  "Pessac",
  "Bègles",
  "Le Bouscat",
  "Eysines",
  "Saint-Loubès",
];

export type Service = {
  title: string;
  slug: string;
  tag?: string;
  description: string;
  icon:
    | "obedience"
    | "behaviour"
    | "walk"
    | "mantrailing"
    | "tracking"
    | "nosework"
    | "hunting";
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
