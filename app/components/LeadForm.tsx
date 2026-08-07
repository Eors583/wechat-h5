"use client";

import { FormEvent, useState } from "react";

type LeadFormProps = {
  campaignCode: string;
  consentVersion: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

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

export function LeadForm({ campaignCode, consentVersion }: LeadFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
      budgetRange: data.get("budgetRange"),
      contactTime: data.get("contactTime"),
      consent: data.get("consent") === "on",
      consentVersion,
      website: data.get("website"),
      attribution: getAttribution(),
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "提交失败，请稍后再试");
      }

      form.reset();
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
        <p className="form-kicker">免费预约</p>
        <h3>填写联系信息</h3>
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
        <label>
          <span>预算范围</span>
          <select name="budgetRange" defaultValue="">
            <option value="">暂不确定</option>
            <option value="5000元以内">5,000 元以内</option>
            <option value="5000-10000元">5,000—10,000 元</option>
            <option value="10000元以上">10,000 元以上</option>
          </select>
        </label>
        <label>
          <span>方便沟通时间</span>
          <select name="contactTime" defaultValue="工作日下午">
            <option value="工作日上午">工作日上午</option>
            <option value="工作日下午">工作日下午</option>
            <option value="工作日晚间">工作日晚间</option>
            <option value="周末">周末</option>
          </select>
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
        {submitState === "submitting" ? "正在提交…" : "提交预约"}
      </button>

      <p className="form-assurance">不会自动付费，也不会向无关第三方出售你的信息。</p>
      <p className="form-error" role="alert" aria-live="assertive">{submitState === "error" ? errorMessage : ""}</p>
    </form>
  );
}
