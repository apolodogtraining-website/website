import { db } from "@/lib/portal/server/db";
import { getFiche, saveFiche } from "@/lib/portal/server/fiches";
import { currentSession, handleError, json, readBody, sameOrigin } from "@/lib/portal/server/http";

/** Lecture d'une étude de comportement : GET /api/portal/fiche?dogId=… */
export async function GET(req: Request) {
  try {
    const session = await currentSession();
    if (!session) return json({ error: "Session expirée. Reconnectez-vous." }, 401);
    const dogId = new URL(req.url).searchParams.get("dogId") ?? "";
    return json(await getFiche(await db(), session, dogId));
  } catch (e) {
    return handleError(e);
  }
}

/** Enregistrement (brouillon ou terminé). Sans rafraîchir tout le portail : appelé à chaque sauvegarde auto. */
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
    const session = await currentSession();
    if (!session) return json({ error: "Session expirée. Reconnectez-vous." }, 401);
    const b = await readBody(req);
    const res = await saveFiche(await db(), session, {
      dogId: typeof b.dogId === "string" ? b.dogId : "",
      answers: b.answers,
      status: b.status,
      baseUpdatedAt: b.baseUpdatedAt,
    });
    return json(res);
  } catch (e) {
    return handleError(e);
  }
}
