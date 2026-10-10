import { site } from "@/lib/site";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });
const fmtSigned = (local: string) => dateFmt.format(new Date(local));

type Doc = {
  title: string;
  articles: { title: string; body: string }[];
  signedBy: string;
  signedAt: string;
  version: string;
};

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
    ${d.articles
      .map(
        (a) => `<h2 style="margin:18px 0 4px;font-size:15px">${esc(a.title)}</h2><p style="margin:0;color:#34454f">${esc(a.body)}</p>`,
      )
      .join("\n    ")}
    <div style="margin-top:28px;padding:14px 16px;border:1px solid #d5e6ed;border-radius:10px;background:#f3f7f9">
      <strong>Signé par ${esc(d.signedBy)}</strong><br>le ${esc(fmtSigned(d.signedAt))}
    </div>
    <p style="margin-top:22px;color:#5c6f7a;font-size:12px">
      ${esc(site.legal.publisherLegalName)} · SIRET ${esc(site.siret)} · ${esc(site.address.street)}, ${esc(site.address.postalCode)} ${esc(site.address.locality)}<br>
      ${esc(site.email)} · ${esc(site.phone)}
    </p>
  </div>
</body></html>`;
}

export const mailIntro = (hello: string, what: string) =>
  `Bonjour ${hello},\n\nVous trouverez ci-joint votre exemplaire ${what}, au format PDF. Il est aussi reproduit ci-dessous.\n\nConservez-le : il fait foi des conditions acceptées.\n\n${site.name}\n${site.email} · ${site.phone}`;
