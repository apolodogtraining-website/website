import { NextResponse } from "next/server";
import { ActionError } from "./actions";
import { readSession } from "./auth";
import { db } from "./db";
import { snapshot } from "./repo";
import type { PortalSession } from "../types";

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Refuse les requêtes d'écriture venant d'un autre site (défense CSRF en plus de SameSite=Lax). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Session valide ET toujours autorisée : un partenaire supprimé ou suspendu est déconnecté immédiatement. */
export async function currentSession(): Promise<PortalSession | null> {
  const session = await readSession();
  if (!session || session.role === "admin") return session;
  const client = await db();
  const row = await client.execute({ sql: "SELECT active FROM partners WHERE id = ?", args: [session.partnerId] });
  return row.rows[0] && Number(row.rows[0].active) === 1 ? session : null;
}

export async function dataFor(session: PortalSession) {
  return snapshot(await db(), session);
}

export function handleError(e: unknown) {
  if (e instanceof ActionError) return json({ error: e.message }, e.status);
  console.error("[portail]", e);
  return json({ error: "Une erreur est survenue. Réessayez dans un instant." }, 500);
}
