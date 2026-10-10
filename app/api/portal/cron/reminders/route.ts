import { timingSafeEqual } from "node:crypto";
import { addDaysISO } from "@/lib/portal/format";
import { sessionReminderEmail } from "@/lib/portal/mails";
import { db } from "@/lib/portal/server/db";
import { json } from "@/lib/portal/server/http";
import { sendMail } from "@/lib/portal/server/mailer";
import { getSettings } from "@/lib/portal/server/settings";

export const dynamic = "force-dynamic";

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Rappels de rendez-vous : appelé chaque jour par Vercel Cron (voir vercel.json), qui envoie
 * `Authorization: Bearer $CRON_SECRET`. Sans CRON_SECRET défini, la route refuse tout.
 * Envoie un e-mail au client pour chaque séance planifiée le lendemain (heure de Paris),
 * si l'option est activée dans les paramètres ; chaque séance n'est rappelée qu'une fois.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !safeEqual(given, secret)) return json({ error: "Accès refusé." }, 401);

  const client = await db();
  if (!(await getSettings(client)).reminderEmail) return json({ ok: true, skipped: "désactivé dans les paramètres" });

  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());
  const tomorrow = addDaysISO(today, 1);
  const rows = (
    await client.execute({
      sql: `SELECT s.id, s.date, s.contract_id, c.client_first_name, c.client_name, c.client_email, c.address, c.service,
                   p.company, p.contact, p.phone AS partner_phone, p.is_self
            FROM sessions s
            JOIN contracts c ON c.id = s.contract_id
            JOIN partners p ON p.id = c.partner_id
            WHERE s.status = 'planned' AND s.reminder_sent_at IS NULL AND s.date LIKE ? AND c.client_email <> ''
            ORDER BY s.date LIMIT 60`,
      args: [`${tomorrow}%`],
    })
  ).rows;

  let sent = 0;
  const failed: string[] = [];
  for (const r of rows) {
    const dogs = (await client.execute({ sql: "SELECT name FROM dogs WHERE contract_id = ? ORDER BY created_at, id", args: [r.contract_id] })).rows.map((d) => String(d.name));
    const mail = sessionReminderEmail({
      firstName: String(r.client_first_name || r.client_name),
      date: String(r.date),
      service: String(r.service),
      address: String(r.address),
      dogs,
      partner: Number(r.is_self) ? null : { company: String(r.company), contact: String(r.contact), phone: String(r.partner_phone ?? "") },
    });
    const res = await sendMail({ to: String(r.client_email), ...mail });
    if (res.ok) {
      sent++;
      await client.execute({ sql: "UPDATE sessions SET reminder_sent_at = ? WHERE id = ?", args: [new Date().toISOString(), r.id] });
    } else {
      failed.push(String(r.id));
    }
  }
  return json({ ok: true, date: tomorrow, sent, failed: failed.length });
}
