import { after } from "next/server";
import { CLIENT_CONTRACT_VERSION } from "@/lib/portal/contract-text";
import { toLocalInput, uid } from "@/lib/portal/format";
import { ActionError } from "@/lib/portal/server/actions";
import { deliverRequestCopy } from "@/lib/portal/server/copies";
import { db } from "@/lib/portal/server/db";
import { handleError, json, readBody, sameOrigin } from "@/lib/portal/server/http";
import { verifyTurnstile } from "@/lib/portal/server/turnstile";
import { services } from "@/lib/site";

const str = (v: unknown, label: string, max: number, required = true) => {
  const x = typeof v === "string" ? v.trim() : "";
  if (required && !x) throw new ActionError(`${label} est requis.`);
  if (x.length > max) throw new ActionError(`${label} est trop long.`);
  return x;
};

// Anti-abus simple : au plus 5 inscriptions par IP et par heure (en mémoire).
const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
    const b = await readBody(req);
    // Champ piège invisible pour les humains : un robot le remplit, on fait semblant d'accepter.
    if (typeof b.website === "string" && b.website) return json({ ok: true });

    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000);
    if (recent.length >= 5) return json({ error: "Trop de demandes. Réessayez plus tard." }, 429);
    hits.set(ip, [...recent, now]);

    // Défi anti-robot vérifié côté serveur avant tout traitement.
    await verifyTurnstile(b.turnstileToken, req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null);

    const name = str(b.name, "Le nom", 120);
    const email = str(b.email, "L'e-mail", 200).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ActionError("L'e-mail est invalide.");
    const service = str(b.service, "La prestation", 200);
    if (!services.some((s) => s.title === service)) throw new ActionError("La prestation est invalide.");
    const type = b.type === "recurring" ? "recurring" : "oneoff";
    const preferred = str(b.preferredDate, "La date", 16, false);
    if (preferred && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(preferred)) throw new ActionError("La date est invalide.");
    // La signature doit reprendre le nom saisi : même règle que l'interface.
    if (str(b.signedBy, "La signature", 120).toLowerCase() !== name.toLowerCase()) throw new ActionError("La signature ne correspond pas au nom.");

    const client = await db();
    const pending = await client.execute("SELECT COUNT(*) AS n FROM requests WHERE status = 'pending'");
    if (Number(pending.rows[0].n) >= 500) throw new ActionError("Les inscriptions sont momentanément fermées.", 503);

    const signedAt = toLocalInput(new Date());
    const requestId = uid("r");
    await client.execute({
      sql: "INSERT INTO requests (id, created_at, name, email, phone, address, dog_name, dog_breed, service, type, preferred_date, notes, signed_at, signed_by, contract_version, status, contract_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      args: [requestId, signedAt, name, email, str(b.phone, "Le téléphone", 40), str(b.address, "L'adresse", 300), str(b.dogName, "Le nom du chien", 80), str(b.dogBreed, "La race", 120, false), service, type, preferred, str(b.notes, "Les précisions", 1000, false), signedAt, name, CLIENT_CONTRACT_VERSION, "pending", null],
    });
    // Exemplaire du contrat par e-mail, après la réponse : un échec n'annule pas l'inscription (l'admin peut renvoyer).
    after(() => deliverRequestCopy(client, requestId));
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
