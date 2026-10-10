import { createHash, randomBytes } from "node:crypto";

const b64url = (b: Buffer) => b.toString("base64url");

export const newState = () => b64url(randomBytes(24));
export const newVerifier = () => b64url(randomBytes(48));
export const challengeFor = (verifier: string) => b64url(createHash("sha256").update(verifier).digest());

/** URL publique du site vue par le navigateur (Vercel passe par un proxy). Doit correspondre à l'URI enregistrée chez Google. */
export function origin(req: Request) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const redirectUri = (req: Request) => `${origin(req)}/api/portal/google/callback`;
