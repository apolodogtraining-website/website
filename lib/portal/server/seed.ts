import type { Client } from "@libsql/client";
import { DEMO_PARTNER_PASSWORD, seedData } from "../seed";
import { hashPassword } from "./auth";

/**
 * Données de démonstration, uniquement hors production (ou si
 * PORTAL_SEED_DEMO=1) et uniquement sur une base totalement vide.
 */
export async function seedDemoIfEmpty(client: Client) {
  if (process.env.NODE_ENV === "production" && process.env.PORTAL_SEED_DEMO !== "1") return;
  const count = await client.execute("SELECT COUNT(*) AS n FROM partners WHERE is_self = 0");
  if (Number(count.rows[0].n) > 0) return;
  const reqCount = await client.execute("SELECT COUNT(*) AS n FROM requests");
  if (Number(reqCount.rows[0].n) > 0) return;

  const d = seedData();
  const hash = await hashPassword(DEMO_PARTNER_PASSWORD);
  const stmts = [
    ...d.partners.map((p) => ({
      sql: "INSERT INTO partners (id, company, contact, email, phone, siret, specialties, commission_rate, active, password_hash, created_at, contract_signed_at, contract_signed_by, contract_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      args: [p.id, p.company, p.contact, p.email, p.phone, p.siret, p.specialties, p.commissionRate, p.active ? 1 : 0, hash, p.createdAt, p.contractSignedAt, p.contractSignedBy, p.contractVersion],
    })),
    ...d.contracts.map((c) => ({
      sql: "INSERT INTO contracts VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      args: [c.id, c.partnerId, c.type, c.clientName, c.clientEmail, c.clientPhone, c.address, c.service, c.price, c.commissionRate, c.frequency, c.notes, c.createdAt, c.clientSignedAt ?? null, c.clientSignedBy ?? null],
    })),
    ...d.contracts.flatMap((c) =>
      c.sessions.map((s) => ({
        sql: "INSERT INTO sessions (id, contract_id, date, status, invoice_id) VALUES (?,?,?,?,?)",
        args: [s.id, c.id, s.date, s.status, s.invoiceId],
      })),
    ),
    ...d.invoices.map((i) => ({
      sql: "INSERT INTO invoices VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      args: [i.id, i.number, i.contractId, i.partnerId, i.issuedAt, i.dueAt, i.gross, i.commission, i.net, i.clientPaidAt, i.payoutAt],
    })),
    ...d.requests.map((r) => ({
      sql: "INSERT INTO requests (id, created_at, name, email, phone, address, dog_name, dog_breed, service, type, preferred_date, notes, signed_at, signed_by, contract_version, status, contract_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      args: [r.id, r.createdAt, r.name, r.email, r.phone, r.address, r.dogName, r.dogBreed, r.service, r.type, r.preferredDate, r.notes, r.signedAt, r.signedBy, r.contractVersion, r.status, r.contractId],
    })),
  ];
  await client.batch(stmts, "write");
}
