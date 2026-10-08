import { NextResponse } from "next/server";
import { startSession } from "@/lib/portal/server/auth";
import { origin } from "@/lib/portal/server/oauth";

/** Raccourci administrateur pour le développement local uniquement (inexistant en production). */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  await startSession({ role: "admin" });
  return NextResponse.redirect(new URL("/portail/admin", origin(req)));
}
