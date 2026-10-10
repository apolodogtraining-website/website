import { site } from "@/lib/site";
import { esc } from "./contract-html";

const longDate = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });
const timeFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** Enveloppe commune des e-mails simples : titre, paragraphes, encadré facultatif. */
function wrap(title: string, firstName: string, paragraphs: string[], box?: string[]) {
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;padding:24px;background:#f3f7f9;color:#16232c;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d5e6ed;border-radius:14px;padding:28px">
    <p style="margin:0 0 4px;color:#1985b4;font-weight:bold;font-size:13px;letter-spacing:.04em;text-transform:uppercase">${esc(site.name)}</p>
    <h1 style="margin:0 0 16px;font-size:22px">${esc(title)}</h1>
    <p style="margin:0 0 12px">Bonjour ${esc(firstName)},</p>
    ${paragraphs.map((l) => `<p style="margin:0 0 12px">${esc(l)}</p>`).join("\n    ")}
    ${box ? `<div style="margin:16px 0;padding:14px 16px;border:1px solid #d5e6ed;border-radius:10px;background:#f3f7f9">${box.map((l) => esc(l)).join("<br>")}</div>` : ""}
    <p style="margin:22px 0 0;color:#5c6f7a;font-size:12px">${esc(site.name)} · ${esc(site.email)} · ${esc(site.phone)}</p>
  </div>
</body></html>`;
  const text = `Bonjour ${firstName},\n\n${paragraphs.join("\n\n")}${box ? `\n\n${box.join("\n")}` : ""}\n\n${site.name}\n${site.email} · ${site.phone}`;
  return { html, text };
}

type Reminder = {
  firstName: string;
  /** « YYYY-MM-DDTHH:mm » (heure de Paris). */
  date: string;
  service: string;
  address: string;
  dogs: string[];
  partner: { company: string; contact: string; phone: string } | null;
};

/** Rappel de rendez-vous, la veille de la séance. */
export function sessionReminderEmail(r: Reminder) {
  const d = new Date(`${r.date}:00`);
  const when = `${longDate.format(d)} à ${timeFmt.format(d)}`;
  const who = r.partner ? `${r.partner.company} (${r.partner.contact}${r.partner.phone ? `, ${r.partner.phone}` : ""})` : site.legal.publisherFullName;
  const { html, text } = wrap(
    "Rappel de votre rendez-vous",
    r.firstName,
    [
      "Petit rappel : votre séance a lieu demain.",
      "En cas d'empêchement, répondez simplement à ce message ou appelez-nous au plus vite. Merci de prévoir laisse, friandises, eau et une tenue adaptée à la météo.",
    ],
    [`Quand : ${when}`, `Prestation : ${r.service}${r.dogs.length ? ` — ${r.dogs.join(", ")}` : ""}`, `Où : ${r.address}`, `Avec : ${who}`],
  );
  return { subject: "Rappel : votre séance demain — Apolo Dog Training", html, text };
}

type Overdue = { firstName: string; number: string; amount: number; issuedAt: string; dueAt: string };

const day = (iso: string) => longDate.format(new Date(`${iso.slice(0, 10)}T12:00`));

/** Relance de paiement d'une facture échue. */
export function invoiceReminderEmail(o: Overdue) {
  const { html, text } = wrap(
    "Facture en attente de règlement",
    o.firstName,
    [
      "Sauf erreur de notre part, la facture ci-dessous n'a pas encore été réglée. Si vous l'avez payée depuis, merci de ne pas tenir compte de ce message.",
      "Vous pouvez régler par virement, chèque ou espèces. N'hésitez pas à nous contacter pour toute question.",
    ],
    [`Facture : ${o.number}`, `Montant : ${eur.format(o.amount)}`, `Émise le ${day(o.issuedAt)} · échéance le ${day(o.dueAt)}`],
  );
  return { subject: `Facture ${o.number} en attente de règlement — Apolo Dog Training`, html, text };
}
