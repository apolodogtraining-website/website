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
      sql: "INSERT INTO contracts (id, partner_id, type, client_name, client_first_name, client_last_name, client_email, client_phone, address, service, price, commission_rate, frequency, notes, created_at, client_signed_at, client_signed_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      args: [c.id, c.partnerId, c.type, c.clientName, c.clientFirstName ?? null, c.clientLastName ?? null, c.clientEmail, c.clientPhone, c.address, c.service, c.price, c.commissionRate, c.frequency, c.notes, c.createdAt, c.clientSignedAt ?? null, c.clientSignedBy ?? null],
    })),
    ...d.contracts.flatMap((c) =>
      c.sessions.map((s) => ({
        sql: "INSERT INTO sessions (id, contract_id, date, status, invoice_id) VALUES (?,?,?,?,?)",
        args: [s.id, c.id, s.date, s.status, s.invoiceId],
      })),
    ),
    ...d.contracts.flatMap((c) =>
      (c.dogs ?? []).map((dg) => ({
        sql: "INSERT INTO dogs (id, contract_id, name, breed, sex, age, chip, created_at) VALUES (?,?,?,?,?,?,?,?)",
        args: [dg.id, c.id, dg.name, dg.breed, dg.sex, dg.age, dg.chip, "2026-09-01"],
      })),
    ),
    // Fiche partiellement remplie pour illustrer l'étude de comportement.
    {
      sql: "INSERT INTO fiches (dog_id, data, status, updated_at, updated_by) VALUES (?,?,?,?,?)",
      args: [
        "d1",
        JSON.stringify({ date: "2026-09-08", raisons: "Chiot qui tire en laisse et mordille.", sexe: "Mâle", age: "5 mois", temperament: "Sociable", energie: "Très haut", edu_tire: "oui", edu_assis: "non", comp_mordille: "oui", comp_mordille__detail: "Surtout le soir, sur les mains." }),
        "draft",
        "2026-09-08T17:50:00.000Z",
        "Canin Nature 33",
      ],
    },
    ...d.invoices.map((i) => ({
      sql: "INSERT INTO invoices VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      args: [i.id, i.number, i.contractId, i.partnerId, i.issuedAt, i.dueAt, i.gross, i.commission, i.net, i.clientPaidAt, i.payoutAt],
    })),
    ...d.requests.map((r) => ({
      sql: "INSERT INTO requests (id, created_at, name, first_name, last_name, email, phone, address, dog_name, dog_breed, dogs_json, service, type, preferred_date, notes, signed_at, signed_by, contract_version, status, contract_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      args: [r.id, r.createdAt, r.name, r.firstName ?? null, r.lastName ?? null, r.email, r.phone, r.address, r.dogName, r.dogBreed, JSON.stringify(r.dogs ?? [{ name: r.dogName, breed: r.dogBreed }]), r.service, r.type, r.preferredDate, r.notes, r.signedAt, r.signedBy, r.contractVersion, r.status, r.contractId],
    })),
  ];
  await client.batch(stmts, "write");
}
