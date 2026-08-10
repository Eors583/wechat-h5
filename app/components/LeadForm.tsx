"use client";

import { FormEvent, useRef, useState } from "react";

type LeadFormProps = {
  campaignCode: string;
  consentVersion: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

type NotificationRequest = {
  endpoint: string;
  accessKey: string;
  fields: Record<string, string>;
};

type LeadResponse = {
  error?: string;
  leadId?: string;
  notification?: NotificationRequest | null;
};

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? "",
    referrer: document.referrer,
    landingUrl: window.location.href,
  };
}

function createIdempotencyKey() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === "function") {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function LeadForm({ campaignCode, consentVersion }: LeadFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const idempotencyKeyRef = useRef<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    setSubmitState("submitting");
    setErrorMessage("");

    const data = new FormData(form);
    const payload = {
      campaignCode,
      name: data.get("name"),
      phone: data.get("phone"),
      company: data.get("company"),
      jobTitle: data.get("jobTitle"),
      consent: data.get("consent") === "on",
      consentVersion,
      website: data.get("website"),
      attribution: getAttribution(),
    };

    try {
      idempotencyKeyRef.current ??= createIdempotencyKey();
      const idempotencyKey = idempotencyKeyRef.current;
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as LeadResponse;
      if (!response.ok) {
        throw new Error(result.error || "提交失败，请稍后再试");
      }

      if (result.notification) {
        let deliveryStatus: "sent" | "failed" = "failed";
        let deliveryError = "client_delivery_failed";

        try {
          const notificationResponse = await fetch(result.notification.endpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_key: result.notification.accessKey,
              ...result.notification.fields,
            }),
          });
          const notificationResult = (await notificationResponse.json()) as { success?: unknown };
          if (!notificationResponse.ok || notificationResult.success !== true) {
            deliveryError = `web3forms_http_${notificationResponse.status}`;
            throw new Error(deliveryError);
          }
          deliveryStatus = "sent";
          deliveryError = "";
        } catch {
          deliveryStatus = "failed";
        } finally {
          if (result.leadId) {
            await fetch("/api/leads/notification", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey,
              },
              body: JSON.stringify({
                leadId: result.leadId,
                status: deliveryStatus,
                error: deliveryError,
              }),
            }).catch(() => undefined);
          }
        }

        if (deliveryStatus !== "sent") {
          throw new Error("报名信息已保存，但通知邮件暂时未送达，请再次点击提交重试");
        }
      }

      form.reset();
      idempotencyKeyRef.current = null;
      setSubmitState("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "提交失败，请稍后再试");
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div className="lead-form success-card" role="status" aria-live="polite">
        <div className="success-mark" aria-hidden="true">✓</div>
        <p className="form-kicker">预约已收到</p>
        <h3>感谢你的信任</h3>
        <p>课程顾问会在一个工作日内联系你，请留意来电或微信消息。</p>
        <button type="button" className="secondary-button" onClick={() => setSubmitState("idle")}>再提交一位</button>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <div className="form-heading__copy">
          <p className="form-kicker">免费咨询 · 无需付费</p>
          <h3>留下信息，顾问联系你</h3>
          <p>填写大约需要 30 秒，课程顾问将在一个工作日内与你沟通。</p>
        </div>
        <span><b>*</b> 为必填项</span>
      </div>

      <div className="form-grid">
        <label>
          <span>姓名 <b>*</b></span>
          <input name="name" type="text" autoComplete="name" minLength={2} maxLength={40} placeholder="怎么称呼你" required />
        </label>
        <label>
          <span>手机 <b>*</b></span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="numeric" pattern="1[3-9][0-9]{9}" placeholder="用于联系确认课程" required />
        </label>
        <label>
          <span>公司</span>
          <input name="company" type="text" autoComplete="organization" maxLength={80} placeholder="你所在的公司" />
        </label>
        <label>
          <span>职位</span>
          <input name="jobTitle" type="text" autoComplete="organization-title" maxLength={50} placeholder="例如：HRD / 部门负责人" />
        </label>
      </div>

      <label className="honeypot" aria-hidden="true">
        网址
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="consent-row">
        <input name="consent" type="checkbox" required />
        <span>我已阅读并同意<a href="/privacy" target="_blank">《隐私说明》</a>，同意为课程咨询目的使用以上信息。</span>
      </label>

      <button className="submit-button" type="submit" disabled={submitState === "submitting"}>
        {submitState === "submitting" ? "正在提交…" : "提交咨询"}
      </button>

      <p className="form-assurance"><span aria-hidden="true">✓</span> 不会自动付费，也不会向无关第三方出售你的信息</p>
      <p className="form-error" role="alert" aria-live="assertive">{submitState === "error" ? errorMessage : ""}</p>
    </form>
  );
}
