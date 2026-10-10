/**
 * « Étude de comportement » (fiche par chien) : reproduction du document PDF
 * Apolo Dog Training. Le formulaire est décrit ici une seule fois ; l'écran
 * (FicheEditor) et la validation côté serveur lisent la même définition.
 *
 * Réponses stockées dans un objet plat { clé: valeur } :
 *  - text / longtext / date / number : chaîne
 *  - yesno : "oui" | "non" | ""  (le détail éventuel est sous `${clé}__detail`)
 *  - choice : une option
 *  - multi : tableau d'options (détail éventuel sous `${clé}__detail`)
 */

export type FieldDef =
  | { key: string; label: string; type: "text" | "longtext" | "date" | "number"; hint?: string; suffix?: string }
  | { key: string; label: string; type: "yesno"; detail?: string }
  | { key: string; label: string; type: "choice"; options: string[]; detail?: string }
  | { key: string; label: string; type: "multi"; options: string[]; detail?: string };

export type Block = { title?: string; hint?: string; columns?: 1 | 2; fields: FieldDef[] };
export type FicheSection = { id: string; title: string; blocks: Block[] };

export type FicheAnswers = Record<string, string | string[]>;
export type FicheStatus = "draft" | "completed";

const text = (key: string, label: string, hint?: string): FieldDef => ({ key, label, type: "text", hint });
const long = (key: string, label: string, hint?: string): FieldDef => ({ key, label, type: "longtext", hint });
const yn = (key: string, label: string, detail?: string): FieldDef => ({ key, label, type: "yesno", detail });
const choice = (key: string, label: string, options: string[], detail?: string): FieldDef => ({ key, label, type: "choice", options, detail });
const multi = (key: string, label: string, options: string[], detail?: string): FieldDef => ({ key, label, type: "multi", options, detail });

/** Comportements : OUI / NON + précisions (quand, qui, quoi, où, comment, pourquoi). */
const BEHAVIOURS: [string, string][] = [
  ["vols", "Vols"],
  ["fugues", "Fugues"],
  ["hyperactif", "Hyperactif"],
  ["detruit", "Détruit"],
  ["mordille", "Mordille"],
  ["saute", "Saute"],
  ["predation", "Prédation"],
  ["aboie", "Aboie"],
  ["pleurs", "Pleurs"],
  ["propre", "Propre"],
  ["coprophage", "Coprophage"],
  ["pica", "PICA"],
  ["cailloux", "Mange des cailloux"],
  ["potomanie", "Potomanie"],
  ["lecheSol", "Lèche le sol"],
  ["tourne", "Tourne sur lui-même"],
  ["chasseOmbre", "Chasse lumière / ombre"],
  ["creuse", "Creuse / enterre"],
  ["malade", "Malade en voiture"],
  ["dysocialisation", "Dysocialisation primaire"],
  ["privation", "Syndrome de privation sensorielle (du chenil)"],
  ["detachement", "Dépression de détachement précoce"],
  ["deprime", "Déprime"],
  ["mutilation", "Mutilation"],
  ["lechages", "Léchages compulsifs"],
  ["peurs", "Craintes / peurs / phobies"],
  ["ressource", "Protection de ressource (jouet, os, gamelle, canapé…)"],
  ["suit", "Suit partout (hors sortie / repas)"],
  ["separation", "Anxiété de séparation"],
  ["hyperAttachement", "Hyper attachement"],
  ["sexuel", "Simule un acte sexuel"],
  ["interpose", "S'interpose lors des câlins"],
];

const EDUCATION: [string, string][] = [
  ["tire", "Tire en laisse"],
  ["auPied", "Marche au pied"],
  ["stop", "Stop"],
  ["rappel", "Rappel"],
  ["tuLaisses", "Tu laisses"],
  ["pasBouger", "Pas bouger"],
  ["assis", "Assis"],
  ["couche", "Couché"],
  ["direction", "Ordre direction"],
];

export const SEANCES = 10;

export const FICHE_SECTIONS: FicheSection[] = [
  {
    id: "proprietaire",
    title: "Étude de comportement",
    blocks: [
      {
        title: "Propriétaire",
        hint: "Nom, téléphone, e-mail et adresse viennent de la fiche client.",
        columns: 2,
        fields: [
          { key: "date", label: "Date du jour", type: "date" },
          text("profession", "Profession(s)"),
          text("connuPar", "Connu par"),
          long("raisons", "Pour quelle(s) raison(s) me contactez-vous ?"),
        ],
      },
    ],
  },
  {
    id: "chien",
    title: "Le chien",
    blocks: [
      {
        hint: "Nom, race, sexe, âge et puce viennent de la fiche du chien.",
        columns: 2,
        fields: [
          text("ageAdoption", "Âge d'adoption"),
          yn("sterilise", "Castré / stérilisée"),
          yn("saillies", "Saillie(s)"),
          yn("portees", "Portée(s)"),
          text("porteesNombre", "Combien ?"),
          choice("lignee", "Lignée", ["Travail", "Beauté"]),
          yn("lof", "LOF"),
        ],
      },
      {
        columns: 1,
        fields: [choice("lieuAdoption", "Lieu d'adoption", ["Élevage", "Particuliers", "Refuges", "Autre"], "Autre (précisez)")],
      },
      {
        columns: 1,
        fields: [
          choice("temperament", "Tempérament", ["Craintif", "Réservé", "Sociable", "Sûr de lui"]),
          choice("energie", "Niveau d'énergie", ["Bas", "Moyen", "Haut", "Très haut"]),
        ],
      },
      {
        title: "Foyer et mode de vie",
        columns: 2,
        fields: [
          yn("premierChien", "Est-ce votre premier chien ?"),
          yn("premierMaitre", "Êtes-vous son premier maître ?"),
          multi("situationFamiliale", "Situation familiale", ["Seul", "Couple", "Enfants"]),
          choice("lieuDeVie", "Lieu de vie", ["Maison", "Appartement"]),
          yn("jardin", "Accès jardin (clôturé)"),
          yn("balcon", "Accès balcon"),
          yn("attache", "Attaché"),
          yn("autresAnimaux", "Autres animaux dans le domicile"),
          multi("autresAnimauxQuels", "Lesquels ?", ["Chien", "Chat", "NAC"]),
          yn("copains", "A-t-il des copains chiens ?"),
          text("copainsCombien", "Combien ?"),
          text("copainsFrequence", "À quelle fréquence les voit-il ?"),
          text("solitude", "Temps de solitude quotidien ?"),
          yn("calin", "Est-il câliné ?"),
          { key: "initiative", label: "Initiative du chien (le reste revient à la famille)", type: "number", suffix: "%" },
        ],
      },
      {
        title: "Éducation déjà suivie",
        columns: 2,
        fields: [
          yn("autreEducateur", "Autre éducateur canin", "Nom de l'éducateur"),
          text("nbSeancesPasse", "Nombre de séances"),
          choice("methode", "Quelle méthode ?", ["Classique", "100 % positive", "Naturelle"]),
        ],
      },
    ],
  },
  {
    id: "sante",
    title: "Santé",
    blocks: [
      {
        columns: 1,
        fields: [
          yn("sensibilite", "Sensibilité à la manipulation / au toucher", "Si oui, où ?"),
          yn("osteo", "Consultation ostéopathe", "Fréquence"),
          yn("medicaments", "Traitement médicamenteux", "Pourquoi ?"),
          multi(
            "problemesSante",
            "Problèmes de santé",
            ["Douleurs", "Articulaires", "Musculaires", "Digestifs", "Allergies", "Thyroïde", "Vision", "Audition", "Neuro", "Autres"],
            "Précisions",
          ),
          yn("traumatismes", "Traumatismes / mauvaises expériences passées / bêtises", "Précisions"),
        ],
      },
    ],
  },
  {
    id: "problemes",
    title: "Problèmes",
    blocks: [
      { title: "Éducation", columns: 2, fields: EDUCATION.map(([k, l]) => yn(`edu_${k}`, l)) },
      {
        title: "Comportement",
        hint: "Quand ? Qui ? Quoi ? Où ? Comment ? Pourquoi ? — à préciser dès qu'une réponse est « Oui ».",
        columns: 2,
        fields: BEHAVIOURS.map(([k, l]) => yn(`comp_${k}`, l, "Précisions (quand, qui, quoi, où, comment, pourquoi)")),
      },
      {
        title: "Agressivité",
        columns: 1,
        fields: [
          yn("agressif", "Agressif"),
          multi("agressifContre", "Contre qui / quoi ?", ["Congénères", "Humains", "En voiture", "Autres"], "Précisions"),
          yn("grognements", "Grognements", "Circonstances"),
          yn("morsure", "Tentative de morsure", "Circonstances"),
        ],
      },
      {
        title: "Sanctions, récompenses et interdits",
        columns: 1,
        fields: [
          long("sanction", "Comment sanctionnez-vous un mauvais comportement ?"),
          text("sanctionPar", "Par qui ?"),
          text("sanctionQuand", "Quand ?"),
          long("recompense", "Comment récompensez-vous un bon comportement ?"),
          text("recompensePar", "Par qui ?"),
          long("interdits", "A-t-il des interdits ?"),
        ],
      },
    ],
  },
  {
    id: "repas",
    title: "Repas",
    blocks: [
      {
        columns: 2,
        fields: [
          yn("gourmand", "Gourmand"),
          yn("glouton", "Glouton"),
          text("nbRepas", "Nombre de repas par jour"),
          choice("repasSortie", "Avant ou après la sortie ?", ["Avant", "Après"]),
          text("lieuRepas", "Lieu du repas"),
          text("quiDonne", "Qui donne ses repas ?"),
          text("ouPendantRepas", "Où est-il pendant vos repas ?"),
          yn("mendie", "Mendie-t-il ?"),
          yn("restesTable", "Restes de table"),
        ],
      },
      { columns: 1, fields: [multi("alimentation", "Que mange-t-il ?", ["Croquette", "Ration ménagère", "Barf", "Autre"], "Précisions (marques, quantités…)")] },
    ],
  },
  {
    id: "espaces",
    title: "Gestion des espaces",
    blocks: [
      {
        columns: 2,
        fields: [
          multi("couchage", "Où dort-il ?", ["Box", "Chenil", "Cage", "Pièce (isolé)", "Point en hauteur"], "Précisions"),
          yn("accesMaison", "Accès à toute la maison"),
          yn("canape", "Monte sur le canapé / fauteuils / chaises"),
          yn("surInvitation", "Sur invitation"),
          yn("accesChambre", "Accès chambre"),
          yn("lit", "Lit"),
          yn("devantPortes", "Dort-il devant les portes ?"),
          yn("posteDevantPassages", "Se poste-t-il devant les passages, entrées et sorties ?"),
        ],
      },
    ],
  },
  {
    id: "depense",
    title: "Dépense mentale et physique",
    blocks: [
      {
        columns: 2,
        fields: [
          text("quiSort", "Qui sort le chien ?"),
          text("sortiesParJour", "Combien de fois par jour ?"),
          text("tempsSortie", "Combien de temps ?"),
          multi("besoins", "Où fait-il ses besoins ?", ["Jardin", "Balade"]),
          choice("besoinsPresence", "En présence ou en absence du maître", ["En présence", "En absence"]),
          multi("tenue", "Laisse", ["Laisse", "Longe", "Enrouleur", "Liberté"]),
          multi("equipement", "Équipement", ["Harnais", "Collier plat", "Étrangleur", "Torquatus", "Électrique", "Lasso"]),
        ],
      },
      {
        title: "Jeux d'interactions",
        columns: 1,
        fields: [
          yn("joueur", "Joueur", "Quels jouets / jeux à la maison ?"),
          yn("jeuxRarefies", "Jeux raréfiés", "Jeux d'interaction à la maison"),
          yn("jeuxBalades", "Jeux pendant les balades", "Lesquels ?"),
          text("jeuxTemps", "Temps par jour"),
          long("depensePhysique", "Dépense physique quotidienne"),
          yn("sportCanin", "Activité ou sport canin", "Lequel ?"),
          yn("depenseMentale", "Dépense mentale ou jeux d'occupation (Kong, tapis…)", "Lesquels ?"),
          yn("mastication", "Mastication", "Quoi ?"),
        ],
      },
    ],
  },
  {
    id: "observations",
    title: "Observations et solutions",
    blocks: [
      {
        columns: 1,
        fields: [
          long("observations", "Observations"),
          multi("solutions", "Solutions", ["Éducation", "Règles de vie", "Thérapie comportementale", "Dépense physique et mentale"]),
          { key: "seancesPreconisees", label: "Nombre de séances préconisées", type: "number" },
        ],
      },
      {
        title: "Programme des séances",
        columns: 1,
        fields: Array.from({ length: SEANCES }, (_, i) => long(`seance_${i + 1}`, `Séance n°${i + 1}`)),
      },
    ],
  },
];

/** Toutes les définitions de champs, à plat. */
export const FICHE_FIELDS: FieldDef[] = FICHE_SECTIONS.flatMap((s) => s.blocks.flatMap((b) => b.fields));

const MAX_SHORT = 300;
const MAX_LONG = 4000;

/**
 * Nettoie des réponses reçues d'un client : clés inconnues ignorées, valeurs
 * ramenées au type attendu et à une longueur raisonnable.
 */
export function sanitizeAnswers(input: unknown): FicheAnswers {
  const src = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const out: FicheAnswers = {};
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r/g, "").slice(0, max) : "");

  for (const f of FICHE_FIELDS) {
    const v = src[f.key];
    switch (f.type) {
      case "text":
        if (str(v, MAX_SHORT)) out[f.key] = str(v, MAX_SHORT).replace(/\n+/g, " ");
        break;
      case "longtext":
        if (str(v, MAX_LONG)) out[f.key] = str(v, MAX_LONG);
        break;
      case "date":
        if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) out[f.key] = v;
        break;
      case "number": {
        const s = str(v, 12).replace(",", ".");
        if (s && Number.isFinite(Number(s)) && Number(s) >= 0 && Number(s) <= 100000) out[f.key] = s;
        break;
      }
      case "yesno":
        if (v === "oui" || v === "non") out[f.key] = v;
        break;
      case "choice":
        if (typeof v === "string" && f.options.includes(v)) out[f.key] = v;
        break;
      case "multi": {
        const arr = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && f.options.includes(x)) : [];
        if (arr.length) out[f.key] = [...new Set(arr)];
        break;
      }
    }
    if ("detail" in f && f.detail) {
      const d = str(src[`${f.key}__detail`], MAX_LONG);
      if (d) out[`${f.key}__detail`] = d;
    }
  }
  if (typeof out.initiative === "string" && Number(out.initiative) > 100) delete out.initiative;
  return out;
}

/** Nombre de champs renseignés (hors détails) — indicateur de progression. */
export function answeredCount(a: FicheAnswers) {
  return FICHE_FIELDS.filter((f) => {
    const v = a[f.key];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;
}
