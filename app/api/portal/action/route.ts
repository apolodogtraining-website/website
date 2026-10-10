import { runAction } from "@/lib/portal/server/actions";
import { db } from "@/lib/portal/server/db";
import { currentSession, dataFor, handleError, json, readBody, sameOrigin } from "@/lib/portal/server/http";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
    const session = await currentSession();
    if (!session) return json({ error: "Session expirée. Reconnectez-vous." }, 401);
    // « action » et non « type » : les champs métier (ex. type de contrat) portent déjà ce nom.
    const { action, ...payload } = await readBody(req);
    const result = await runAction(await db(), session, String(action), payload);
    return json({ result, data: await dataFor(session) });
  } catch (e) {
    return handleError(e);
  }
}
