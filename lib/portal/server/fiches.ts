import type { Client } from "@libsql/client";
import { FICHE_FIELDS, type FicheAnswers, type FicheStatus, answeredCount, sanitizeAnswers } from "../fiche";
import { ficheDocumentHtml, ficheEmail } from "../fiche-html";
import type { PortalSession } from "../types";
import { ActionError } from "./actions";
import { site } from "@/lib/site";
import { sendMail } from "./mailer";

/**
 * Droits d'accès aux chiens et aux études de comportement :
 *  - l'administrateur voit tout ;
 *  - un partenaire n'accède qu'aux contrats qui lui sont affectés, ET seulement
 *    s'il a signé son contrat de partenariat.
 * Ces fiches contiennent des données de santé de l'animal et des informations
 * personnelles : aucune autre voie d'accès n'existe (pas d'espace client).
 */
export async function assertContractAccess(client: Client, session: PortalSession, contractId: string) {
  const row = (
    await client.execute({
      sql: `SELECT c.id, c.partner_id, c.client_name, c.client_first_name, c.client_phone, c.client_email, c.address, p.contract_signed_at, p.active
            FROM contracts c JOIN partners p ON p.id = c.partner_id WHERE c.id = ?`,
      args: [contractId],
    })
  ).rows[0];
  if (!row) throw new ActionError("Contrat introuvable.", 404);
  if (session.role === "partner") {
    if (row.partner_id !== session.partnerId) throw new ActionError("Accès refusé.", 403);
    if (!row.contract_signed_at || Number(row.active) !== 1) throw new ActionError("Accès refusé.", 403);
  }
  return {
    contractId: String(row.id),
    client: {
      name: String(row.client_name),
      firstName: String(row.client_first_name ?? ""),
      phone: String(row.client_phone ?? ""),
      email: String(row.client_email ?? ""),
      address: String(row.address ?? ""),
    },
  };
}

async function dogWithAccess(client: Client, session: PortalSession, dogId: string) {
  const dog = (await client.execute({ sql: "SELECT * FROM dogs WHERE id = ?", args: [dogId] })).rows[0];
  if (!dog) throw new ActionError("Chien introuvable.", 404);
  const access = await assertContractAccess(client, session, String(dog.contract_id));
  return { dog, ...access };
}

const author = async (client: Client, session: PortalSession) => {
  if (session.role === "admin") return "Administrateur";
  const r = (await client.execute({ sql: "SELECT company FROM partners WHERE id = ?", args: [session.partnerId] })).rows[0];
  return r ? String(r.company) : "Partenaire";
};

export type FicheView = {
  dog: { id: string; name: string; breed: string; sex: string; age: string; chip: string };
  owner: { name: string; phone: string; email: string; address: string };
  answers: FicheAnswers;
  status: FicheStatus;
  updatedAt: string | null;
  updatedBy: string | null;
  lastSentAt: string | null;
  lastSentTo: string | null;
};

export async function getFiche(client: Client, session: PortalSession, dogId: string): Promise<FicheView> {
  const { dog, client: owner } = await dogWithAccess(client, session, dogId);
  const f = (await client.execute({ sql: "SELECT * FROM fiches WHERE dog_id = ?", args: [dogId] })).rows[0];
  let answers: FicheAnswers = {};
  if (f) {
    try {
      answers = sanitizeAnswers(JSON.parse(String(f.data)));
    } catch {
      /* fiche illisible : on repart d'une fiche vide plutôt que de bloquer l'écran */
    }
  }
  return {
    dog: { id: String(dog.id), name: String(dog.name), breed: String(dog.breed), sex: String(dog.sex), age: String(dog.age), chip: String(dog.chip) },
    owner: { name: owner.name, phone: owner.phone, email: owner.email, address: owner.address },
    answers,
    status: f ? (String(f.status) as FicheStatus) : "draft",
    updatedAt: f ? String(f.updated_at) : null,
    updatedBy: f ? String(f.updated_by) : null,
    lastSentAt: f?.last_sent_at ? String(f.last_sent_at) : null,
    lastSentTo: f?.last_sent_to ? String(f.last_sent_to) : null,
  };
}

/**
 * Enregistre la fiche. `baseUpdatedAt` = version que l'utilisateur a ouverte :
 * si quelqu'un d'autre a enregistré entre-temps, on refuse plutôt que d'écraser.
 */
export async function saveFiche(
  client: Client,
  session: PortalSession,
  input: { dogId: string; answers: unknown; status: unknown; baseUpdatedAt: unknown },
) {
  await dogWithAccess(client, session, input.dogId);
  const status: FicheStatus = input.status === "completed" ? "completed" : "draft";
  const current = (await client.execute({ sql: "SELECT updated_at, updated_by FROM fiches WHERE dog_id = ?", args: [input.dogId] })).rows[0];
  const base = typeof input.baseUpdatedAt === "string" ? input.baseUpdatedAt : null;
  if (current && String(current.updated_at) !== base) {
    throw new ActionError(`Cette fiche a été modifiée entre-temps par ${String(current.updated_by)}. Rechargez la page pour récupérer ses changements.`, 409);
  }
  const answers = sanitizeAnswers(input.answers);
  const updatedAt = new Date().toISOString();
  const by = await author(client, session);
  await client.execute({
    sql: `INSERT INTO fiches (dog_id, data, status, updated_at, updated_by) VALUES (?,?,?,?,?)
          ON CONFLICT(dog_id) DO UPDATE SET data = excluded.data, status = excluded.status, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    args: [input.dogId, JSON.stringify(answers), status, updatedAt, by],
  });
  return { updatedAt, updatedBy: by, status, fields: FICHE_FIELDS.length };
}

const MIN_RESEND_MS = 30_000;
const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "chien";

/**
 * Envoie au client son étude de comportement : e-mail soigné + PDF de la fiche telle qu'enregistrée.
 * Même contrôle d'accès que la lecture ; le gérant reçoit une copie cachée (journal de ce qui part).
 */
export async function sendFicheByEmail(client: Client, session: PortalSession, dogId: string) {
  const { dog, client: owner } = await dogWithAccess(client, session, dogId);
  const to = owner.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new ActionError("Ce client n'a pas d'adresse e-mail valide : ajoutez-la dans sa fiche contrat.");
  }
  const f = (await client.execute({ sql: "SELECT * FROM fiches WHERE dog_id = ?", args: [dogId] })).rows[0];
  if (!f) throw new ActionError("La fiche est vide : remplissez-la avant de l'envoyer.");
  let answers: FicheAnswers = {};
  try {
    answers = sanitizeAnswers(JSON.parse(String(f.data)));
  } catch {
    throw new ActionError("La fiche est illisible.");
  }
  // « date » est préremplie : une fiche qui n'a que cette réponse est considérée comme vide.
  if (answeredCount(answers) - (answers.date ? 1 : 0) < 1) throw new ActionError("La fiche est vide : remplissez-la avant de l'envoyer.");

  const last = f.last_sent_at ? Date.parse(String(f.last_sent_at)) : 0;
  if (Date.now() - last < MIN_RESEND_MS) throw new ActionError("Cette fiche vient d'être envoyée. Patientez quelques secondes avant de la renvoyer.");

  const dogInfo = { name: String(dog.name), breed: String(dog.breed), sex: String(dog.sex), age: String(dog.age), chip: String(dog.chip) };
  const senderLabel = session.role === "admin" ? site.name : `${await author(client, session)} pour ${site.name}`;
  const mail = ficheEmail({ firstName: owner.firstName, dogName: dogInfo.name, answers, senderLabel });
  const res = await sendMail({
    to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    pdfHtml: ficheDocumentHtml({ dog: dogInfo, owner, answers }),
    pdfName: `Etude-de-comportement-${slug(dogInfo.name)}.pdf`,
  });
  if (!res.ok) throw new ActionError(`Envoi impossible : ${res.reason}`, 502);

  const sentAt = new Date().toISOString();
  await client.execute({ sql: "UPDATE fiches SET last_sent_at = ?, last_sent_to = ? WHERE dog_id = ?", args: [sentAt, to, dogId] });
  return { sentTo: to, sentAt };
}
