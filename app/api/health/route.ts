import { getDb } from "../../../db";
import { leads } from "../../../db/schema";

export async function GET() {
  try {
    await getDb().select({ id: leads.id }).from(leads).limit(1);
    if (!process.env.WEB3FORMS_ACCESS_KEY?.trim()) {
      return Response.json({ ok: false, error: "notification_not_configured" }, { status: 503 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
