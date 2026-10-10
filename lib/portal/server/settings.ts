import type { Client } from "@libsql/client";
import { DEFAULT_SETTINGS, type PortalSettings } from "../settings";

/** Réglages enregistrés (clé → JSON), complétés par les valeurs par défaut. */
export async function getSettings(client: Client): Promise<PortalSettings> {
  const rows = (await client.execute("SELECT key, value FROM settings")).rows;
  const out: PortalSettings = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    try {
      const v = JSON.parse(String(r.value));
      const k = String(r.key) as keyof PortalSettings;
      if (k === "agendaView") {
        if (v === "week" || v === "list") out.agendaView = v;
      } else if (k in DEFAULT_SETTINGS && typeof v === "boolean") {
        (out as Record<string, unknown>)[k] = v;
      }
    } catch {
      /* valeur illisible : on garde la valeur par défaut */
    }
  }
  return out;
}

/** N'enregistre que les clés connues, avec le bon type. */
export async function saveSettings(client: Client, input: Record<string, unknown>) {
  for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof PortalSettings)[]) {
    if (!(k in input)) continue;
    const v = input[k];
    const ok = k === "agendaView" ? v === "week" || v === "list" : typeof v === "boolean";
    if (!ok) continue;
    await client.execute({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [k, JSON.stringify(v)],
    });
  }
}
