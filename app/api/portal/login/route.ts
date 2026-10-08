import { hashPassword, startSession, verifyPassword } from "@/lib/portal/server/auth";
import { db } from "@/lib/portal/server/db";
import { dataFor, handleError, json, readBody, sameOrigin } from "@/lib/portal/server/http";
import type { PortalSession } from "@/lib/portal/types";

// Limite les essais par e-mail + IP (en mémoire : suffisant contre le bourrage simple ;
// pour une vraie protection distribuée, passer par un stockage partagé).
const attempts = new Map<string, { n: number; until: number }>();
const MAX = 6;
const WINDOW = 15 * 60 * 1000;

// Hash factice pour que la durée de réponse ne révèle pas si l'e-mail existe.
let dummy: Promise<string> | null = null;

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
    const body = await readBody(req);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
    const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
    const key = `${email}|${req.headers.get("x-forwarded-for") ?? "local"}`;

    const now = Date.now();
    const rec = attempts.get(key);
    if (rec && rec.until > now && rec.n >= MAX) return json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, 429);

    // Mot de passe : partenaires uniquement. L'administrateur passe exclusivement par Google.
    let session: PortalSession | null = null;
    const client = await db();
    const res = await client.execute({ sql: "SELECT id, password_hash, active FROM partners WHERE email = ? AND is_self = 0", args: [email] });
    const row = res.rows[0];
    const ok = await verifyPassword(password, row ? String(row.password_hash) : await (dummy ??= hashPassword("dummy")));
    if (row && ok && Number(row.active) === 1) session = { role: "partner", partnerId: String(row.id) };

    if (!session) {
      attempts.set(key, { n: (rec && rec.until > now ? rec.n : 0) + 1, until: now + WINDOW });
      return json({ error: "Identifiants incorrects ou compte suspendu." }, 401);
    }
    attempts.delete(key);
    await startSession(session);
    return json({ session, data: await dataFor(session) });
  } catch (e) {
    return handleError(e);
  }
}
