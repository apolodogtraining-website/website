import type { Client, InStatement } from "@libsql/client";
import { CONTRACT_VERSION } from "../contract-text";
import { addDaysISO, billableSessions, generateSessions, splitAmount, todayISO, toLocalInput, uid } from "../format";
import type { Contract, Frequency, PortalSession, Session } from "../types";
import { after } from "next/server";
import { hashPassword, tempPassword } from "./auth";
import { collectEventIds, deleteEvents, syncAll, syncContract, syncPartner, syncRequest, syncSessions } from "./calendar";
import { deliverPartnerCopy, deliverRequestCopy } from "./copies";
import { SELF_ID } from "./db";
import { snapshot } from "./repo";

export class ActionError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

type Body = Record<string, unknown>;

/* ---- validation : le serveur ne fait jamais confiance au client ---- */
const text = (v: unknown, label: string, { max = 200, required = true } = {}) => {
  const x = typeof v === "string" ? v.trim() : "";
  if (required && !x) throw new ActionError(`${label} est requis.`);
  if (x.length > max) throw new ActionError(`${label} est trop long.`);
  return x;
};
const num = (v: unknown, label: string, min: number, max: number) => {
  // Number(null) et Number("") valent 0 : un champ vide ne doit pas passer pour un zéro.
  if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) throw new ActionError(`${label} est requis.`);
  const x = Number(v);
  if (!Number.isFinite(x) || x < min || x > max) throw new ActionError(`${label} est invalide.`);
  return x;
};
/** Téléphone : seuls les chiffres sont conservés (8 à 15), le reste est retiré. Vide accepté si facultatif. */
export const phoneDigits = (v: unknown, label: string, required = false) => {
  const d = typeof v === "string" ? v.replace(/\D/g, "") : "";
  if (!d) {
    if (required) throw new ActionError(`${label} est requis.`);
    return "";
  }
  if (d.length < 8 || d.length > 15) throw new ActionError(`${label} doit contenir entre 8 et 15 chiffres.`);
  return d;
};
const oneOf = <T extends string>(v: unknown, label: string, allowed: readonly T[]): T => {
  if (typeof v !== "string" || !allowed.includes(v as T)) throw new ActionError(`${label} est invalide.`);
  return v as T;
};
const datetime = (v: unknown, label: string, required = true) => {
  const x = text(v, label, { max: 16, required });
  if (x && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(x)) throw new ActionError(`${label} est invalide.`);
  return x;
};
const email = (v: unknown, label: string, required = true) => {
  const x = text(v, label, { max: 200, required }).toLowerCase();
  if (x && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)) throw new ActionError(`${label} est invalide.`);
  return x;
};

const FREQUENCIES = ["weekly", "biweekly", "monthly"] as const;

function partnerFields(b: Body) {
  return {
    company: text(b.company, "L'entreprise"),
    contact: text(b.contact, "Le contact"),
    email: email(b.email, "L'e-mail"),
    phone: phoneDigits(b.phone, "Le téléphone"),
    siret: text(b.siret, "Le SIRET", { max: 40 }),
    specialties: text(b.specialties, "Les spécialités", { max: 300, required: false }),
    commissionRate: num(b.commissionRate, "La commission", 0, 100),
    active: b.active !== false,
  };
}

function contractFields(b: Body) {
  const type = oneOf(b.type, "Le type", ["recurring", "oneoff"] as const);
  return {
    partnerId: text(b.partnerId, "Le partenaire", { max: 80 }),
    type,
    clientName: text(b.clientName, "Le client"),
    clientEmail: email(b.clientEmail, "L'e-mail du client", false),
    clientPhone: phoneDigits(b.clientPhone, "Le téléphone du client"),
    address: text(b.address, "L'adresse", { max: 300 }),
    service: text(b.service, "La prestation"),
    price: num(b.price, "Le prix", 0, 100000),
    commissionRate: num(b.commissionRate, "La commission", 0, 100),
    frequency: type === "recurring" ? oneOf(b.frequency, "La fréquence", FREQUENCIES) : null,
    notes: text(b.notes, "Les notes", { max: 1000, required: false }),
  };
}

async function one(client: Client, sql: string, args: (string | number)[]) {
  return (await client.execute({ sql, args })).rows[0];
}

async function requirePartnerRow(client: Client, id: string) {
  const row = await one(client, "SELECT id, commission_rate FROM partners WHERE id = ?", [id]);
  if (!row) throw new ActionError("Partenaire introuvable.", 404);
  return row;
}

async function loadContract(client: Client, id: string): Promise<Contract> {
  const data = await snapshot(client, { role: "admin" });
  const c = data.contracts.find((x) => x.id === id);
  if (!c) throw new ActionError("Contrat introuvable.", 404);
  return c;
}

const ADMIN_ONLY = new Set([
  "savePartner",
  "deletePartner",
  "resetPartnerPassword",
  "saveContract",
  "deleteContract",
  "addSession",
  "removeSession",
  "invoiceContract",
  "markClientPaid",
  "markPayout",
  "declineRequest",
  "deleteRequest",
  "resendPartnerContract",
  "resendRequestContract",
  "syncCalendar",
]);

/** Exécute une action métier avec les droits de la session et renvoie un éventuel résultat. */
export async function runAction(client: Client, session: PortalSession, type: string, b: Body): Promise<unknown> {
  if (ADMIN_ONLY.has(type) && session.role !== "admin") throw new ActionError("Accès refusé.", 403);

  switch (type) {
    /* ---------- partenaires ---------- */
    case "savePartner": {
      const f = partnerFields(b);
      const id = typeof b.id === "string" ? b.id : null;
      const dup = await one(client, "SELECT id FROM partners WHERE email = ?", [f.email]);
      if (dup && dup.id !== id) throw new ActionError("Un partenaire utilise déjà cet e-mail.");
      if (id === SELF_ID) throw new ActionError("Le partenaire interne n'est pas modifiable.");
      if (id) {
        await requirePartnerRow(client, id);
        await client.execute({
          sql: "UPDATE partners SET company=?, contact=?, email=?, phone=?, siret=?, specialties=?, commission_rate=?, active=? WHERE id=?",
          args: [f.company, f.contact, f.email, f.phone, f.siret, f.specialties, f.commissionRate, f.active ? 1 : 0, id],
        });
        after(() => syncPartner(client, id)); // le nom de l'entreprise figure dans le titre des événements
        return { id };
      }
      const newId = uid("p");
      const password = tempPassword();
      await client.execute({
        sql: "INSERT INTO partners (id, company, contact, email, phone, siret, specialties, commission_rate, active, password_hash, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        args: [newId, f.company, f.contact, f.email, f.phone, f.siret, f.specialties, f.commissionRate, 1, await hashPassword(password), todayISO()],
      });
      return { id: newId, password };
    }
    case "deletePartner": {
      const id = text(b.id, "Le partenaire", { max: 80 });
      if (id === SELF_ID) throw new ActionError("Le partenaire interne ne peut pas être supprimé.");
      const eventIds = await collectEventIds(client, { sessions: "c.partner_id = ?" }, [id]);
      await client.batch(
        [
          { sql: "DELETE FROM sessions WHERE contract_id IN (SELECT id FROM contracts WHERE partner_id = ?)", args: [id] },
          { sql: "DELETE FROM invoices WHERE partner_id = ?", args: [id] },
          { sql: "UPDATE requests SET contract_id = NULL WHERE contract_id IN (SELECT id FROM contracts WHERE partner_id = ?)", args: [id] },
          { sql: "DELETE FROM contracts WHERE partner_id = ?", args: [id] },
          { sql: "DELETE FROM partners WHERE id = ?", args: [id] },
        ],
        "write",
      );
      after(() => deleteEvents(eventIds));
      return null;
    }
    case "resetPartnerPassword": {
      const id = text(b.id, "Le partenaire", { max: 80 });
      if (id === SELF_ID) throw new ActionError("Le partenaire interne n'a pas de compte.");
      await requirePartnerRow(client, id);
      const password = tempPassword();
      await client.execute({ sql: "UPDATE partners SET password_hash = ? WHERE id = ?", args: [await hashPassword(password), id] });
      return { password };
    }
    case "signContract": {
      if (session.role !== "partner") throw new ActionError("Accès refusé.", 403);
      const row = await one(client, "SELECT contact, contract_signed_at FROM partners WHERE id = ?", [session.partnerId]);
      if (!row) throw new ActionError("Partenaire introuvable.", 404);
      if (row.contract_signed_at) return null;
      // Le nom saisi doit correspondre au contact enregistré (même règle que l'interface).
      if (text(b.signedBy, "Le nom").toLowerCase() !== String(row.contact).trim().toLowerCase()) {
        throw new ActionError("Le nom saisi ne correspond pas au signataire.");
      }
      await client.execute({
        sql: "UPDATE partners SET contract_signed_at=?, contract_signed_by=?, contract_version=? WHERE id=?",
        args: [toLocalInput(new Date()), String(row.contact), CONTRACT_VERSION, session.partnerId],
      });
      // Exemplaire par e-mail après la réponse : n'allonge pas la signature, et son échec ne l'annule pas.
      const partnerId = session.partnerId;
      after(() => deliverPartnerCopy(client, partnerId));
      return null;
    }

    /* ---------- contrats clients ---------- */
    case "saveContract": {
      const f = contractFields(b);
      await requirePartnerRow(client, f.partnerId);
      // Prestation réalisée en direct : aucune commission à prélever.
      if (f.partnerId === SELF_ID) f.commissionRate = 0;
      const id = typeof b.id === "string" ? b.id : null;
      if (id) {
        await loadContract(client, id);
        await client.execute({
          sql: "UPDATE contracts SET partner_id=?, type=?, client_name=?, client_email=?, client_phone=?, address=?, service=?, price=?, commission_rate=?, frequency=?, notes=? WHERE id=?",
          args: [f.partnerId, f.type, f.clientName, f.clientEmail, f.clientPhone, f.address, f.service, f.price, f.commissionRate, f.frequency, f.notes, id],
        });
        after(() => syncContract(client, id)); // client, adresse ou partenaire peuvent avoir changé
        return { id };
      }
      const requestId = typeof b.requestId === "string" ? b.requestId : null;
      const req = requestId ? await one(client, "SELECT * FROM requests WHERE id = ? AND status = 'pending'", [requestId]) : null;
      if (requestId && !req) throw new ActionError("Cette inscription a déjà été traitée.");
      const sessions = generateSessions(
        datetime(b.firstDate, "La date"),
        f.frequency as Frequency | null,
        Math.round(num(b.count ?? 1, "Le nombre de séances", 1, 52)),
      );
      if (b.markPastDone === true) {
        const now = toLocalInput(new Date());
        for (const x of sessions) if (x.date <= now) x.status = "done";
      }
      const newId = uid("c");
      const stmts: InStatement[] = [
        {
          sql: "INSERT INTO contracts VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          args: [newId, f.partnerId, f.type, f.clientName, f.clientEmail, f.clientPhone, f.address, f.service, f.price, f.commissionRate, f.frequency, f.notes, todayISO(), req ? String(req.signed_at) : null, req ? String(req.signed_by) : null],
        },
        ...sessions.map((x): InStatement => ({ sql: "INSERT INTO sessions (id, contract_id, date, status, invoice_id) VALUES (?,?,?,?,?)", args: [x.id, newId, x.date, x.status, null] })),
      ];
      if (req) stmts.push({ sql: "UPDATE requests SET status='converted', contract_id=? WHERE id=?", args: [newId, String(req.id)] });
      await client.batch(stmts, "write");
      after(async () => {
        await syncContract(client, newId);
        if (req) await syncRequest(client, String(req.id)); // la demande est traitée : son événement « DEMANDE » disparaît
      });
      return { id: newId };
    }
    case "deleteContract": {
      const id = text(b.id, "Le contrat", { max: 80 });
      const eventIds = await collectEventIds(client, { sessions: "c.id = ?" }, [id]);
      await client.batch(
        [
          { sql: "DELETE FROM invoices WHERE contract_id = ?", args: [id] },
          { sql: "DELETE FROM sessions WHERE contract_id = ?", args: [id] },
          { sql: "UPDATE requests SET contract_id = NULL WHERE contract_id = ?", args: [id] },
          { sql: "DELETE FROM contracts WHERE id = ?", args: [id] },
        ],
        "write",
      );
      after(() => deleteEvents(eventIds));
      return null;
    }

    /* ---------- séances ---------- */
    case "addSession": {
      const contractId = text(b.contractId, "Le contrat", { max: 80 });
      await loadContract(client, contractId);
      const sessionId = uid("s");
      await client.execute({ sql: "INSERT INTO sessions (id, contract_id, date, status, invoice_id) VALUES (?,?,?,?,?)", args: [sessionId, contractId, datetime(b.date, "La date"), "planned", null] });
      after(() => syncSessions(client, [sessionId]));
      return null;
    }
    case "setSessionStatus": {
      const status = oneOf(b.status, "Le statut", ["planned", "done", "cancelled"] as const);
      const row = await one(
        client,
        "SELECT s.id, s.invoice_id, c.partner_id FROM sessions s JOIN contracts c ON c.id = s.contract_id WHERE s.id = ?",
        [text(b.sessionId, "La séance", { max: 80 })],
      );
      if (!row) throw new ActionError("Séance introuvable.", 404);
      if (session.role === "partner" && (row.partner_id !== session.partnerId || status === "planned")) {
        throw new ActionError("Accès refusé.", 403);
      }
      if (row.invoice_id) throw new ActionError("Cette séance est déjà facturée.");
      await client.execute({ sql: "UPDATE sessions SET status = ? WHERE id = ?", args: [status, String(row.id)] });
      const sessionId = String(row.id);
      after(() => syncSessions(client, [sessionId])); // annulée : événement supprimé ; réalisée : marqué ✅
      return null;
    }
    case "removeSession": {
      const sessionId = text(b.sessionId, "La séance", { max: 80 });
      const eventIds = await collectEventIds(client, { sessions: "s.id = ? AND s.invoice_id IS NULL" }, [sessionId]);
      await client.execute({ sql: "DELETE FROM sessions WHERE id = ? AND invoice_id IS NULL", args: [sessionId] });
      after(() => deleteEvents(eventIds));
      return null;
    }

    /* ---------- facturation ---------- */
    case "invoiceContract": {
      const contract = await loadContract(client, text(b.contractId, "Le contrat", { max: 80 }));
      const todo = billableSessions(contract);
      if (todo.length === 0) throw new ActionError("Aucune séance réalisée à facturer.");
      const { gross, commission, net } = splitAmount(todo.length * contract.price, contract.commissionRate);
      const issuedAt = todayISO();
      const id = uid("i");
      // Numéro = plus grand numéro de l'année + 1 (jamais le nombre de factures : une suppression créerait un doublon).
      const last = await one(client, "SELECT MAX(CAST(SUBSTR(number, 8) AS INTEGER)) AS n FROM invoices WHERE number LIKE ?", [`F-${issuedAt.slice(0, 4)}-%`]);
      const number = `F-${issuedAt.slice(0, 4)}-${String(Number(last?.n ?? 0) + 1).padStart(4, "0")}`;
      const stmts: InStatement[] = [
        { sql: "INSERT INTO invoices VALUES (?,?,?,?,?,?,?,?,?,?,?)", args: [id, number, contract.id, contract.partnerId, issuedAt, addDaysISO(issuedAt, 14), gross, commission, net, null, null] },
        ...todo.map((x: Session): InStatement => ({ sql: "UPDATE sessions SET invoice_id = ? WHERE id = ? AND invoice_id IS NULL", args: [id, x.id] })),
      ];
      await client.batch(stmts, "write");
      return { id };
    }
    case "markClientPaid": {
      const id = text(b.id, "La facture", { max: 80 });
      await client.execute({ sql: "UPDATE invoices SET client_paid_at = COALESCE(client_paid_at, ?) WHERE id = ?", args: [todayISO(), id] });
      // Facture « Moi-même » : il n'y a personne à reverser, elle est soldée à l'encaissement.
      await client.execute({ sql: "UPDATE invoices SET payout_at = COALESCE(payout_at, ?) WHERE id = ? AND partner_id = ?", args: [todayISO(), id, SELF_ID] });
      return null;
    }
    case "markPayout": {
      await client.execute({
        sql: "UPDATE invoices SET payout_at = COALESCE(payout_at, ?) WHERE id = ? AND client_paid_at IS NOT NULL",
        args: [todayISO(), text(b.id, "La facture", { max: 80 })],
      });
      return null;
    }

    /* ---------- inscriptions clients ---------- */
    case "declineRequest": {
      const id = text(b.id, "L'inscription", { max: 80 });
      await client.execute({ sql: "UPDATE requests SET status='declined' WHERE id = ? AND status = 'pending'", args: [id] });
      after(() => syncRequest(client, id)); // refusée : plus d'événement « DEMANDE »
      return null;
    }
    case "deleteRequest": {
      const id = text(b.id, "L'inscription", { max: 80 });
      const eventIds = await collectEventIds(client, { requests: "id = ?" }, [id]);
      await client.execute({ sql: "DELETE FROM requests WHERE id = ?", args: [id] });
      after(() => deleteEvents(eventIds));
      return null;
    }
    case "syncCalendar": {
      const res = await syncAll(client);
      if (!res.ok) throw new ActionError(`Synchronisation impossible : ${res.reason}`, 502);
      return { events: res.events };
    }
    case "resendPartnerContract": {
      const res = await deliverPartnerCopy(client, text(b.id, "Le partenaire", { max: 80 }));
      if (!res.ok) throw new ActionError(`Envoi impossible : ${res.reason}`, 502);
      return null;
    }
    case "resendRequestContract": {
      const res = await deliverRequestCopy(client, text(b.id, "L'inscription", { max: 80 }));
      if (!res.ok) throw new ActionError(`Envoi impossible : ${res.reason}`, 502);
      return null;
    }
    default:
      throw new ActionError("Action inconnue.", 404);
  }
}
