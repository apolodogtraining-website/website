import { endSession } from "@/lib/portal/server/auth";
import { json } from "@/lib/portal/server/http";

export async function POST() {
  await endSession();
  return json({ ok: true });
}
