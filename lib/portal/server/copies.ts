import type { Client } from "@libsql/client";
import { clientContractArticles, contractArticles, CLIENT_CONTRACT_VERSION, CONTRACT_VERSION } from "../contract-text";
import { contractDocumentHtml, mailIntro } from "../contract-html";
import { toLocalInput } from "../format";
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
  });
  const res = await sendMail({
    to: String(row.email),
    subject: "Votre contrat de prestation — Apolo Dog Training",
    text: mailIntro(String(row.name), "du contrat de prestation"),
    html,
    pdfName: "Contrat-prestation-Apolo-Dog-Training.pdf",
  });
  if (res.ok) await client.execute({ sql: "UPDATE requests SET copy_sent_at = ? WHERE id = ?", args: [toLocalInput(new Date()), requestId] });
  return res;
}
