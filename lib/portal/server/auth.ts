import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { PortalSession } from "../types";

const COOKIE = "apolo_portal";
const MAX_AGE = 60 * 60 * 12; // 12 h

function secret() {
  const s = process.env.PORTAL_SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("PORTAL_SESSION_SECRET (32 caractères minimum) est requis.");
  return "dev-only-secret-do-not-use-in-production-0000";
}

export function adminCredentials() {
  const email = process.env.PORTAL_ADMIN_EMAIL;
  const password = process.env.PORTAL_ADMIN_PASSWORD;
  if (email && password) return { email: email.toLowerCase(), password };
  if (process.env.NODE_ENV === "production") return null; // pas d'admin par défaut en production
  return { email: "admin@apolodogtraining.com", password: "admin-demo" };
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/* ---- mots de passe : scrypt + sel aléatoire ---- */
const scryptAsync = (pw: string, salt: Buffer) =>
  new Promise<Buffer>((res, rej) => scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k))));

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return `${salt.toString("base64url")}:${(await scryptAsync(pw, salt)).toString("base64url")}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [s, h] = stored.split(":");
  if (!s || !h) return false;
  return safeEqual((await scryptAsync(pw, Buffer.from(s, "base64url"))).toString("base64url"), h);
}

export const tempPassword = () => `Apolo-${randomBytes(6).toString("base64url")}`;

/* ---- cookie de session signé (HttpOnly) ---- */
export async function startSession(session: PortalSession) {
  const payload = Buffer.from(JSON.stringify({ ...session, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function readSession(): Promise<PortalSession | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as PortalSession & { exp: number };
    if (!(data.exp > Date.now())) return null;
    return data.role === "admin" ? { role: "admin" } : { role: "partner", partnerId: String(data.partnerId) };
  } catch {
    return null;
  }
}
