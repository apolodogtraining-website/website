import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient, type Client } from "@libsql/client";

/**
 * Base libSQL : Turso en production (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN),
 * simple fichier local en développement quand rien n'est configuré.
 */
const url = process.env.TURSO_DATABASE_URL ?? (process.env.NODE_ENV === "production" ? "" : "file:data/portal.db");

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL DEFAULT '',
    siret TEXT NOT NULL DEFAULT '',
    specialties TEXT NOT NULL DEFAULT '',
    commission_rate REAL NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    contract_signed_at TEXT,
    contract_signed_by TEXT,
    contract_version TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partners(id),
    type TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL DEFAULT '',
    client_phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    service TEXT NOT NULL,
    price REAL NOT NULL,
    commission_rate REAL NOT NULL,
    frequency TEXT,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    client_signed_at TEXT,
    client_signed_by TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    contract_id TEXT NOT NULL REFERENCES contracts(id),
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    invoice_id TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    contract_id TEXT NOT NULL REFERENCES contracts(id),
    partner_id TEXT NOT NULL REFERENCES partners(id),
    issued_at TEXT NOT NULL,
    due_at TEXT NOT NULL,
    gross REAL NOT NULL,
    commission REAL NOT NULL,
    net REAL NOT NULL,
    client_paid_at TEXT,
    payout_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    dog_name TEXT NOT NULL DEFAULT '',
    dog_breed TEXT NOT NULL DEFAULT '',
    service TEXT NOT NULL,
    type TEXT NOT NULL,
    preferred_date TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    signed_at TEXT NOT NULL,
    signed_by TEXT NOT NULL,
    contract_version TEXT NOT NULL,
    status TEXT NOT NULL,
    contract_id TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS dogs (
    id TEXT PRIMARY KEY,
    contract_id TEXT NOT NULL REFERENCES contracts(id),
    name TEXT NOT NULL,
    breed TEXT NOT NULL DEFAULT '',
    sex TEXT NOT NULL DEFAULT '',
    age TEXT NOT NULL DEFAULT '',
    chip TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`,
  // « Étude de comportement » : une fiche par chien, réponses en JSON (voir lib/portal/fiche.ts).
  `CREATE TABLE IF NOT EXISTS fiches (
    dog_id TEXT PRIMARY KEY REFERENCES dogs(id),
    data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    updated_at TEXT NOT NULL,
    updated_by TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_dogs_contract ON dogs(contract_id)`,
  `CREATE INDEX IF NOT EXISTS idx_contracts_partner ON contracts(partner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_contract ON sessions(contract_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_partner ON invoices(partner_id)`,
];

/** Partenaire interne « Moi-même » : toujours présent, sans commission, sans connexion possible. */
export const SELF_ID = "self";

async function ensureSelfPartner(client: Client) {
  const { site } = await import("@/lib/site");
  await client.execute({
    sql: `INSERT OR IGNORE INTO partners
      (id, company, contact, email, phone, siret, specialties, commission_rate, active, is_self, password_hash, created_at, contract_signed_at, contract_signed_by, contract_version)
      VALUES (?,?,?,?,?,?,?,0,1,1,'!',?,?,?,'interne')`,
    args: [SELF_ID, `Moi-même (${site.name})`, site.legal.publisherFullName, "interne@portail.invalid", site.phone, site.siret, "Prestations réalisées en direct", "2026-01-01", "2026-01-01T00:00", site.legal.publisherFullName],
  });
}

type Cache = { client?: Client; ready?: Promise<Client> };
const g = globalThis as unknown as { __portalDb?: Cache };
const cache: Cache = (g.__portalDb ??= {});

/** Client prêt à l'emploi : le schéma est créé au premier appel (idempotent). */
export function db(): Promise<Client> {
  if (!cache.ready) {
    if (!url) throw new Error("TURSO_DATABASE_URL est requis en production.");
    if (url.startsWith("file:")) mkdirSync(dirname(url.slice(5)), { recursive: true }); // dossier du fichier local
    const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    cache.client = client;
    cache.ready = (async () => {
      await client.batch(SCHEMA, "write");
      // Migration : colonne ajoutée après la première version du schéma (les bases existantes ne l'ont pas).
      for (const ddl of [
        "ALTER TABLE partners ADD COLUMN is_self INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE partners ADD COLUMN copy_sent_at TEXT", // exemplaire du contrat envoyé par e-mail
        "ALTER TABLE requests ADD COLUMN copy_sent_at TEXT",
        "ALTER TABLE requests ADD COLUMN early_start_at TEXT", // demande expresse de début avant la fin du délai de rétractation
        "ALTER TABLE sessions ADD COLUMN calendar_event_id TEXT", // événement Google Agenda lié
        "ALTER TABLE requests ADD COLUMN calendar_event_id TEXT",
        "ALTER TABLE requests ADD COLUMN first_name TEXT", // nom et prénom saisis séparément
        "ALTER TABLE contracts ADD COLUMN client_first_name TEXT",
        "ALTER TABLE fiches ADD COLUMN last_sent_at TEXT", // dernier envoi de l'étude par e-mail
        "ALTER TABLE fiches ADD COLUMN last_sent_to TEXT",
        "ALTER TABLE requests ADD COLUMN dogs_json TEXT", // tous les chiens déclarés à l'inscription
        "ALTER TABLE contracts ADD COLUMN client_last_name TEXT",
        "ALTER TABLE requests ADD COLUMN last_name TEXT",
      ]) {
        await client.execute(ddl).catch((e: Error) => {
          if (!/duplicate column/i.test(e.message)) throw e;
        });
      }
      await ensureSelfPartner(client);
      const { seedDemoIfEmpty } = await import("./seed");
      await seedDemoIfEmpty(client);
      return client;
    })().catch((e) => {
      cache.ready = undefined; // permet de réessayer au prochain appel
      throw e;
    });
  }
  return cache.ready;
}
