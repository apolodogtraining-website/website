import type { Contract, Frequency, Invoice, InvoiceStatus, Session } from "./types";

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const money = (n: number) => eur.format(n);

export const round2 = (n: number) => Math.round(n * 100) / 100;

const pad = (n: number) => String(n).padStart(2, "0");

/** « YYYY-MM-DDTHH:mm » en heure locale (valeur d'un <input type="datetime-local">). */
export function toLocalInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const todayISO = () => toLocalInput(new Date()).slice(0, 10);

export function addDaysISO(iso: string, days: number) {
  const d = new Date(`${iso}T12:00`);
  d.setDate(d.getDate() + days);
  return toLocalInput(d).slice(0, 10);
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const fmtDate = (iso: string) => dateFmt.format(new Date(iso.length === 10 ? `${iso}T12:00` : iso));
export const fmtDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));

export const frequencyLabel: Record<Frequency, string> = {
  weekly: "Chaque semaine",
  biweekly: "Toutes les 2 semaines",
  monthly: "Chaque mois",
};

let counter = 0;
export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Génère les séances d'un contrat à partir de la première date. */
export function generateSessions(start: string, frequency: Frequency | null, count: number): Session[] {
  const out: Session[] = [];
  const first = new Date(start);
  for (let i = 0; i < Math.max(1, count); i++) {
    const d = new Date(first);
    if (frequency === "weekly") d.setDate(first.getDate() + 7 * i);
    else if (frequency === "biweekly") d.setDate(first.getDate() + 14 * i);
    else if (frequency === "monthly") d.setMonth(first.getMonth() + i);
    out.push({ id: uid("s"), date: toLocalInput(d), status: "planned", invoiceId: null });
    if (!frequency) break;
  }
  return out;
}

export const billableSessions = (c: Contract) =>
  c.sessions.filter((s) => s.status === "done" && !s.invoiceId);

export function splitAmount(gross: number, rate: number) {
  const commission = round2((gross * rate) / 100);
  return { gross: round2(gross), commission, net: round2(gross - commission) };
}

export function invoiceStatus(inv: Invoice): InvoiceStatus {
  if (inv.payoutAt) return "settled";
  if (inv.clientPaidAt) return "paid";
  return inv.dueAt < todayISO() ? "late" : "sent";
}

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  sent: "Envoyée",
  late: "En retard",
  paid: "Payée par le client",
  settled: "Partenaire réglé",
};

/** Libellé de l'état de facturation d'un contrat, vu du suivi global. */
export function contractBilling(c: Contract, invoices: Invoice[]) {
  const own = invoices.filter((i) => i.contractId === c.id);
  const toBill = billableSessions(c).length;
  const late = own.some((i) => invoiceStatus(i) === "late");
  const open = own.some((i) => !i.clientPaidAt);
  if (late) return { tone: "red" as const, label: "Facture en retard" };
  if (toBill > 0) return { tone: "amber" as const, label: `${toBill} séance${toBill > 1 ? "s" : ""} à facturer` };
  if (open) return { tone: "blue" as const, label: "En attente de paiement" };
  if (own.length > 0) return { tone: "green" as const, label: "À jour" };
  return { tone: "gray" as const, label: "Rien à facturer" };
}

export function nextSession(c: Contract) {
  const now = toLocalInput(new Date());
  return c.sessions
    .filter((s) => s.status === "planned" && s.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

/** Garde uniquement les chiffres (champs téléphone). */
export const onlyDigits = (s: string) => s.replace(/\D/g, "");

/** « 0612345678 » → « 06 12 34 56 78 » ; les autres formats sont laissés tels quels. */
export const fmtPhone = (s: string) => {
  const d = onlyDigits(s);
  return d.length === 10 ? d.replace(/(\d{2})(?=\d)/g, "$1 ") : s;
};

/** Nom complet d'un client : « Prénom NOM ». Même règle côté formulaire et côté serveur. */
export const composeName = (firstName: string, lastName: string) =>
  `${firstName.trim()} ${lastName.trim().toUpperCase()}`.trim();

/** Nombre saisi dans un champ texte (virgule ou point) ; NaN si vide ou invalide. */
export const parseDecimal = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));
