import { site } from "@/lib/site";
import type { LegalSection } from "@/components/Legal";

export const CGV_VERSION = "2026-10";
export const CGV_PATH = "/cgv";
export const CGV_URL = `${site.url}${CGV_PATH}`;

const { legal, address } = site;
const seat = `${address.street}, ${address.postalCode} ${address.locality}`;

/**
 * Conditions générales de vente (consommateurs), reprises du document « CGV Apolo – Dog Training »
 * puis adaptées au portail (exécution par un partenaire, signature en ligne, remboursements).
 * Aucun tarif n'y figure : les prix sont communiqués sur la fiche tarifs / le devis.
 * ⚠️ À faire relire par un juriste avant usage réel.
 */
export const cgvSections: LegalSection[] = [
  {
    heading: "Préambule",
    body: [
      `Les présentes Conditions générales de vente (« CGV ») s'appliquent aux services décrits à l'article 2, proposés par ${legal.publisherLegalName}, entrepreneur individuel exerçant sous le nom commercial ${site.name} (« le Prestataire »), dont le siège est situé ${seat}, SIRET ${site.siret}.`,
      `Contact : ${site.email} — ${site.phone}.`,
    ],
  },
  {
    heading: "Article 1 — Champ d'application",
    body: [
      "Les CGV s'appliquent, sans restriction ni réserve, à tout achat de séances d'éducation canine par des consommateurs et clients non professionnels (« le Client »). Elles précisent les conditions de réservation, de paiement et d'exécution des services.",
      "Elles sont communiquées au Client avant la conclusion du contrat et prévalent sur tout autre document contradictoire. La version applicable est celle en vigueur à la date de conclusion du contrat. La validation de la réservation, puis la signature du contrat, valent acceptation des CGV.",
    ],
  },
  {
    heading: "Article 2 — Services",
    body: [
      "Les services sont : l'étude de comportement, les séances théoriques et les séances d'éducation canine individuelles ou collectives. Leurs caractéristiques principales sont présentées sur le site du Prestataire.",
      "Toute séance d'éducation est précédée d'une étude de comportement. La formule comprend une partie théorique et une partie pratique, toutes deux nécessaires pour améliorer les difficultés du chien. Les méthodes sont personnalisées et ne sont pas transposables à d'autres chiens : chaque chien fait l'objet d'une étude de comportement individuelle.",
    ],
  },
  {
    heading: "Article 3 — Réservation et formation du contrat",
    body: [
      "Le Client contacte le Prestataire par téléphone, courrier électronique, réseaux sociaux ou messagerie. Toute prestation donne lieu à un contrat préalable ; la réservation n'est définitive qu'après signature du contrat et acceptation des présentes CGV.",
      "Avant la première séance, le Client a signé le contrat et accepté les CGV et, le cas échéant, réglé le paiement ou l'acompte prévu à l'article 6.",
    ],
  },
  {
    heading: "Article 4 — Exécution, lieu et délai d'utilisation",
    body: [
      "Les séances sont à utiliser dans un délai de 6 mois à compter de la signature du contrat, précisé au besoin dans le contrat. Ce délai est prolongé de la durée de toute suspension ou de tout report qui ne résulte pas du fait du Client. Les séances non utilisées à l'issue du délai ne sont plus valables, sauf accord écrit du Prestataire.",
      "L'étude de comportement se déroule au domicile du Client ou en visioconférence. Les séances suivantes ont lieu sur la commune de Bassens (33530) ou dans les lieux choisis par le Prestataire dans l'intérêt de l'éducation du chien.",
      "Le Prestataire peut confier tout ou partie des séances à un éducateur canin partenaire qualifié, qui intervient sous sa coordination ; le Client en est informé avant la première séance. Le Prestataire reste son interlocuteur et son cocontractant pour toute question, facturation ou réclamation.",
      "Le Prestataire met en œuvre ses meilleurs efforts : il est tenu à une obligation de moyens et non de résultat.",
    ],
  },
  {
    heading: "Article 5 — Tarifs",
    body: [
      "Les prix sont indiqués en euros. TVA non applicable, article 293 B du CGI.",
      "Le prix de chaque formule est communiqué au Client sur une fiche tarifs ou un devis avant la conclusion du contrat, et le tarif applicable est celui en vigueur au moment de la réservation. Le Prestataire peut modifier ses tarifs pour l'avenir, sans effet sur les prestations déjà réservées.",
      "Un photographe professionnel peut être proposé sur demande, sur devis. Une facture est remise au Client pour les services fournis.",
    ],
  },
  {
    heading: "Article 6 — Conditions de paiement",
    body: [
      "Le paiement s'effectue par virement, carte bancaire, chèque ou espèces, au choix du Client.",
      "Le paiement en plusieurs fois se fait par chèques, étalés sur 3 mois au maximum, le premier règlement pouvant se faire par virement le jour de la signature. Chaque chèque est encaissé avant le 15 du mois ou à la date convenue ensemble. Les chèques au nom d'un tiers ne sont pas acceptés.",
      "Si le paiement n'est pas réglé à la signature, un chèque d'acompte (étude de comportement et séance théorique) peut être demandé ; son montant est indiqué sur la fiche tarifs ou le devis.",
      "En cas de retard de paiement, la totalité des sommes dues devient immédiatement exigible, sans préjudice des autres recours du Prestataire.",
    ],
  },
  {
    heading: "Article 7 — Annulation, report et absence",
    body: [
      "Le Prestataire prépare chaque séance en amont pour l'adapter au chien. En conséquence, toute annulation ou absence du Client à moins de 48 heures de la séance entraîne le décompte de cette séance de la formule souscrite.",
      "Le Client prévenu à plus de 48 heures peut reporter la séance sans frais, dans le délai d'utilisation prévu à l'article 4. Tout retard du Client est décompté de la durée de la séance, afin de ne pas pénaliser les autres clients ; en cas de retard du Prestataire, la séance est assurée en totalité ou le temps est reporté sur une séance suivante.",
      "Les séances sont maintenues en cas d'intempéries, mais le Prestataire peut les reporter en cas de conditions dangereuses (orage, canicule…) ou de maladie. La séance est alors reportée sans frais, ou remboursée si le Client ne souhaite pas de report.",
      "Le Client s'engage à un travail personnel entre les séances. Si le Prestataire constate à l'occasion d'une séance que les exercices transmis n'ont pas été travaillés, il peut l'interrompre : la séance est alors décomptée et une nouvelle date est fixée.",
      "Si le Client met fin au contrat après la fin du délai de rétractation (déménagement, abandon, etc.), il reste redevable des séances réalisées et des séances décomptées en application du présent article. Les sommes versées pour des séances non réalisées et encore valables lui sont remboursées dans un délai de 14 jours, sous déduction éventuelle de l'acompte lorsqu'il correspond à une prestation déjà fournie (étude de comportement, séance théorique).",
    ],
  },
  {
    heading: "Article 8 — Obligations du Prestataire",
    body: [
      "Le Prestataire réalise sa mission dans le respect de la réglementation en vigueur, avec les outils adéquats, et informe le Client des méthodes appliquées à son chien.",
    ],
  },
  {
    heading: "Article 9 — Obligations du Client",
    body: [
      "Le Client est responsable de la tenue et du comportement de son chien pendant les séances. Il informe le Prestataire, avant la séance, de tout problème de santé du chien (la séance est adaptée ou reportée si besoin) et de tout antécédent de morsure.",
      "Il prend lui-même rendez-vous et assure le suivi régulier des séances ; un minimum de 3 séances par mois est recommandé pour suivre l'évolution du chien. Il collabore en transmettant en temps utile les informations nécessaires et s'abstient de tout acte préjudiciable au bon déroulement du service.",
      "Il ramasse les déjections de son chien et apporte le matériel nécessaire (laisse, longe, harnais ou collier, friandises, eau, jouets, tenue adaptée à la météo, et tout matériel recommandé par le Prestataire).",
      "Le matériel prêté par le Prestataire et détérioré du fait du Client ou de son chien est remplacé à l'identique ou remboursé à sa valeur d'achat.",
      "Le Client ne diffuse pas les méthodes de travail ni les documents remis lors des cours, et ne prend ni photo ni vidéo pendant les séances.",
    ],
  },
  {
    heading: "Article 10 — Responsabilité et assurance",
    body: [
      "Chaque partie répond de la bonne exécution de ses obligations. Le Prestataire n'est responsable que des dommages directs résultant de sa faute ou de sa négligence, hors force majeure ou utilisation du service non conforme à ses préconisations. Rien dans les présentes ne limite la responsabilité du Prestataire pour dommage corporel ni pour faute lourde ou dolosive.",
      "Malgré les précautions prises, le chien peut se blesser lors d'un exercice inhérent à l'éducation, ou lors d'un heurt entre chiens. Hors faute du Prestataire, celui-ci n'est pas responsable de ces accidents (par exemple : frais vétérinaires) ; la responsabilité civile du propriétaire couvre les dommages causés par son animal.",
      "Chaque partie prévient l'autre sans délai de tout retard ou manquement dans l'exécution du contrat. Le Prestataire déclare avoir souscrit une assurance responsabilité civile professionnelle auprès d'ALLIANZ.",
    ],
  },
  {
    heading: "Article 11 — Force majeure",
    body: [
      "Aucune partie n'est responsable d'un manquement dû à un cas de force majeure (événement imprévisible, irrésistible et extérieur aux parties : tempête, inondation, incendie, blocage des transports, panne des réseaux de télécommunication…). La partie qui l'invoque en informe l'autre immédiatement ; les parties conviennent ensemble des conditions de poursuite du contrat.",
      "Si l'événement dure plus de trois mois, la partie lésée peut résilier le contrat. Les sommes versées pour des séances non réalisées sont alors remboursées, ou les séances sont reportées à une date ultérieure.",
    ],
  },
  {
    heading: "Article 12 — Droit de rétractation",
    body: [
      "Pour tout contrat conclu à distance ou hors établissement, le Client dispose d'un délai de 14 jours à compter de la conclusion du contrat pour se rétracter, sans avoir à se justifier (article L221-18 du code de la consommation).",
      `Il notifie sa décision par courriel à ${site.email} ou par courrier à ${seat}, au moyen du formulaire en annexe ou de toute déclaration dénuée d'ambiguïté.`,
      "Si le Client a expressément demandé que la prestation commence avant la fin du délai, il règle le montant correspondant à ce qui a été fourni jusqu'à la communication de sa décision (article L221-25). Il ne peut plus se rétracter d'une prestation pleinement exécutée avant la fin du délai, avec son accord préalable exprès et renoncement à son droit de rétractation (article L221-28).",
      "Le Prestataire rembourse les sommes versées au plus tard 14 jours après avoir été informé de la décision du Client, par le même moyen de paiement.",
    ],
  },
  {
    heading: "Article 13 — Propriété intellectuelle",
    body: [
      "Les documents techniques, dessins, vidéos et photographies remis au Client restent la propriété exclusive du Prestataire. Le Client s'interdit tout usage susceptible de porter atteinte à ses droits et toute divulgation à des tiers.",
    ],
  },
  {
    heading: "Article 14 — Droit à l'image",
    body: [
      "Les photographies et vidéos réalisées pendant les séances peuvent être utilisées par le Prestataire sur tous supports (site internet, réseaux sociaux, plaquettes, articles de presse) pour promouvoir son activité, dans le respect des droits des personnes. Le Client accepte que son image et celle de son chien y figurent.",
      "Le Client peut s'y opposer à tout moment, par simple demande écrite à l'adresse ci-dessus. Le Prestataire s'interdit toute exploitation portant atteinte à la vie privée, à l'image ou à la réputation du Client.",
    ],
  },
  {
    heading: "Article 15 — Garanties légales",
    body: [
      "Le Prestataire fournit un service conforme au contrat et répond des défauts de conformité existant lors de la fourniture, conformément aux dispositions du code de la consommation. En cas de défaut de conformité, le Client peut demander la mise en conformité du service ou, à défaut, une réduction du prix ou la résolution du contrat, dans les conditions légales.",
      "Le Client signale tout défaut de conformité par écrit au Prestataire dans un délai raisonnable ; la mise en conformité intervient dans un délai maximum de trente jours.",
      "Le Prestataire reste également tenu de la garantie des vices cachés (articles 1641 et suivants du code civil). Ces garanties s'appliquent sans coût supplémentaire pour le Client.",
    ],
  },
  {
    heading: "Article 16 — Données personnelles",
    body: [
      `Les informations recueillies servent à la gestion de la clientèle, au suivi des réservations, à l'étude de comportement, à la facturation et à la bonne exécution de la prestation. Elles sont transmises au seul partenaire en charge de la prestation et aux prestataires techniques strictement nécessaires (hébergement, messagerie, agenda). Elles ne sont ni vendues ni cédées.`,
      `Le Client dispose d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité, qu'il exerce en écrivant à ${site.email}. Voir la politique de confidentialité du site.`,
    ],
    link: { href: "/confidentialite", label: "Politique de confidentialité" },
  },
  {
    heading: "Article 17 — Droit applicable, médiation et litiges",
    body: [
      "Les CGV sont soumises au droit français et rédigées en langue française ; seul le texte français fait foi.",
      "En cas de litige, le Client contacte d'abord le Prestataire pour rechercher une solution amiable. Il peut ensuite recourir gratuitement à un médiateur de la consommation :",
      `${legal.mediatorName}, ${legal.mediatorAddress} — ${legal.mediatorUrl}`,
      "À défaut d'accord amiable, les tribunaux compétents sont saisis dans les conditions du droit commun ; le consommateur peut saisir, à son choix, la juridiction du lieu où il demeurait lors de la conclusion du contrat ou de la survenance du fait dommageable (article R631-3 du code de la consommation). La plateforme européenne de règlement en ligne des litiges est accessible sur ec.europa.eu/consumers/odr.",
    ],
  },
  {
    heading: "Annexe — Modèle de formulaire de rétractation",
    body: [
      "À compléter et renvoyer uniquement si vous souhaitez vous rétracter du contrat.",
      `À l'attention de ${legal.publisherLegalName}, ${site.name}, ${seat} — ${site.email}.`,
      "Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de services ci-dessous.",
      "Commandé le : … — Nom du client : … — Adresse du client : … — Date : … — Signature (uniquement en cas de notification sur papier) : …",
    ],
  },
];
