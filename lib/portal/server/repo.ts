import type { Client, Row } from "@libsql/client";
import type { ClientRequest, Contract, Invoice, Partner, PortalData, PortalSession, Session } from "../types";

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
  createdAt: s(r.created_at),
  contractSignedAt: sn(r.contract_signed_at),
  contractSignedBy: sn(r.contract_signed_by),
  contractVersion: sn(r.contract_version),
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

const toRequest = (r: Row): ClientRequest => ({
  id: s(r.id),
  createdAt: s(r.created_at),
  name: s(r.name),
  email: s(r.email),
  phone: s(r.phone),
  address: s(r.address),
  dogName: s(r.dog_name),
  dogBreed: s(r.dog_breed),
  service: s(r.service),
  type: s(r.type) as ClientRequest["type"],
  preferredDate: s(r.preferred_date),
  notes: s(r.notes),
  signedAt: s(r.signed_at),
  signedBy: s(r.signed_by),
  contractVersion: s(r.contract_version),
  status: s(r.status) as ClientRequest["status"],
  contractId: sn(r.contract_id),
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
      sessions: sess
        .filter((x) => x.contractId === s(r.id))
        .map((x): Session => ({ id: x.id, date: x.date, status: x.status, invoiceId: x.invoiceId })),
    })),
    invoices: invoices.rows.map((r) => toInvoice(r, byInvoice.get(s(r.id)) ?? [])),
    requests: requests.rows.map(toRequest),
  };
}
