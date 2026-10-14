import { site } from "@/lib/site";
import type { ContractArticle } from "./contract-text";

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });
const fmtSigned = (local: string) => dateFmt.format(new Date(local));

type Doc = {
  title: string;
  articles: ContractArticle[];
  signedBy: string;
  signedAt: string;
  version: string;
  /** Mention complémentaire consignée dans l'exemplaire (ex. demande expresse de début anticipé). */
  notice?: string;
};

/** Un article en HTML ; tableau de tarifs et note d'astérisque en option. Styles en ligne (e-mail + PDF). */
function articleHtml(a: ContractArticle) {
  const items = a.items?.length
    ? `<table role="presentation" style="width:100%;border-collapse:collapse;margin:8px 0 0;color:#34454f">${a.items
        .map(
          (i) =>
            `<tr><td style="padding:6px 0;border-bottom:1px solid #d5e6ed">${esc(i.label)}</td><td style="padding:6px 0 6px 12px;border-bottom:1px solid #d5e6ed;text-align:right;white-space:nowrap;font-weight:bold">${esc(i.price)}</td></tr>`,
        )
        .join("")}</table>`
    : "";
  const note = a.note ? `<p style="margin:8px 0 0;color:#5c6f7a;font-size:12px">${esc(a.note)}</p>` : "";
  return `<h2 style="margin:18px 0 4px;font-size:15px">${esc(a.title)}</h2><p style="margin:0;color:#34454f">${esc(a.body)}</p>${items}${note}`;
}

/**
 * Exemplaire signé d'un contrat, en HTML autonome (styles en ligne) : sert à la
 * fois de corps d'e-mail et de source pour le PDF joint. Tout texte saisi par
 * un utilisateur est échappé.
 */
export function contractDocumentHtml(d: Doc) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${esc(d.title)}</title></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#16232c;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55">
  <div style="max-width:680px;margin:0 auto">
    <p style="margin:0 0 4px;color:#1985b4;font-weight:bold;font-size:13px;letter-spacing:.04em;text-transform:uppercase">${esc(site.name)}</p>
    <h1 style="margin:0 0 6px;font-size:22px">${esc(d.title)}</h1>
    <p style="margin:0 0 22px;color:#5c6f7a">Version ${esc(d.version)} · exemplaire signé électroniquement</p>
    ${d.articles.map(articleHtml).join("\n    ")}
    <div style="margin-top:28px;padding:14px 16px;border:1px solid #d5e6ed;border-radius:10px;background:#f3f7f9">
      <strong>Signé par ${esc(d.signedBy)}</strong><br>le ${esc(fmtSigned(d.signedAt))}
    </div>
    ${d.notice ? `<p style="margin:14px 0 0;color:#34454f">${esc(d.notice)}</p>` : ""}
    <p style="margin-top:22px;color:#5c6f7a;font-size:12px">
      ${esc(site.legal.publisherLegalName)} · SIRET ${esc(site.siret)} · ${esc(site.address.street)}, ${esc(site.address.postalCode)} ${esc(site.address.locality)}<br>
      ${esc(site.email)} · ${esc(site.phone)}
    </p>
  </div>
</body></html>`;
}

export const mailIntro = (hello: string, what: string) =>
  `Bonjour ${hello},\n\nVous trouverez ci-joint votre exemplaire ${what}, au format PDF. Il est aussi reproduit ci-dessous.\n\nConservez-le : il fait foi des conditions acceptées.\n\n${site.name}\n${site.email} · ${site.phone}`;

type Acceptance = {
  firstName: string;
  service: string;
  dogs: string[];
  /** Éducateur qui interviendra (null = Apolo lui-même). */
  partner: { company: string; contact: string; phone: string } | null;
  firstDate: string | null;
};

/** Corps de l'e-mail « votre contrat est accepté » envoyé au client à la validation de son dossier (sans pièce jointe). */
export function acceptanceEmail(a: Acceptance) {
  const who = a.partner
    ? `Votre séance sera assurée par ${a.partner.company} (${a.partner.contact}${a.partner.phone ? `, ${a.partner.phone}` : ""}), éducateur partenaire d'${site.name}.`
    : `Vos séances seront assurées par ${site.legal.publisherFullName}, ${site.name}.`;
  const when = a.firstDate ? `Votre première séance est prévue le ${fmtSigned(a.firstDate)}.` : "Nous vous contactons très vite pour convenir des dates.";
  const dogs = a.dogs.length ? ` pour ${a.dogs.join(", ")}` : "";
  const lines = [`Nous avons bien accepté votre contrat : ${a.service}${dogs}.`, when, who];
  const text = `Bonjour ${a.firstName},\n\n${lines.join("\n\n")}\n\nVotre exemplaire signé vous a déjà été envoyé à l'inscription. Une question ? Répondez simplement à ce message.\n\n${site.name}\n${site.email} · ${site.phone}`;
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Votre contrat est accepté</title></head>
<body style="margin:0;padding:24px;background:#f3f7f9;color:#16232c;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d5e6ed;border-radius:14px;padding:28px">
    <p style="margin:0 0 4px;color:#1985b4;font-weight:bold;font-size:13px;letter-spacing:.04em;text-transform:uppercase">${esc(site.name)}</p>
    <h1 style="margin:0 0 16px;font-size:22px">Votre contrat est accepté</h1>
    <p style="margin:0 0 12px">Bonjour ${esc(a.firstName)},</p>
    ${lines.map((l) => `<p style="margin:0 0 12px">${esc(l)}</p>`).join("\n    ")}
    <p style="margin:18px 0 0;color:#5c6f7a;font-size:13px">Votre exemplaire signé vous a déjà été envoyé à l'inscription. Une question ? Répondez simplement à ce message.</p>
    <p style="margin:22px 0 0;color:#5c6f7a;font-size:12px">${esc(site.name)} · ${esc(site.email)} · ${esc(site.phone)}</p>
  </div>
</body></html>`;
  return { text, html };
}
