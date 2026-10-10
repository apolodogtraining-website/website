import type { Client, InValue } from "@libsql/client";
import { fmtPhone } from "../format";
import { site } from "@/lib/site";

/**
 * Synchronisation avec l'agenda Google « Apolo » via un Google Apps Script
 * (google-apps-script/portal-calendar.gs), même principe que l'envoi d'e-mails.
 *
 * Trois sortes d'événements, distinguées par un préfixe et une couleur :
 *  - DEMANDE  : inscription d'un client, pas encore affectée (à confirmer) — gris
 *  - MOI      : rendez-vous planifié que vous assurez vous-même ("Moi-même") — bleu
 *  - PARTENAIRE : rendez-vous planifié et confié à un partenaire — vert
 */

const DURATION_MIN = 60;

type Kind = "request" | "self" | "partner";
type Op =
  | { type: "upsert"; key: string; kind: Kind; title: string; start: string; durationMin: number; location: string; description: string; eventId?: string | null }
  | { type: "delete"; key: string; eventId: string };

export const calendarConfigured = () => Boolean(process.env.PORTAL_CALENDAR_WEBHOOK_URL && process.env.PORTAL_CALENDAR_WEBHOOK_SECRET);

type Pushed = { ok: true; results: Record<string, { eventId: string | null }>; errors: Record<string, string> } | { ok: false; reason: string };

async function push(ops: Op[]): Promise<Pushed> {
  const url = process.env.PORTAL_CALENDAR_WEBHOOK_URL;
  const secret = process.env.PORTAL_CALENDAR_WEBHOOK_SECRET;
  if (!url || !secret) return { ok: false, reason: "La synchronisation de l'agenda n'est pas configurée." };
  if (ops.length === 0) return { ok: true, results: {}, errors: {} };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // évite le préflight CORS d'Apps Script
      body: JSON.stringify({ secret, ops }),
      redirect: "follow",
      signal: AbortSignal.timeout(60_000),
    });
    const out = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; results?: Record<string, { eventId: string | null }>; errors?: Record<string, string> } | null;
    if (!res.ok || !out?.ok) return { ok: false, reason: out?.error === "forbidden" ? "secret refusé par le script de l'agenda" : (out?.error ?? `le script de l'agenda a répondu ${res.status}`) };
    return { ok: true, results: out.results ?? {}, errors: out.errors ?? {} };
  } catch (e) {
    console.error("[portail] agenda", e instanceof Error ? e.name : "erreur");
    return { ok: false, reason: "le script de l'agenda est injoignable" };
  }
}

const adminLink = (path: string) => `${site.url}/portail/admin/${path}`;
const lines = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join("\n");

const todayLocal = () => new Date().toISOString().slice(0, 10);

type SessionRow = {
  id: string;
  date: string;
  status: string;
  eventId: string | null;
  contractId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
  service: string;
  notes: string;
  partnerCompany: string;
  isSelf: boolean;
};

async function loadSessions(client: Client, where: string, args: InValue[]): Promise<SessionRow[]> {
  const r = await client.execute({
    sql: `SELECT s.id, s.date, s.status, s.calendar_event_id AS event_id, c.id AS contract_id, c.client_name, c.client_phone, c.client_email,
                 c.address, c.service, c.notes, p.company, p.is_self
          FROM sessions s JOIN contracts c ON c.id = s.contract_id JOIN partners p ON p.id = c.partner_id
          WHERE ${where}`,
    args,
  });
  return r.rows.map((x) => ({
    id: String(x.id),
    date: String(x.date),
    status: String(x.status),
    eventId: x.event_id ? String(x.event_id) : null,
    contractId: String(x.contract_id),
    clientName: String(x.client_name),
    clientPhone: String(x.client_phone ?? ""),
    clientEmail: String(x.client_email ?? ""),
    address: String(x.address),
    service: String(x.service),
    notes: String(x.notes ?? ""),
    partnerCompany: String(x.company),
    isSelf: Number(x.is_self) === 1,
  }));
}

/** Opération agenda d'une séance : planifiée = événement ; annulée = supprimé ; réalisée = conservé s'il existe (pas de recréation de l'historique). */
function sessionOp(s: SessionRow): Op | null {
  const key = `s:${s.id}`;
  if (s.status === "cancelled") return s.eventId ? { type: "delete", key, eventId: s.eventId } : null;
  if (s.status === "done" && !s.eventId) return null;
  const done = s.status === "done";
  const kind: Kind = s.isSelf ? "self" : "partner";
  const who = s.isSelf ? "" : `[${s.partnerCompany}] `;
  return {
    type: "upsert",
    key,
    kind,
    eventId: s.eventId,
    title: `${done ? "✅ " : ""}${who}${s.clientName} — ${s.service}`,
    start: s.date,
    durationMin: DURATION_MIN,
    location: s.address,
    description: lines(
      s.isSelf ? "Rendez-vous que vous assurez vous-même." : `Rendez-vous confié au partenaire : ${s.partnerCompany}.`,
      "",
      `Client : ${s.clientName}`,
      s.clientPhone && `Téléphone : ${fmtPhone(s.clientPhone)}`,
      s.clientEmail && `E-mail : ${s.clientEmail}`,
      `Adresse : ${s.address}`,
      s.notes && `Notes : ${s.notes}`,
      "",
      `Portail : ${adminLink(`contrats/${s.contractId}`)}`,
    ),
  };
}

type RequestRow = { id: string; status: string; eventId: string | null; name: string; phone: string; email: string; address: string; dog: string; service: string; type: string; preferred: string; notes: string };

async function loadRequests(client: Client, where: string, args: InValue[]): Promise<RequestRow[]> {
  const r = await client.execute({ sql: `SELECT * FROM requests WHERE ${where}`, args });
  return r.rows.map((x) => ({
    id: String(x.id),
    status: String(x.status),
    eventId: x.calendar_event_id ? String(x.calendar_event_id) : null,
    name: String(x.name),
    phone: String(x.phone),
    email: String(x.email),
    address: String(x.address),
    dog: [x.dog_name, x.dog_breed].filter(Boolean).join(" — "),
    service: String(x.service),
    type: String(x.type),
    preferred: String(x.preferred_date ?? ""),
    notes: String(x.notes ?? ""),
  }));
}

/** Une demande en attente avec une date souhaitée = événement « DEMANDE ». Traitée, refusée ou sans date = pas d'événement. */
function requestOp(r: RequestRow): Op | null {
  const key = `r:${r.id}`;
  if (r.status !== "pending" || !r.preferred) return r.eventId ? { type: "delete", key, eventId: r.eventId } : null;
  return {
    type: "upsert",
    key,
    kind: "request",
    eventId: r.eventId,
    title: `❓ DEMANDE à confirmer — ${r.name} (${r.service})`,
    start: r.preferred,
    durationMin: DURATION_MIN,
    location: r.address,
    description: lines(
      "Inscription en ligne : date souhaitée par le client, PAS ENCORE CONFIRMÉE ni affectée à un partenaire.",
      "",
      `Client : ${r.name}`,
      `Téléphone : ${fmtPhone(r.phone)}`,
      `E-mail : ${r.email}`,
      `Adresse : ${r.address}`,
      r.dog && `Chien : ${r.dog}`,
      `Souhait : ${r.type === "recurring" ? "suivi régulier" : "séance ponctuelle"}`,
      r.notes && `Précisions : ${r.notes}`,
      "",
      `À traiter : ${adminLink("inscriptions")}`,
    ),
  };
}

async function apply(client: Client, ops: Op[]): Promise<Pushed> {
  const res = await push(ops);
  if (!res.ok) return res;
  const stmts = ops.flatMap((op) => {
    const [kind, id] = op.key.split(":");
    const table = kind === "s" ? "sessions" : "requests";
    const r = res.results[op.key];
    if (!r || res.errors[op.key]) return [];
    return [{ sql: `UPDATE ${table} SET calendar_event_id = ? WHERE id = ?`, args: [r.eventId, id] }];
  });
  if (stmts.length) await client.batch(stmts, "write");
  return res;
}

const swallow = (label: string) => (e: unknown) => console.error(`[portail] agenda ${label}`, e instanceof Error ? e.message : e);

/** Synchronise des séances précises (créées, modifiées, annulées). Ne lève jamais. */
export async function syncSessions(client: Client, sessionIds: string[]) {
  if (!calendarConfigured() || sessionIds.length === 0) return;
  try {
    const rows = await loadSessions(client, `s.id IN (${sessionIds.map(() => "?").join(",")})`, sessionIds);
    await apply(client, rows.map(sessionOp).filter((o): o is Op => Boolean(o)));
  } catch (e) {
    swallow("séances")(e);
  }
}

export const syncContract = async (client: Client, contractId: string) => {
  if (!calendarConfigured()) return;
  try {
    const rows = await loadSessions(client, "c.id = ?", [contractId]);
    await apply(client, rows.map(sessionOp).filter((o): o is Op => Boolean(o)));
  } catch (e) {
    swallow("contrat")(e);
  }
};

export const syncPartner = async (client: Client, partnerId: string) => {
  if (!calendarConfigured()) return;
  try {
    const rows = await loadSessions(client, "p.id = ?", [partnerId]);
    await apply(client, rows.map(sessionOp).filter((o): o is Op => Boolean(o)));
  } catch (e) {
    swallow("partenaire")(e);
  }
};

export const syncRequest = async (client: Client, requestId: string) => {
  if (!calendarConfigured()) return;
  try {
    const rows = await loadRequests(client, "id = ?", [requestId]);
    await apply(client, rows.map(requestOp).filter((o): o is Op => Boolean(o)));
  } catch (e) {
    swallow("demande")(e);
  }
};

/** À appeler AVANT de supprimer les lignes : renvoie les événements à retirer de l'agenda. */
export async function collectEventIds(client: Client, where: { sessions?: string; requests?: string }, args: InValue[]) {
  if (!calendarConfigured()) return [] as string[];
  const out: string[] = [];
  if (where.sessions) {
    const r = await client.execute({ sql: `SELECT s.calendar_event_id AS id FROM sessions s JOIN contracts c ON c.id = s.contract_id WHERE ${where.sessions}`, args });
    out.push(...r.rows.filter((x) => x.id).map((x) => String(x.id)));
  }
  if (where.requests) {
    const r = await client.execute({ sql: `SELECT calendar_event_id AS id FROM requests WHERE ${where.requests}`, args });
    out.push(...r.rows.filter((x) => x.id).map((x) => String(x.id)));
  }
  return out;
}

export async function deleteEvents(eventIds: string[]) {
  if (!calendarConfigured() || eventIds.length === 0) return;
  await push(eventIds.map((eventId, i) => ({ type: "delete" as const, key: `d:${i}`, eventId }))).catch(swallow("suppression"));
}

/** Réconciliation complète (bouton admin) : rattrape l'existant et corrige les écarts. */
export async function syncAll(client: Client): Promise<{ ok: true; events: number } | { ok: false; reason: string }> {
  if (!calendarConfigured()) return { ok: false, reason: "La synchronisation de l'agenda n'est pas configurée." };
  const [sessions, requests] = await Promise.all([loadSessions(client, "1 = 1", []), loadRequests(client, "1 = 1", [])]);
  const today = todayLocal();
  // Séances passées sans événement : on n'invente pas l'historique (déjà géré par sessionOp), on borne en plus le volume.
  const ops = [...sessions.filter((s) => s.date.slice(0, 10) >= today || s.eventId).map(sessionOp), ...requests.map(requestOp)].filter((o): o is Op => Boolean(o));
  let events = 0;
  for (let i = 0; i < ops.length; i += 100) {
    const res = await apply(client, ops.slice(i, i + 100));
    if (!res.ok) return res;
    events += Object.values(res.results).filter((r) => r.eventId).length;
  }
  return { ok: true, events };
}
