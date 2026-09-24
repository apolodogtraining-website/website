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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY manquante : message non envoyé");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const { subject, text } = buildEmail(input);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || `${site.name} <onboarding@resend.dev>`,
        to: [process.env.CONTACT_TO_EMAIL || site.email],
        ...(isEmail(input.contact) ? { reply_to: input.contact } : {}),
        subject,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[contact] Resend a répondu ${res.status}`);
      return Response.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] envoi impossible", err instanceof Error ? err.name : "erreur");
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
