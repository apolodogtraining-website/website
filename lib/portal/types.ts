import type { PackKind } from "./packs";
import type { PortalSettings } from "./settings";

export type Role = "admin" | "partner";

export type Partner = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  siret: string;
  specialties: string;
  /** Commission prélevée par la plateforme, en % du montant facturé au client. */
  commissionRate: number;
  active: boolean;
  /** Partenaire interne « Moi-même » : le gérant réalise la prestation, sans commission ni compte. */
  isSelf: boolean;
  createdAt: string;
  contractSignedAt: string | null;
  contractSignedBy: string | null;
  contractVersion: string | null;
  /** Date d'envoi par e-mail de l'exemplaire signé (null : pas encore envoyé). */
  copySentAt?: string | null;
};

export type Frequency = "weekly" | "biweekly" | "monthly";
export type ContractType = "recurring" | "oneoff";
/** « session » : prix d'une séance, facturé au fil des séances réalisées ; « package » : prix global d'un forfait, facturé en une fois. */
export type Pricing = "session" | "package";
export type SessionStatus = "planned" | "done" | "cancelled";

export type Session = {
  id: string;
  /** Format « YYYY-MM-DDTHH:mm », heure locale. */
  date: string;
  status: SessionStatus;
  invoiceId: string | null;
};

/** Un « contrat » = un client confié à un partenaire, ponctuel ou récurrent. */
export type Contract = {
  id: string;
  partnerId: string;
  type: ContractType;
  /** Nom complet affiché : « Prénom NOM » (ou le nom seul quand il n'y a pas de prénom). */
  clientName: string;
  clientFirstName?: string | null;
  clientLastName?: string | null;
  clientEmail: string;
  clientPhone: string;
  address: string;
  service: string;
  /** Mode de tarification (absent = « session »). */
  pricing?: Pricing;
  /** Prix facturé au client, en euros : d'une séance, ou du forfait global selon `pricing`. */
  price: number;
  /** Taux figé à la création : changer le taux du partenaire n'altère pas l'existant. */
  commissionRate: number;
  frequency: Frequency | null;
  notes: string;
  sessions: Session[];
  createdAt: string;
  /** Signature du contrat de prestation par le client (inscription en ligne). */
  clientSignedAt?: string | null;
  clientSignedBy?: string | null;
  dogs?: Dog[];
  /** Packs commandés par ce client, du plus ancien au plus récent (un client peut en enchaîner plusieurs). */
  packs?: Pack[];
};

/**
 * Un pack d'accompagnement commandé par un client, après l'étude de comportement. Le prix est celui
 * convenu avec le client (modifiable tant que le pack n'est pas facturé), pas le tarif « à partir de ».
 */
export type Pack = {
  id: string;
  contractId: string;
  kind: PackKind;
  price: number;
  /** Date de l'accord avec le client, « YYYY-MM-DD ». */
  orderedAt: string;
  /** Date de fin du pack (null = en cours). */
  closedAt: string | null;
  notes: string;
};

export type Sex = "M" | "F" | "";

/** Un chien appartient à un contrat client (un client peut en avoir plusieurs). */
export type Dog = {
  id: string;
  contractId: string;
  name: string;
  breed: string;
  sex: Sex;
  age: string;
  chip: string;
  /** État de l'étude de comportement : « none » tant qu'aucune fiche n'a été ouverte. */
  ficheStatus: "none" | "draft" | "completed";
  ficheUpdatedAt: string | null;
};

export type Invoice = {
  id: string;
  number: string;
  contractId: string;
  partnerId: string;
  issuedAt: string;
  dueAt: string;
  sessionIds: string[];
  gross: number;
  commission: number;
  net: number;
  /** Date à laquelle la facture a été réglée EN TOTALITÉ (null tant qu'il reste un solde). */
  clientPaidAt: string | null;
  payoutAt: string | null;
  /** Date de la dernière relance de paiement envoyée au client par e-mail. */
  lastReminderAt?: string | null;
  /** Pack facturé (null = facture du contrat : séances ou forfait). */
  packId?: string | null;
  /** Règlements reçus du client (acomptes, solde). Absent sur une facture soldée avant leur suivi. */
  payments?: Payment[];
};

/** Un règlement reçu du client sur une facture. */
export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  /** « YYYY-MM-DD ». */
  paidAt: string;
  /** Mode de règlement (chèque, virement…) ; vide pour un règlement saisi avant ce champ. */
  method: string;
  note: string;
};

export type InvoiceStatus = "sent" | "partial" | "late" | "paid" | "settled";

export type RequestStatus = "pending" | "converted" | "declined";

/** Inscription d'un client via la page publique, avec son contrat de prestation signé. */
export type ClientRequest = {
  id: string;
  createdAt: string;
  /** Nom complet « Prénom NOM » (pour les anciennes inscriptions, tel que saisi). */
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone: string;
  address: string;
  dogName: string;
  dogBreed: string;
  /** Tous les chiens déclarés (le premier reprend dogName / dogBreed). */
  dogs?: { name: string; breed: string }[];
  service: string;
  type: ContractType;
  preferredDate: string;
  notes: string;
  signedAt: string;
  signedBy: string;
  contractVersion: string;
  status: RequestStatus;
  contractId: string | null;
  copySentAt?: string | null;
  /** Date de la demande expresse de début de prestation avant la fin des 14 jours de rétractation (null = non demandée). */
  earlyStartAt?: string | null;
};

export type PortalSession = { role: "admin" } | { role: "partner"; partnerId: string };

export type PortalData = {
  partners: Partner[];
  contracts: Contract[];
  invoices: Invoice[];
  requests: ClientRequest[];
  settings: PortalSettings;
};
