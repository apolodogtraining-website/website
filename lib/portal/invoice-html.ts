import { site } from "@/lib/site";
import { esc } from "./contract-html";
import { balanceDue, fmtDate, invoiceLines, invoicePayments, money } from "./format";
import { methodLabel } from "./payments";
import type { Contract, Invoice, Partner } from "./types";

/**
 * Facture destinée au client, en HTML autonome (styles en ligne) : source du PDF joint à l'e-mail.
 * Document CLIENT : aucune commission ni net partenaire, jamais. Tout texte saisi est échappé.
 */
export function invoiceDocumentHtml(inv: Invoice, contract: Contract, partner: Pick<Partner, "company" | "siret" | "isSelf"> | undefined) {
  const lines = invoiceLines(inv, contract);
  const payments = invoicePayments(inv);
  const due = balanceDue(inv);
  const cell = "padding:8px 0;border-bottom:1px solid #d5e6ed";
  const row = (cols: string[], bold = false) =>
    `<tr>${cols.map((c, i) => `<td style="${cell};${i === cols.length - 1 ? "text-align:right;white-space:nowrap;" : ""}${bold ? "font-weight:bold;" : ""}">${c}</td>`).join("")}</tr>`;

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Facture ${esc(inv.number)}</title></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#16232c;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55">
  <div style="max-width:680px;margin:0 auto">
    <table role="presentation" style="width:100%;border-collapse:collapse"><tr>
      <td style="vertical-align:top">
        <p style="margin:0 0 4px;color:#1985b4;font-weight:bold;font-size:13px;letter-spacing:.04em;text-transform:uppercase">${esc(site.name)}</p>
        <p style="margin:0;color:#5c6f7a;font-size:13px">${esc(site.legal.publisherLegalName)}<br>${esc(site.address.street)}, ${esc(site.address.postalCode)} ${esc(site.address.locality)}<br>SIRET ${esc(site.siret)}</p>
      </td>
      <td style="vertical-align:top;text-align:right">
        <h1 style="margin:0 0 6px;font-size:22px">Facture ${esc(inv.number)}</h1>
        <p style="margin:0;color:#5c6f7a;font-size:13px">Émise le ${esc(fmtDate(inv.issuedAt))}<br>Échéance : ${esc(fmtDate(inv.dueAt))}</p>
      </td>
    </tr></table>

    <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:24px"><tr>
      <td style="vertical-align:top;width:50%">
        <p style="margin:0 0 2px;color:#5c6f7a;font-size:11px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase">Facturé à</p>
        <p style="margin:0"><strong>${esc(contract.clientName)}</strong><br>${esc(contract.address)}${contract.clientEmail ? `<br>${esc(contract.clientEmail)}` : ""}</p>
      </td>
      <td style="vertical-align:top;width:50%">
        <p style="margin:0 0 2px;color:#5c6f7a;font-size:11px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase">Prestation réalisée par</p>
        <p style="margin:0"><strong>${esc(partner?.isSelf ? site.name : (partner?.company ?? site.name))}</strong><br>SIRET ${esc(partner?.isSelf ? site.siret : (partner?.siret ?? site.siret))}</p>
      </td>
    </tr></table>

    <table style="width:100%;border-collapse:collapse;margin-top:24px">
      <tr style="color:#5c6f7a;font-size:11px;text-transform:uppercase;letter-spacing:.04em">
        <th style="text-align:left;padding:8px 0;border-bottom:1px solid #d5e6ed">Prestation</th>
        <th style="text-align:left;padding:8px 12px;border-bottom:1px solid #d5e6ed">Détail</th>
        <th style="text-align:right;padding:8px 0;border-bottom:1px solid #d5e6ed">Montant</th>
      </tr>
      ${lines.map((l) => `<tr><td style="${cell}">${esc(l.label)}</td><td style="${cell};padding-left:12px;color:#5c6f7a">${esc(l.detail)}</td><td style="${cell};text-align:right;white-space:nowrap">${esc(money(l.amount))}</td></tr>`).join("\n      ")}
    </table>

    <table style="width:100%;border-collapse:collapse;margin-top:8px">
      ${row([payments.length ? "Total de la facture" : "Total à payer", esc(money(inv.gross))], true)}
      ${payments
        .map((p) => row([`Règlement reçu le ${esc(fmtDate(p.paidAt))}${methodLabel(p.method) ? ` · ${esc(methodLabel(p.method))}` : ""}`, `− ${esc(money(p.amount))}`]))
        .join("\n      ")}
      ${payments.length ? row([due > 0 ? "Reste à payer" : "Solde", esc(money(due))], true) : ""}
    </table>

    <p style="margin:18px 0 0;color:#5c6f7a;font-size:12px">TVA non applicable (article 293 B du CGI). Pénalités de retard et indemnité forfaitaire de recouvrement de 40 € applicables en cas de retard de paiement.<br>${esc(site.email)} · ${esc(site.phone)}</p>
  </div>
</body></html>`;
}
