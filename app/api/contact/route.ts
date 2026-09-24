import { site } from "@/lib/site";
import {
  LIMITS,
  SITUATIONS,
  isEmail,
  validateContact,
  type ContactInput,
} from "@/lib/contact";

// Limite de fréquence par IP. En mémoire donc par instance serverless : un
// garde-fou contre l'envoi en rafale, pas une protection absolue.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

// Un humain ne remplit pas le formulaire en moins de 2 s ; un robot, si.
const MIN_FILL_MS = 2000;
const MAX_BODY_BYTES = 10_000;

function tooManyRequests(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    return (
      host === req.headers.get("host") ||
      host === site.altHost ||
      host === new URL(site.url).host
    );
  } catch {
    return false;
  }
}

const line = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";

const block = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\r/g, "").trim().slice(0, max) : "";

function buildEmail(input: ContactInput): { subject: string; text: string } {
  const dog = [input.dogName, input.dogInfo].filter(Boolean).join(" — ");
  const subject = `Demande de ${input.firstName}${input.dogName ? ` (chien : ${input.dogName})` : ""}`;
  const text = [
    "Nouvelle demande via le formulaire du site",
    "",
    `Prénom : ${input.firstName}`,
    `Contact : ${input.contact}`,
    `Chien : ${dog || "non précisé"}`,
    `Situation : ${input.situations.join(", ") || "non précisée"}`,
    "",
    "Message :",
    input.message,
  ].join("\n");
  return { subject, text };
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "forbidden" }, { status: 403 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (tooManyRequests(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "too_large" }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // Robot probable (champ piège rempli, ou envoi instantané) : on répond
  // « ok » sans rien envoyer, pour ne pas lui dire ce qui l'a trahi.
  const trapped = typeof body.website === "string" && body.website !== "";
  const tooFast = typeof body.elapsed === "number" && body.elapsed < MIN_FILL_MS;
  if (trapped || tooFast) return Response.json({ ok: true });

  const situations = Array.isArray(body.situations)
    ? body.situations.filter(
        (s): s is string => typeof s === "string" && (SITUATIONS as readonly string[]).includes(s)
      )
    : [];

  const input: ContactInput = {
    firstName: line(body.firstName, LIMITS.firstName),
    contact: line(body.contact, LIMITS.contact),
    dogName: line(body.dogName, LIMITS.dogName),
    dogInfo: line(body.dogInfo, LIMITS.dogInfo),
    situations,
    message: block(body.message, LIMITS.message),
    consent: body.consent === true,
  };

  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "invalid", errors }, { status: 422 });
  }

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  const webhookSecret = process.env.CONTACT_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    console.error("[contact] CONTACT_WEBHOOK_URL / CONTACT_WEBHOOK_SECRET manquantes : message non envoyé");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const { subject, text } = buildEmail(input);
  try {
    // Google Apps Script répond à un POST par une redirection 302 vers l'URL
    // du résultat : fetch la suit (redirect: "follow", par défaut).
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret,
        subject,
        text,
        ...(isEmail(input.contact) ? { replyTo: input.contact } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    // Un déploiement mal configuré renvoie une page HTML avec un statut 200 :
    // seul un JSON `{ ok: true }` compte comme un envoi réussi.
    const result = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || result?.ok !== true) {
      console.error(`[contact] le script Google n'a pas confirmé l'envoi (HTTP ${res.status})`);
      return Response.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] envoi impossible", err instanceof Error ? err.name : "erreur");
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
