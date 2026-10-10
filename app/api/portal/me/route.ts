import { currentSession, dataFor, handleError, json } from "@/lib/portal/server/http";

export async function GET() {
  try {
    const session = await currentSession();
    if (!session) return json({ session: null });
    return json({ session, data: await dataFor(session) });
  } catch (e) {
    return handleError(e);
  }
}
