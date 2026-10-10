import type { Client } from "@libsql/client";
import { clientContractArticles, contractArticles, CLIENT_CONTRACT_VERSION, CONTRACT_VERSION } from "../contract-text";
import { acceptanceEmail, contractDocumentHtml, mailIntro } from "../contract-html";
import { fmtDateTime, toLocalInput } from "../format";
import { type MailResult, sendMail } from "./mailer";

/**
 * Envoie au partenaire son exemplaire signé du contrat de partenariat et note
 * la date d'envoi. Ne lève jamais : la signature ne doit pas échouer parce que
 * l'e-mail échoue ; l'administrateur voit l'état et peut renvoyer.
 */
export async function deliverPartnerCopy(client: Client, partnerId: string): Promise<MailResult> {
  const row = (await client.execute({ sql: "SELECT * FROM partners WHERE id = ? AND is_self = 0", args: [partnerId] })).rows[0];
  if (!row || !row.contract_signed_at) return { ok: false, reason: "Contrat non signé." };

  const html = contractDocumentHtml({
    title: "Contrat de partenariat",
    articles: contractArticles({
      company: String(row.company),
      contact: String(row.contact),
      siret: String(row.siret),
      commissionRate: Number(row.commission_rate),
    }),
    signedBy: String(row.contract_signed_by),
    signedAt: String(row.contract_signed_at),
    version: String(row.contract_version ?? CONTRACT_VERSION),
  });
  const res = await sendMail({
    to: String(row.email),
    subject: "Votre exemplaire du contrat de partenariat — Apolo Dog Training",
    text: mailIntro(String(row.contact), "du contrat de partenariat"),
    html,
    pdfName: "Contrat-partenariat-Apolo-Dog-Training.pdf",
  });
  if (res.ok) await client.execute({ sql: "UPDATE partners SET copy_sent_at = ? WHERE id = ?", args: [toLocalInput(new Date()), partnerId] });
  return res;
}

/** Idem pour un client inscrit en ligne : son exemplaire du contrat de prestation. */
export async function deliverRequestCopy(client: Client, requestId: string): Promise<MailResult> {
  const row = (await client.execute({ sql: "SELECT * FROM requests WHERE id = ?", args: [requestId] })).rows[0];
  if (!row) return { ok: false, reason: "Inscription introuvable." };

  const html = contractDocumentHtml({
    title: "Contrat de prestation",
    articles: clientContractArticles({ name: String(row.name), service: String(row.service) }),
    signedBy: String(row.signed_by),
    signedAt: String(row.signed_at),
    version: String(row.contract_version ?? CLIENT_CONTRACT_VERSION),
    notice: row.early_start_at
      ? `Le Client a expressément demandé, le ${fmtDateTime(String(row.early_start_at))}, que la prestation commence avant la fin du délai de rétractation de 14 jours ; s'il se rétracte, il règle les séances déjà réalisées.`
      : "Le Client n'a pas demandé de début de prestation avant la fin du délai de rétractation de 14 jours.",
  });
  const res = await sendMail({
    to: String(row.email),
    subject: "Votre contrat de prestation — Apolo Dog Training",
    text: mailIntro(String(row.first_name || row.name), "du contrat de prestation"),
    html,
    pdfName: "Contrat-prestation-Apolo-Dog-Training.pdf",
  });
  if (res.ok) await client.execute({ sql: "UPDATE requests SET copy_sent_at = ? WHERE id = ?", args: [toLocalInput(new Date()), requestId] });
  return res;
}

/**
 * À la validation de l'inscription d'un client : e-mail (sans pièce jointe) qui confirme que le contrat est
 * accepté, avec l'éducateur et la première séance. Ne lève jamais ; un échec n'annule pas la validation.
 */
export async function deliverAcceptance(client: Client, contractId: string): Promise<MailResult> {
  const c = (await client.execute({ sql: "SELECT c.*, p.company, p.contact, p.phone AS partner_phone, p.is_self FROM contracts c JOIN partners p ON p.id = c.partner_id WHERE c.id = ?", args: [contractId] })).rows[0];
  if (!c) return { ok: false, reason: "Contrat introuvable." };
  const email = String(c.client_email ?? "");
  if (!email) return { ok: false, reason: "Le client n'a pas d'adresse e-mail." };
  const dogs = (await client.execute({ sql: "SELECT name FROM dogs WHERE contract_id = ? ORDER BY created_at, id", args: [contractId] })).rows.map((r) => String(r.name));
  const first = (await client.execute({ sql: "SELECT date FROM sessions WHERE contract_id = ? AND status = 'planned' ORDER BY date LIMIT 1", args: [contractId] })).rows[0];
  const { text, html } = acceptanceEmail({
    firstName: String(c.client_first_name || c.client_name),
    service: String(c.service),
    dogs,
    partner: Number(c.is_self) ? null : { company: String(c.company), contact: String(c.contact), phone: String(c.partner_phone ?? "") },
    firstDate: first ? String(first.date) : null,
  });
  return sendMail({ to: email, subject: "Votre contrat est accepté — Apolo Dog Training", text, html });
}
