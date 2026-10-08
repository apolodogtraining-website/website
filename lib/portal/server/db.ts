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
  `CREATE INDEX IF NOT EXISTS idx_contracts_partner ON contracts(partner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_contract ON sessions(contract_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_partner ON invoices(partner_id)`,
];

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
