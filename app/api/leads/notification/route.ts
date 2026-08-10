import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { leads } from "../../../../db/schema";

type NotificationPayload = {
  leadId?: unknown;
  status?: unknown;
  error?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const idempotencyKey = cleanText(request.headers.get("Idempotency-Key"), 80);
  if (!/^[0-9a-f-]{20,80}$/i.test(idempotencyKey)) {
    return Response.json({ error: "提交标识无效" }, { status: 400 });
  }

  let payload: NotificationPayload;
  try {
    payload = (await request.json()) as NotificationPayload;
  } catch {
    return Response.json({ error: "请求内容格式不正确" }, { status: 400 });
  }

  const leadId = cleanText(payload.leadId, 80);
  const status = payload.status === "sent" ? "sent" : "failed";
  const error = status === "failed" ? cleanText(payload.error, 160) || "client_delivery_failed" : "";
  if (!leadId) return Response.json({ error: "线索编号无效" }, { status: 400 });

  const db = getDb();
  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.id, leadId), eq(leads.idempotencyKey, idempotencyKey)))
    .limit(1);

  if (!lead) return Response.json({ error: "预约记录不存在" }, { status: 404 });

  await db
    .update(leads)
    .set({
      notificationStatus: status,
      notificationProviderId: "",
      notificationError: error,
      notificationSentAt: status === "sent" ? new Date().toISOString() : "",
    })
    .where(eq(leads.id, leadId));

  return Response.json({ ok: true });
}
