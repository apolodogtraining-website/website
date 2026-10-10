import { site } from "@/lib/site";
import { uid } from "../format";

export type MailResult = { ok: true } | { ok: false; reason: string };

type Mail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Si fourni : source du PDF joint, distincte du corps du mail (nécessite la version 2 du script). */
  pdfHtml?: string;
  /** Nom du PDF généré à partir du HTML et joint au message. */
  pdfName: string;
};

type Reply = { ok?: boolean; error?: string; v?: number };
const ATTEMPTS = 4;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Un appel au script Google. `null` = réponse illisible (page d'erreur HTML, redirection ratée…) :
 * Google le fait de temps en temps, y compris alors que la requête a bien été exécutée.
 */
async function call(url: string, body: unknown): Promise<{ status: number; out: Reply | null }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // évite le préflight CORS d'Apps Script
    body: JSON.stringify(body),
    redirect: "follow",
    signal: AbortSignal.timeout(25_000),
  });
  return { status: res.status, out: (await res.json().catch(() => null)) as Reply | null };
}

/** Réessaie tant que la réponse est illisible. Sans danger pour les sondes ; pour un envoi, uniquement avec un requestId. */
async function callWithRetry(url: string, body: unknown) {
  let last: { status: number; out: Reply | null } = { status: 0, out: null };
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      last = await call(url, body);
    } catch (e) {
      console.error("[portail] mail", e instanceof Error ? e.name : "erreur");
      last = { status: 0, out: null };
    }
    if (last.out) return last;
    if (i < ATTEMPTS - 1) await sleep(800);
  }
  return last;
}

/**
 * Envoi via un Google Apps Script déployé en application Web (gratuit, expédie
 * depuis le compte Gmail du propriétaire) : voir google-apps-script/portal-mailer.gs.
 * Sans configuration, rien n'est envoyé et l'appelant en est informé.
 *
 * Fiabilité : le service Google renvoie parfois une réponse illisible alors que le message est parti.
 * On commence donc par une sonde (aucun envoi) : si le script est à jour (v2), chaque envoi porte un
 * `requestId` que le script mémorise, et on peut réessayer sans risque de doublon. Avec l'ancien script
 * (sans requestId) on n'envoie qu'une fois, sans réessai.
 */
export async function sendMail(mail: Mail): Promise<MailResult> {
  const url = process.env.PORTAL_MAIL_WEBHOOK_URL;
  const secret = process.env.PORTAL_MAIL_WEBHOOK_SECRET;
  if (!url || !secret) return { ok: false, reason: "L'envoi d'e-mails n'est pas configuré." };

  const probe = await callWithRetry(url, { secret, ping: true });
  if (!probe.out) return { ok: false, reason: "Le service d'envoi est injoignable." };
  const safeToRetry = probe.out.ok === true && (probe.out.v ?? 1) >= 2;

  if (mail.pdfHtml && !safeToRetry) {
    // Un ancien script ignorerait pdfHtml et joindrait le corps du mail à la place du PDF.
    return { ok: false, reason: "Le script d'envoi Google doit être mis à jour (nouvelle version du script « Envoi des contrats »)." };
  }

  const payload = { secret, ...mail, bcc: site.email, replyTo: site.email, requestId: uid("m") };
  try {
    const { status, out } = safeToRetry ? await callWithRetry(url, payload) : await call(url, payload);
    if (out?.ok) return { ok: true };
    if (out) return { ok: false, reason: out.error ?? `Le service d'envoi a répondu ${status}.` };
    return { ok: false, reason: "Le service d'envoi n'a pas confirmé l'envoi : vérifiez la boîte d'envoi Gmail avant de réessayer." };
  } catch (e) {
    console.error("[portail] mail", e);
    return { ok: false, reason: "Le service d'envoi est injoignable." };
  }
}
