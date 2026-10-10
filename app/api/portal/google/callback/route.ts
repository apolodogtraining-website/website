import { NextResponse } from "next/server";
import { adminEmails, googleConfig, startSession, takeOauthCookie } from "@/lib/portal/server/auth";
import { db } from "@/lib/portal/server/db";
import { origin, redirectUri } from "@/lib/portal/server/oauth";
import type { PortalSession } from "@/lib/portal/types";

const back = (req: Request, error: string) => NextResponse.redirect(new URL(`/portail?error=${error}`, origin(req)));

export async function GET(req: Request) {
  try {
    const cfg = googleConfig();
    const params = new URL(req.url).searchParams;
    const saved = await takeOauthCookie();
    if (!cfg) return back(req, "google_off");
    // Refus côté Google (l'utilisateur a annulé) ou état incohérent : on ne va pas plus loin.
    if (params.get("error")) return back(req, "google_cancel");
    const code = params.get("code");
    if (!code || !saved || params.get("state") !== saved.state) return back(req, "google_state");

    // Échange du code contre un jeton, directement avec Google en TLS : le id_token reçu ici est de confiance.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: cfg.id,
        client_secret: cfg.secret,
        redirect_uri: redirectUri(req),
        grant_type: "authorization_code",
        code_verifier: saved.verifier,
      }),
    });
    if (!tokenRes.ok) return back(req, "google_token");
    const { id_token } = (await tokenRes.json()) as { id_token?: string };
    const claims = id_token ? JSON.parse(Buffer.from(id_token.split(".")[1] ?? "", "base64url").toString()) : null;

    const validIssuer = claims && (claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com");
    if (!validIssuer || claims.aud !== cfg.id || !(claims.exp * 1000 > Date.now()) || claims.email_verified !== true || typeof claims.email !== "string") {
      return back(req, "google_token");
    }
    const email = claims.email.toLowerCase();

    // Google prouve l'identité ; l'autorisation reste celle du portail (aucun compte n'est créé ici).
    let session: PortalSession | null = null;
    if (adminEmails().includes(email)) {
      session = { role: "admin" };
    } else {
      const res = await (await db()).execute({ sql: "SELECT id, active FROM partners WHERE email = ? AND is_self = 0", args: [email] });
      const row = res.rows[0];
      if (row && Number(row.active) === 1) session = { role: "partner", partnerId: String(row.id) };
    }
    if (!session) return back(req, "google_denied");

    await startSession(session);
    return NextResponse.redirect(new URL(session.role === "admin" ? "/portail/admin" : "/portail/partenaire", origin(req)));
  } catch (e) {
    console.error("[portail] google", e);
    return back(req, "google_token");
  }
}
