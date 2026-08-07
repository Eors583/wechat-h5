import { env } from "cloudflare:workers";

export type LeadNotificationInput = {
  id: string;
  name: string;
  phone: string;
  company: string;
  jobTitle: string;
  budgetRange: string;
  contactTime: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
  landingUrl: string;
  createdAt: string;
};

export type LeadNotificationResult =
  | { status: "sent"; providerId: string }
  | { status: "not_configured" | "failed"; error: string };

type EmailBindings = {
  RESEND_API_KEY?: string;
  LEAD_NOTIFICATION_TO?: string;
  LEAD_NOTIFICATION_FROM?: string;
};

const DEFAULT_RECIPIENT = "1193254370@qq.com";
const DEFAULT_SENDER = "课程报名提醒 <onboarding@resend.dev>";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function display(value: string) {
  return value || "未填写";
}

function cleanSubjectPart(value: string) {
  return value.replace(/[\r\n]+/g, " ").slice(0, 60);
}

function formatSubmittedAt(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      dateStyle: "medium",
      timeStyle: "medium",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function buildLeadNotification(input: LeadNotificationInput, recipient = DEFAULT_RECIPIENT) {
  const submittedAt = formatSubmittedAt(input.createdAt);
  const companyLabel = input.company ? ` · ${cleanSubjectPart(input.company)}` : "";
  const subject = `【新课程预约】${cleanSubjectPart(input.name)}${companyLabel}`;
  const rows = [
    ["姓名", input.name],
    ["手机", input.phone],
    ["公司", display(input.company)],
    ["职位", display(input.jobTitle)],
    ["预算范围", display(input.budgetRange)],
    ["方便沟通时间", display(input.contactTime)],
    ["提交时间", submittedAt],
    ["UTM 来源", display(input.utmSource)],
    ["UTM 媒介", display(input.utmMedium)],
    ["UTM 活动", display(input.utmCampaign)],
    ["来源页面", display(input.referrer)],
    ["落地页", display(input.landingUrl)],
    ["线索编号", input.id],
  ];

  const text = [
    "收到一条新的课程预约：",
    "",
    ...rows.map(([label, value]) => `${label}：${value}`),
    "",
    "该线索已同时保存到网站数据库，请尽快联系。",
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th style="padding:10px 12px;text-align:left;vertical-align:top;background:#f4f7f6;color:#34504d;font-weight:600;border-bottom:1px solid #e2e9e7;width:120px">${escapeHtml(label)}</th><td style="padding:10px 12px;color:#172d2b;border-bottom:1px solid #e2e9e7;word-break:break-word">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html lang="zh-CN"><body style="margin:0;padding:24px;background:#edf2f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif"><div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden"><div style="padding:24px 28px;background:#0d302e;color:#ffffff"><div style="font-size:13px;color:#f3c855;margin-bottom:8px">课程预约通知</div><h1 style="font-size:24px;line-height:1.4;margin:0">收到一条新的预约信息</h1></div><div style="padding:24px 28px"><table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">${htmlRows}</table><p style="margin:20px 0 0;color:#647774;font-size:13px;line-height:1.7">该线索已同时保存到网站数据库，请尽快联系。</p></div></div></body></html>`;

  return {
    from: DEFAULT_SENDER,
    to: [recipient],
    subject,
    text,
    html,
  };
}

export async function sendLeadNotification(input: LeadNotificationInput): Promise<LeadNotificationResult> {
  const bindings = env as unknown as EmailBindings;
  const localBindings = typeof process === "undefined" ? {} : process.env;
  const apiKey = (bindings.RESEND_API_KEY || localBindings.RESEND_API_KEY)?.trim();
  const recipient =
    (bindings.LEAD_NOTIFICATION_TO || localBindings.LEAD_NOTIFICATION_TO)?.trim() ||
    DEFAULT_RECIPIENT;
  const sender =
    (bindings.LEAD_NOTIFICATION_FROM || localBindings.LEAD_NOTIFICATION_FROM)?.trim() ||
    DEFAULT_SENDER;

  if (!apiKey) {
    return { status: "not_configured", error: "resend_api_key_missing" };
  }

  const payload = { ...buildLeadNotification(input, recipient), from: sender };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `lead-notification/${input.id}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { status: "failed", error: `resend_http_${response.status}` };
    }

    const result = (await response.json()) as { id?: unknown };
    return {
      status: "sent",
      providerId: typeof result.id === "string" ? result.id.slice(0, 120) : "",
    };
  } catch {
    return { status: "failed", error: "resend_request_failed" };
  }
}
