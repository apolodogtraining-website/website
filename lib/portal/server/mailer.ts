import { site } from "@/lib/site";

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

/**
 * Envoi via un Google Apps Script déployé en application Web (gratuit, expédie
 * depuis le compte Gmail du propriétaire) : voir google-apps-script/portal-mailer.gs.
 * Sans configuration, rien n'est envoyé et l'appelant en est informé.
 */
async function call(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // évite le préflight CORS d'Apps Script
    body: JSON.stringify(body),
    redirect: "follow",
    signal: AbortSignal.timeout(25_000),
  });
  const out = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; v?: number } | null;
  return { res, out };
}

export async function sendMail(mail: Mail): Promise<MailResult> {
  const url = process.env.PORTAL_MAIL_WEBHOOK_URL;
  const secret = process.env.PORTAL_MAIL_WEBHOOK_SECRET;
  if (!url || !secret) return { ok: false, reason: "L'envoi d'e-mails n'est pas configuré." };

  try {
    if (mail.pdfHtml) {
      // Un ancien script ignorerait pdfHtml et joindrait le corps du mail à la place du PDF :
      // on s'assure d'abord qu'il est à jour (la sonde ne déclenche aucun envoi).
      const { out } = await call(url, { secret, ping: true });
      if (!out?.ok || (out.v ?? 1) < 2) {
        return { ok: false, reason: "Le script d'envoi Google doit être mis à jour (nouvelle version du script « Envoi des contrats »)." };
      }
    }
    const { res, out } = await call(url, { secret, ...mail, bcc: site.email, replyTo: site.email });
    if (!res.ok || !out?.ok) return { ok: false, reason: out?.error ?? `Le service d'envoi a répondu ${res.status}.` };
    return { ok: true };
  } catch (e) {
    console.error("[portail] mail", e);
    return { ok: false, reason: "Le service d'envoi est injoignable." };
  }
}
