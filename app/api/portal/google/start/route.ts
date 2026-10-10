import { NextResponse } from "next/server";
import { googleConfig, setOauthCookie } from "@/lib/portal/server/auth";
import { challengeFor, newState, newVerifier, origin, redirectUri } from "@/lib/portal/server/oauth";

export async function GET(req: Request) {
  const cfg = googleConfig();
  if (!cfg) return NextResponse.redirect(new URL("/portail?error=google_off", origin(req)));

  const state = newState();
  const verifier = newVerifier();
  await setOauthCookie(state, verifier);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: cfg.id,
    redirect_uri: redirectUri(req),
    response_type: "code",
    scope: "openid email",
    state,
    code_challenge: challengeFor(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return NextResponse.redirect(url);
}
