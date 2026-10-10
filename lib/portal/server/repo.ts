import type { Client, Row } from "@libsql/client";
import type { ClientRequest, Contract, Dog, Invoice, Partner, PortalData, PortalSession, Session } from "../types";

const s = (v: unknown) => (v == null ? "" : String(v));
const sn = (v: unknown) => (v == null ? null : String(v));

const toPartner = (r: Row): Partner => ({
  id: s(r.id),
  company: s(r.company),
  contact: s(r.contact),
  email: s(r.email),
  phone: s(r.phone),
  siret: s(r.siret),
  specialties: s(r.specialties),
  commissionRate: Number(r.commission_rate),
  active: Number(r.active) === 1,
  isSelf: Number(r.is_self) === 1,
  createdAt: s(r.created_at),
  contractSignedAt: sn(r.contract_signed_at),
  contractSignedBy: sn(r.contract_signed_by),
  contractVersion: sn(r.contract_version),
  copySentAt: sn(r.copy_sent_at),
});

const toSession = (r: Row): Session & { contractId: string } => ({
  id: s(r.id),
  contractId: s(r.contract_id),
  date: s(r.date),
  status: s(r.status) as Session["status"],
  invoiceId: sn(r.invoice_id),
});

const toInvoice = (r: Row, sessionIds: string[]): Invoice => ({
  id: s(r.id),
  number: s(r.number),
  contractId: s(r.contract_id),
  partnerId: s(r.partner_id),
  issuedAt: s(r.issued_at),
  dueAt: s(r.due_at),
  sessionIds,
  gross: Number(r.gross),
  commission: Number(r.commission),
  net: Number(r.net),
  clientPaidAt: sn(r.client_paid_at),
  payoutAt: sn(r.payout_at),
});

function parseDogs(json: unknown, name: unknown, breed: unknown): { name: string; breed: string }[] {
  try {
    const arr = JSON.parse(String(json));
    if (Array.isArray(arr) && arr.length) {
      return arr.map((d) => ({ name: String(d?.name ?? ""), breed: String(d?.breed ?? "") })).filter((d) => d.name);
    }
  } catch {
    /* anciennes inscriptions : un seul chien dans dog_name / dog_breed */
  }
  return s(name) ? [{ name: s(name), breed: s(breed) }] : [];
}

const toRequest = (r: Row): ClientRequest => ({
  id: s(r.id),
  createdAt: s(r.created_at),
  name: s(r.name),
  firstName: sn(r.first_name),
  lastName: sn(r.last_name),
  email: s(r.email),
  phone: s(r.phone),
  address: s(r.address),
  dogName: s(r.dog_name),
  dogBreed: s(r.dog_breed),
  dogs: parseDogs(r.dogs_json, r.dog_name, r.dog_breed),
  service: s(r.service),
  type: s(r.type) as ClientRequest["type"],
  preferredDate: s(r.preferred_date),
  notes: s(r.notes),
  signedAt: s(r.signed_at),
  signedBy: s(r.signed_by),
  contractVersion: s(r.contract_version),
  status: s(r.status) as ClientRequest["status"],
  contractId: sn(r.contract_id),
  copySentAt: sn(r.copy_sent_at),
});

/**
 * Photographie des données visibles par la session : l'administrateur voit
 * tout, un partenaire uniquement son compte, ses contrats et ses factures
 * (jamais les inscriptions clients ni les autres partenaires).
 */
export async function snapshot(client: Client, session: PortalSession): Promise<PortalData> {
  const scope = session.role === "partner" ? session.partnerId : null;
  const where = (col: string) => (scope ? { sql: ` WHERE ${col} = ?`, args: [scope] } : { sql: "", args: [] });

  const [partners, contracts, invoices, requests] = await Promise.all([
    client.execute(scope ? { sql: "SELECT * FROM partners WHERE id = ?", args: [scope] } : "SELECT * FROM partners ORDER BY created_at, company"),
    client.execute({ sql: `SELECT * FROM contracts${where("partner_id").sql} ORDER BY created_at, id`, args: where("partner_id").args }),
    client.execute({ sql: `SELECT * FROM invoices${where("partner_id").sql} ORDER BY issued_at, number`, args: where("partner_id").args }),
    scope ? Promise.resolve({ rows: [] as Row[] }) : client.execute("SELECT * FROM requests ORDER BY created_at DESC"),
  ]);

  const contractIds = contracts.rows.map((r) => s(r.id));
  const sessions = contractIds.length
    ? await client.execute({
        sql: `SELECT * FROM sessions WHERE contract_id IN (${contractIds.map(() => "?").join(",")}) ORDER BY date`,
        args: contractIds,
      })
    : { rows: [] as Row[] };

  const dogRows = contractIds.length
    ? await client.execute({
        sql: `SELECT d.*, f.status AS fiche_status, f.updated_at AS fiche_updated
              FROM dogs d LEFT JOIN fiches f ON f.dog_id = d.id
              WHERE d.contract_id IN (${contractIds.map(() => "?").join(",")}) ORDER BY d.created_at, d.name`,
        args: contractIds,
      })
    : { rows: [] as Row[] };
  const dogs: Dog[] = dogRows.rows.map((r) => ({
    id: s(r.id),
    contractId: s(r.contract_id),
    name: s(r.name),
    breed: s(r.breed),
    sex: (s(r.sex) as Dog["sex"]),
    age: s(r.age),
    chip: s(r.chip),
    ficheStatus: r.fiche_status ? (s(r.fiche_status) as Dog["ficheStatus"]) : "none",
    ficheUpdatedAt: sn(r.fiche_updated),
  }));

  const sess = sessions.rows.map(toSession);
  const byInvoice = new Map<string, string[]>();
  for (const x of sess) if (x.invoiceId) byInvoice.set(x.invoiceId, [...(byInvoice.get(x.invoiceId) ?? []), x.id]);

  return {
    partners: partners.rows.map(toPartner),
    contracts: contracts.rows.map((r): Contract => ({
      id: s(r.id),
      partnerId: s(r.partner_id),
      type: s(r.type) as Contract["type"],
      clientName: s(r.client_name),
      clientFirstName: sn(r.client_first_name),
      clientLastName: sn(r.client_last_name),
      clientEmail: s(r.client_email),
      clientPhone: s(r.client_phone),
      address: s(r.address),
      service: s(r.service),
      price: Number(r.price),
      commissionRate: Number(r.commission_rate),
      frequency: sn(r.frequency) as Contract["frequency"],
      notes: s(r.notes),
      createdAt: s(r.created_at),
      clientSignedAt: sn(r.client_signed_at),
      clientSignedBy: sn(r.client_signed_by),
      dogs: dogs.filter((d) => d.contractId === s(r.id)),
      sessions: sess
        .filter((x) => x.contractId === s(r.id))
        .map((x): Session => ({ id: x.id, date: x.date, status: x.status, invoiceId: x.invoiceId })),
    })),
    invoices: invoices.rows.map((r) => toInvoice(r, byInvoice.get(s(r.id)) ?? [])),
    requests: requests.rows.map(toRequest),
  };
}
