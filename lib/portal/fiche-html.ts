import { site } from "@/lib/site";
import { esc } from "./contract-html";
import { FICHE_SECTIONS, type FicheAnswers, type FieldDef } from "./fiche";
import { fmtPhone } from "./format";

const BRAND = "#2aa9e1";
const BRAND_DARK = "#0e5f82";
const INK = "#16232c";
const SOFT = "#5c6f7a";
const TINT = "#f3f7f9";
const LINE = "#d5e6ed";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });
const fmtDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
};
const sexLabel = (s: string) => (s === "M" ? "Mâle" : s === "F" ? "Femelle" : "");

type Dog = { name: string; breed: string; sex: string; age: string; chip: string };
type Owner = { name: string; phone: string; email: string; address: string };

const multiline = (s: string) => esc(s).replace(/\n/g, "<br>");

/** Valeur lisible d'un champ, ou null s'il n'est pas renseigné. */
function valueHtml(f: FieldDef, a: FicheAnswers): string | null {
  const v = a[f.key];
  const detail = typeof a[`${f.key}__detail`] === "string" ? (a[`${f.key}__detail`] as string) : "";
  const extra = detail ? `<div style="margin-top:3px;color:${SOFT};font-style:italic">${multiline(detail)}</div>` : "";
  switch (f.type) {
    case "yesno":
      if (v !== "oui" && v !== "non") return null;
      return `<strong style="color:${v === "oui" ? BRAND_DARK : SOFT}">${v === "oui" ? "Oui" : "Non"}</strong>${extra}`;
    case "multi":
      return Array.isArray(v) && v.length ? `${esc(v.join(", "))}${extra}` : null;
    case "date":
      return typeof v === "string" && v ? esc(fmtDay(v)) : null;
    case "number":
      return typeof v === "string" && v ? `${esc(v)}${f.suffix ? ` ${esc(f.suffix)}` : ""}` : null;
    default:
      return typeof v === "string" && v ? `${multiline(v)}${f.type === "choice" ? extra : ""}` : null;
  }
}

/**
 * Fiche d'étude complétée, en HTML autonome (styles en ligne) : source du PDF joint à l'e-mail.
 * Seules les questions renseignées sont reproduites, regroupées comme dans le document papier.
 */
export function ficheDocumentHtml(d: { dog: Dog; owner: Owner; answers: FicheAnswers }) {
  const info = (rows: [string, string][]) =>
    rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:${SOFT};white-space:nowrap">${esc(k)}</td><td style="padding:2px 0">${esc(v)}</td></tr>`)
      .join("");

  const sections = FICHE_SECTIONS.map((s) => {
    const blocks = s.blocks
      .map((b) => {
        const rows = b.fields
          .map((f) => ({ f, html: valueHtml(f, d.answers) }))
          .filter((x): x is { f: FieldDef; html: string } => x.html !== null)
          .map(
            ({ f, html }) =>
              `<tr><td style="padding:6px 14px 6px 0;vertical-align:top;width:42%;color:${INK};border-bottom:1px solid ${LINE}">${esc(f.label)}</td><td style="padding:6px 0;vertical-align:top;border-bottom:1px solid ${LINE}">${html}</td></tr>`,
          )
          .join("");
        if (!rows) return "";
        return `${b.title ? `<h3 style="margin:14px 0 4px;font-size:13px;color:${INK}">${esc(b.title)}</h3>` : ""}<table style="width:100%;border-collapse:collapse;font-size:13px">${rows}</table>`;
      })
      .join("");
    if (!blocks) return "";
    return `<h2 style="margin:26px 0 4px;font-size:16px;letter-spacing:.04em;text-transform:uppercase;color:${BRAND};page-break-after:avoid">${esc(s.title)}</h2>${blocks}`;
  }).join("");

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Étude de comportement — ${esc(d.dog.name)}</title></head>
<body style="margin:0;padding:28px;background:#ffffff;color:${INK};font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5">
  <div style="max-width:700px;margin:0 auto">
    <p style="margin:0;color:${SOFT};font-size:11px;font-style:italic">APOLO — DOG TRAINING</p>
    <h1 style="margin:10px 0 18px;text-align:center;font-size:24px;letter-spacing:.03em;color:${BRAND}">ÉTUDE DE COMPORTEMENT</h1>
    <table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tr>
      <td style="vertical-align:top;width:50%;padding-right:12px">
        <div style="font-size:11px;font-weight:bold;text-transform:uppercase;color:${SOFT};margin-bottom:4px">Propriétaire</div>
        <table style="font-size:13px">${info([["Nom", d.owner.name], ["Téléphone", d.owner.phone ? fmtPhone(d.owner.phone) : ""], ["E-mail", d.owner.email], ["Adresse", d.owner.address]])}</table>
      </td>
      <td style="vertical-align:top;width:50%">
        <div style="font-size:11px;font-weight:bold;text-transform:uppercase;color:${SOFT};margin-bottom:4px">Chien</div>
        <table style="font-size:13px">${info([["Nom", d.dog.name], ["Race", d.dog.breed], ["Sexe", sexLabel(d.dog.sex)], ["Âge", d.dog.age], ["N° de puce", d.dog.chip]])}</table>
      </td>
    </tr></table>
    ${sections}
    <p style="margin:30px 0 0;padding-top:12px;border-top:1px solid ${LINE};color:${SOFT};font-size:11px">
      ${esc(site.name)} · ${esc(site.email)} · ${esc(site.phone)} — Document confidentiel, remis au propriétaire du chien.
    </p>
  </div>
</body></html>`;
}

/** E-mail d'accompagnement (corps du message), prêt pour les messageries : tableaux et styles en ligne. */
export function ficheEmail(d: { firstName: string; dogName: string; answers: FicheAnswers; senderLabel: string }) {
  const a = d.answers;
  const observations = typeof a.observations === "string" ? a.observations : "";
  const solutions = Array.isArray(a.solutions) ? (a.solutions as string[]) : [];
  const sessions = typeof a.seancesPreconisees === "string" ? a.seancesPreconisees : "";
  const excerpt = observations.length > 420 ? `${observations.slice(0, 420).trimEnd()}…` : observations;
  const hello = d.firstName ? `Bonjour ${esc(d.firstName)},` : "Bonjour,";

  const highlights = [
    solutions.length
      ? `<tr><td style="padding:6px 0;color:${SOFT};width:150px;vertical-align:top">Pistes de travail</td><td style="padding:6px 0;color:${INK}"><strong>${esc(solutions.join(" · "))}</strong></td></tr>`
      : "",
    sessions
      ? `<tr><td style="padding:6px 0;color:${SOFT};width:150px;vertical-align:top">Séances préconisées</td><td style="padding:6px 0;color:${INK}"><strong>${esc(sessions)}</strong></td></tr>`
      : "",
  ].join("");

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${TINT};font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TINT};padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${LINE}">
    <tr><td style="background:${BRAND};padding:22px 28px">
      <img src="${esc(site.url)}/logo/logo-white.png" alt="${esc(site.name)}" height="40" style="display:block;height:40px;width:auto;border:0">
    </td></tr>
    <tr><td style="padding:30px 28px 8px">
      <p style="margin:0 0 6px;color:${BRAND_DARK};font-size:12px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase">Étude de comportement</p>
      <h1 style="margin:0 0 18px;color:${INK};font-size:24px;line-height:1.25">L&rsquo;étude de ${esc(d.dogName)} est prête</h1>
      <p style="margin:0 0 14px;color:${INK};font-size:15px;line-height:1.6">${hello}</p>
      <p style="margin:0 0 14px;color:${INK};font-size:15px;line-height:1.6">
        Vous trouverez en pièce jointe l&rsquo;<strong>étude de comportement de ${esc(d.dogName)}</strong>, réalisée avec vous par ${esc(d.senderLabel)}.
        Elle rassemble ce que nous avons observé et les pistes de travail que nous vous proposons.
      </p>
    </td></tr>
    ${
      excerpt || highlights
        ? `<tr><td style="padding:6px 28px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TINT};border-radius:12px"><tr><td style="padding:18px 20px">
            ${excerpt ? `<p style="margin:0 0 6px;color:${SOFT};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.05em">En bref</p><p style="margin:0 0 ${highlights ? "12" : "0"}px;color:${INK};font-size:14px;line-height:1.6">${multiline(excerpt)}</p>` : ""}
            ${highlights ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:${excerpt ? `1px solid ${LINE}` : "0"}">${highlights}</table>` : ""}
          </td></tr></table></td></tr>`
        : ""
    }
    <tr><td style="padding:18px 28px 6px">
      <p style="margin:0 0 18px;color:${INK};font-size:15px;line-height:1.6">
        Une question, une précision à ajouter ? Répondez simplement à ce message ou appelez-nous : nous serons ravis d&rsquo;en parler avec vous.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="border-radius:999px;background:${BRAND}"><a href="mailto:${esc(site.email)}?subject=${encodeURIComponent(`Étude de comportement de ${d.dogName}`)}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none">Nous répondre</a></td>
        <td style="padding-left:14px;color:${INK};font-size:15px"><a href="tel:${esc(site.phoneIntl)}" style="color:${BRAND_DARK};text-decoration:none;font-weight:bold">${esc(site.phone)}</a></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:26px 28px 30px">
      <p style="margin:0;color:${INK};font-size:15px;line-height:1.6">À très bientôt,<br><strong>${esc(site.name)}</strong></p>
    </td></tr>
    <tr><td style="background:${TINT};padding:16px 28px;border-top:1px solid ${LINE}">
      <p style="margin:0;color:${SOFT};font-size:11px;line-height:1.5">
        Ce message et son document joint sont confidentiels et destinés au propriétaire de ${esc(d.dogName)}.
        ${esc(site.legal.publisherLegalName)} · SIRET ${esc(site.siret)} · ${esc(site.address.locality)}
      </p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = [
    d.firstName ? `Bonjour ${d.firstName},` : "Bonjour,",
    "",
    `Vous trouverez en pièce jointe l'étude de comportement de ${d.dogName}, réalisée avec vous par ${d.senderLabel}.`,
    solutions.length ? `Pistes de travail : ${solutions.join(" · ")}.` : "",
    sessions ? `Séances préconisées : ${sessions}.` : "",
    "",
    `Une question ? Répondez à ce message ou appelez-nous au ${site.phone}.`,
    "",
    "À très bientôt,",
    site.name,
  ]
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n");

  return { subject: `Étude de comportement de ${d.dogName} — ${site.name}`, html, text };
}
