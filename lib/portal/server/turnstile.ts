import { ActionError } from "./actions";

// Clé secrète de test publiée par Cloudflare : valide toujours le défi. Uniquement hors production.
const DEV_SECRET = "1x0000000000000000000000000000000AA";

/**
 * Vérifie le jeton Cloudflare Turnstile renvoyé par le navigateur. En
 * production sans clé secrète, on refuse (fail closed) plutôt que de laisser
 * le formulaire public sans protection.
 */
export async function verifyTurnstile(token: unknown, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY ?? (process.env.NODE_ENV === "production" ? "" : DEV_SECRET);
  if (!secret) throw new ActionError("Les inscriptions sont momentanément indisponibles.", 503);
  if (typeof token !== "string" || !token || token.length > 2048) throw new ActionError("Vérification anti-robot manquante.");

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const out = (await res.json().catch(() => ({}))) as { success?: boolean };
  if (!res.ok || !out.success) throw new ActionError("La vérification anti-robot a échoué. Rechargez la page et réessayez.");
}
