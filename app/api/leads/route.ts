import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { siteConfig } from "../../../site.config";
import {
  getLeadNotificationRequest,
  type LeadNotificationInput,
} from "../../lib/lead-notification";

type LeadPayload = {
  campaignCode?: unknown;
  name?: unknown;
  phone?: unknown;
  company?: unknown;
  jobTitle?: unknown;
  budgetRange?: unknown;
  contactTime?: unknown;
  consent?: unknown;
  consentVersion?: unknown;
  website?: unknown;
  attribution?: {
    utmSource?: unknown;
    utmMedium?: unknown;
    utmCampaign?: unknown;
    utmContent?: unknown;
    referrer?: unknown;
    landingUrl?: unknown;
  };
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

function getAllowedOrigin(request: Request) {
  const configuredOrigin = process.env.PUBLIC_BASE_URL?.trim();
  if (configuredOrigin) return new URL(configuredOrigin).origin;

  const forwardedHost = request.headers.get("X-Forwarded-Host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("Host");
  const forwardedProtocol = request.headers
    .get("X-Forwarded-Proto")
    ?.split(",")[0]
    ?.trim();

  if (host) {
    return `${forwardedProtocol || new URL(request.url).protocol.replace(":", "")}://${host}`;
  }

  return new URL(request.url).origin;
}

async function fingerprintRequest(request: Request) {
  const forwardedFor = request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim();
  const ip =
    request.headers.get("CF-Connecting-IP") ??
    forwardedFor ??
    request.headers.get("X-Real-IP") ??
    "unknown";
  const userAgent = request.headers.get("User-Agent") ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${day}:${ip}:${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function successResponse(lead: LeadNotificationInput & { idempotencyKey?: string }, duplicate = false) {
  return {
    ok: true,
    duplicate,
    leadId: lead.id,
    notification: getLeadNotificationRequest(lead),
  };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("Content-Length") ?? "0");
  if (contentLength > 16_000) return jsonError("提交内容过大", 413);

  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).origin !== getAllowedOrigin(request)) {
    return jsonError("不允许从其他网站提交", 403);
  }

  const idempotencyKey = cleanText(request.headers.get("Idempotency-Key"), 80);
  if (!/^[0-9a-f-]{20,80}$/i.test(idempotencyKey)) {
    return jsonError("提交标识无效，请刷新页面后重试", 400);
  }

  let payload: LeadPayload;
  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return jsonError("请求内容格式不正确", 400);
  }

  if (cleanText(payload.website, 200)) {
    return Response.json({ ok: true }, { status: 201 });
  }

  const campaignCode = cleanText(payload.campaignCode, 80);
  const name = cleanText(payload.name, 40);
  const phone = cleanText(payload.phone, 20).replace(/[\s-]/g, "");
  const company = cleanText(payload.company, 80);
  const jobTitle = cleanText(payload.jobTitle, 50);
  const budgetRange = cleanText(payload.budgetRange, 40);
  const contactTime = cleanText(payload.contactTime, 40);

  if (campaignCode !== siteConfig.campaignCode) return jsonError("当前活动不存在或已结束", 404);
  if (name.length < 2) return jsonError("请填写至少 2 个字的姓名", 400);
  if (!/^1[3-9]\d{9}$/.test(phone)) return jsonError("请填写正确的 11 位手机号码", 400);
  if (payload.consent !== true || cleanText(payload.consentVersion, 30) !== siteConfig.consentVersion) {
    return jsonError("请先阅读并同意隐私说明", 400);
  }

  const attribution = payload.attribution ?? {};
  const now = new Date();
  const fingerprint = await fingerprintRequest(request);
  const db = getDb();

  try {
    const [existingLead] = await db
      .select()
      .from(leads)
      .where(eq(leads.idempotencyKey, idempotencyKey))
      .limit(1);

    if (existingLead) {
      return Response.json(
        existingLead.notificationStatus === "sent"
          ? { ok: true, duplicate: true, leadId: existingLead.id, notification: null }
          : successResponse(existingLead, true),
      );
    }

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const [recent] = await db
      .select({ value: count() })
      .from(leads)
      .where(and(eq(leads.requestFingerprint, fingerprint), gte(leads.createdAt, oneHourAgo)));

    if ((recent?.value ?? 0) >= 5) {
      return jsonError("提交次数过多，请稍后再试", 429);
    }

    const lead = {
      id: crypto.randomUUID(),
      campaignCode,
      name,
      phone,
      company,
      jobTitle,
      budgetRange,
      contactTime,
      utmSource: cleanText(attribution.utmSource, 100),
      utmMedium: cleanText(attribution.utmMedium, 100),
      utmCampaign: cleanText(attribution.utmCampaign, 100),
      utmContent: cleanText(attribution.utmContent, 160),
      referrer: cleanText(attribution.referrer, 500),
      landingUrl: cleanText(attribution.landingUrl, 1000),
      consentVersion: siteConfig.consentVersion,
      consentAt: now.toISOString(),
      idempotencyKey,
      requestFingerprint: fingerprint,
      createdAt: now.toISOString(),
    };

    await db.insert(leads).values(lead);

    return Response.json(successResponse(lead), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("idempotency") || message.includes("UNIQUE constraint failed")) {
      const [existingLead] = await db
        .select()
        .from(leads)
        .where(eq(leads.idempotencyKey, idempotencyKey))
        .limit(1);

      if (existingLead) {
        return Response.json(
          existingLead.notificationStatus === "sent"
            ? { ok: true, duplicate: true, leadId: existingLead.id, notification: null }
            : successResponse(existingLead, true),
        );
      }
      return jsonError("系统暂时无法读取已保存的预约，请稍后再试", 503);
    }
    return jsonError("系统暂时无法保存预约，请稍后再试", 503);
  }
}
