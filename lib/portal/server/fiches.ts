import type { Client } from "@libsql/client";
import { FICHE_FIELDS, type FicheAnswers, type FicheStatus, sanitizeAnswers } from "../fiche";
import type { PortalSession } from "../types";
import { ActionError } from "./actions";

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
      sql: `SELECT c.id, c.partner_id, c.client_name, c.client_phone, c.client_email, c.address, p.contract_signed_at, p.active
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
    owner,
    answers,
    status: f ? (String(f.status) as FicheStatus) : "draft",
    updatedAt: f ? String(f.updated_at) : null,
    updatedBy: f ? String(f.updated_by) : null,
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
