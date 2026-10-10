import { site } from "@/lib/site";

export type MailResult = { ok: true } | { ok: false; reason: string };

type Mail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Nom du PDF généré à partir du HTML et joint au message. */
  pdfName: string;
};

/**
 * Envoi via un Google Apps Script déployé en application Web (gratuit, expédie
 * depuis le compte Gmail du propriétaire) : voir google-apps-script/portal-mailer.gs.
 * Sans configuration, rien n'est envoyé et l'appelant en est informé.
 */
export async function sendMail(mail: Mail): Promise<MailResult> {
  const url = process.env.PORTAL_MAIL_WEBHOOK_URL;
  const secret = process.env.PORTAL_MAIL_WEBHOOK_SECRET;
  if (!url || !secret) return { ok: false, reason: "L'envoi d'e-mails n'est pas configuré." };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // évite le préflight CORS d'Apps Script
      body: JSON.stringify({ secret, ...mail, bcc: site.email, replyTo: site.email }),
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const out = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !out?.ok) return { ok: false, reason: out?.error ?? `Le service d'envoi a répondu ${res.status}.` };
    return { ok: true };
  } catch (e) {
    console.error("[portail] mail", e);
    return { ok: false, reason: "Le service d'envoi est injoignable." };
  }
}
