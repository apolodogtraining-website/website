import { site } from "@/lib/site";
import type { Partner } from "./types";

export const CONTRACT_VERSION = "2026-06";
export const CLIENT_CONTRACT_VERSION = "2026-06";

/**
 * Trame du contrat de partenariat signé à la première connexion.
 * ⚠️ Texte de départ à faire relire par un juriste avant usage réel
 * (statut du partenaire, responsabilité, assurance, mandat de facturation).
 */
export function contractArticles(p: Pick<Partner, "company" | "contact" | "siret" | "commissionRate">) {
  return [
    {
      title: "Article 1 — Objet",
      body: `Le présent contrat définit les conditions dans lesquelles ${site.name} (${site.legal.publisherLegalName}, SIRET ${site.siret}), ci-après « la Plateforme », met en relation ses clients avec ${p.company} (SIRET ${p.siret}), ci-après « le Partenaire », pour la réalisation de prestations d'éducation et de comportement canin.`,
    },
    {
      title: "Article 2 — Missions",
      body: "La Plateforme confie au Partenaire des missions, ponctuelles ou récurrentes, précisées pour chacune dans le portail : client, adresse d'intervention, dates de rendez-vous et prix de la prestation. Le Partenaire est libre d'accepter ou de refuser une mission ; une fois acceptée, il s'engage à l'honorer ou à prévenir la Plateforme dans les meilleurs délais.",
    },
    {
      title: "Article 3 — Indépendance",
      body: "Le Partenaire exerce son activité en toute indépendance, avec ses propres moyens, sous sa responsabilité et à ses risques. Le présent contrat ne crée aucun lien de subordination, ni société, ni mandat de représentation. Le Partenaire déclare être régulièrement immatriculé et à jour de ses obligations sociales et fiscales.",
    },
    {
      title: "Article 4 — Prix et commission",
      body: `Le prix de chaque prestation est facturé au client par la Plateforme. La Plateforme retient une commission de ${p.commissionRate} % du montant facturé et reverse le solde au Partenaire après encaissement de la facture par le client. Le détail de chaque facture (montant, commission, net à percevoir) est consultable dans l'espace Facturation du portail.`,
    },
    {
      title: "Article 5 — Facturation et paiement",
      body: "Les séances réalisées sont validées dans le portail puis facturées au client. Le Partenaire est réglé du montant net une fois la facture payée par le client. Aucun reversement n'est dû tant que le client n'a pas payé.",
    },
    {
      title: "Article 6 — Qualité, assurance et responsabilité",
      body: "Le Partenaire s'engage à intervenir avec bienveillance, dans le respect du bien-être animal et de la réglementation en vigueur. Il justifie d'une assurance responsabilité civile professionnelle couvrant son activité et en fournit l'attestation sur demande.",
    },
    {
      title: "Article 7 — Confidentialité et données personnelles",
      body: "Les coordonnées des clients sont communiquées au Partenaire pour la seule exécution de la mission. Le Partenaire ne les utilise pas à d'autres fins, notamment commerciales, et ne les conserve pas au-delà de ce qui est nécessaire.",
    },
    {
      title: "Article 8 — Non-contournement",
      body: "Pendant la durée du contrat et douze mois après son terme, le Partenaire s'interdit de contracter directement avec un client présenté par la Plateforme pour des prestations équivalentes sans en informer la Plateforme et sans lui verser la commission prévue à l'article 4.",
    },
    {
      title: "Article 9 — Durée et résiliation",
      body: "Le contrat est conclu pour une durée indéterminée. Chaque partie peut y mettre fin avec un préavis de trente jours, par écrit. Les missions en cours à la date de résiliation sont menées à leur terme, sauf accord contraire.",
    },
    {
      title: "Article 10 — Acceptation électronique",
      body: `La saisie du nom du signataire (${p.contact}) et la validation de la case d'acceptation dans le portail valent signature électronique du présent contrat. La date et l'heure d'acceptation sont conservées par la Plateforme.`,
    },
  ];
}

/**
 * Contrat de prestation signé par le client à l'inscription.
 * ⚠️ Trame à faire relire par un juriste (droit de rétractation, annulation,
 * responsabilité, mandat de la plateforme pour déléguer à un partenaire).
 */
export function clientContractArticles(c: { name: string; service: string }) {
  return [
    {
      title: "Article 1 — Objet",
      body: `Le présent contrat est conclu entre ${site.name} (${site.legal.publisherLegalName}, SIRET ${site.siret}), ci-après « le Prestataire », et ${c.name}, ci-après « le Client », pour la prestation suivante : ${c.service}.`,
    },
    {
      title: "Article 2 — Exécution et délégation",
      body: "Le Prestataire peut confier tout ou partie de la prestation à un éducateur canin partenaire qualifié, qui intervient sous sa coordination. Le Client est informé de l'identité et des coordonnées du partenaire avant la première séance. Le Prestataire reste son interlocuteur pour toute question ou réclamation.",
    },
    {
      title: "Article 3 — Rendez-vous",
      body: "Les dates et lieux d'intervention sont convenus avec le Client après son inscription. Toute annulation ou report doit être signalé au moins 48 heures à l'avance ; à défaut, la séance peut être facturée.",
    },
    {
      title: "Article 4 — Prix et paiement",
      body: "Le prix de chaque séance est communiqué au Client avant la première intervention. Les séances réalisées sont facturées par le Prestataire et payables sous 14 jours par virement, quel que soit le partenaire intervenant.",
    },
    {
      title: "Article 5 — Engagements du Client",
      body: "Le Client s'engage à fournir des informations exactes sur son chien (comportement, santé, antécédents de morsure), à tenir l'animal en sécurité pendant les séances et à justifier de la vaccination et de l'assurance responsabilité civile propriétaire de l'animal.",
    },
    {
      title: "Article 6 — Responsabilité",
      body: "Le Client demeure responsable de son animal. L'éducateur met en œuvre les moyens nécessaires pour accompagner le chien et son maître, sans garantie de résultat, le comportement d'un animal dépendant de nombreux facteurs.",
    },
    {
      title: "Article 7 — Données personnelles",
      body: `Les données saisies sont utilisées pour organiser et facturer la prestation et sont transmises au seul partenaire en charge. Pour exercer vos droits, écrivez à ${site.email}. Voir la politique de confidentialité du site.`,
    },
    {
      title: "Article 8 — Droit de rétractation",
      body: "Le Client dispose de 14 jours à compter de la signature pour se rétracter. S'il demande que la prestation commence avant la fin de ce délai, il règle les séances déjà réalisées.",
    },
    {
      title: "Article 9 — Signature électronique",
      body: `La saisie du nom du Client (${c.name}) et la validation de la case d'acceptation valent signature électronique. La date et l'heure sont conservées.`,
    },
  ];
}
