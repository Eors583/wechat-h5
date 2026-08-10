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

export type LeadNotificationRequest = {
  endpoint: "https://api.web3forms.com/submit";
  accessKey: string;
  fields: ReturnType<typeof buildLeadNotification>;
};

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

export function buildLeadNotification(input: LeadNotificationInput) {
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

  return {
    subject,
    from_name: "人才战略课程报名页",
    name: input.name,
    phone: input.phone,
    company: display(input.company),
    job_title: display(input.jobTitle),
    budget_range: display(input.budgetRange),
    contact_time: display(input.contactTime),
    submitted_at: submittedAt,
    utm_source: display(input.utmSource),
    utm_medium: display(input.utmMedium),
    utm_campaign: display(input.utmCampaign),
    referrer: display(input.referrer),
    landing_url: display(input.landingUrl),
    lead_id: input.id,
    message: text,
  };
}

export function getLeadNotificationRequest(
  input: LeadNotificationInput,
): LeadNotificationRequest | null {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();

  if (!accessKey) {
    return null;
  }

  return {
    endpoint: "https://api.web3forms.com/submit",
    accessKey,
    fields: buildLeadNotification(input),
  };
}
