import { db } from "@/lib/portal/server/db";
import { sendFicheByEmail } from "@/lib/portal/server/fiches";
import { currentSession, handleError, json, readBody, sameOrigin } from "@/lib/portal/server/http";

/** Envoie l'étude de comportement (PDF joint) à l'adresse e-mail du client. Mêmes droits que la fiche elle-même. */
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
    const session = await currentSession();
    if (!session) return json({ error: "Session expirée. Reconnectez-vous." }, 401);
    const b = await readBody(req);
    return json(await sendFicheByEmail(await db(), session, typeof b.dogId === "string" ? b.dogId : ""));
  } catch (e) {
    return handleError(e);
  }
}
