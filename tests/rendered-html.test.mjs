import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import test, { after, before } from "node:test";

let server;
let origin;

async function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const socket = createServer();
    socket.once("error", reject);
    socket.listen(0, "127.0.0.1", () => {
      const address = socket.address();
      const port = typeof address === "object" && address ? address.port : 0;
      socket.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitUntilReady() {
  let lastError;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`${origin}/api/health`);
      if (response.ok) return;
      lastError = new Error(`Health check returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError ?? new Error("Server did not become ready");
}

before(async () => {
  const port = await getAvailablePort();
  origin = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ["dist/standalone/server.js"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      DATABASE_PATH: ":memory:",
      PUBLIC_BASE_URL: origin,
      WEB3FORMS_ACCESS_KEY: "test_access_key",
    },
    stdio: "pipe",
  });
  await waitUntilReady();
});

after(() => {
  server?.kill();
});

async function render(path = "/") {
  return fetch(`${origin}${path}`, { headers: { accept: "text/html" } });
}

test("server-renders the campaign landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /人才战略罗盘/);
  assert.match(html, /报名咨询/);
  assert.match(html, /留下信息，顾问联系你/);
  assert.match(html, /蓝血研究吴老师/);
  assert.match(html, /15260211397/);
  assert.match(html, /contact-wu-wechat\.png/);
  assert.doesNotMatch(html, /先了解清楚|再决定是否参加|2 天线下工作坊|小班研讨/);
  assert.match(html, /隐私说明/);
  assert.doesNotMatch(html, /预算范围|方便沟通时间/);
  assert.match(html, new RegExp(`${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/og\\.png`));
  assert.doesNotMatch(html, /两天沉浸式工作坊|课程导师|适合谁来/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("uses an HTTP-compatible idempotency key fallback", async () => {
  const source = await readFile(new URL("../app/components/LeadForm.tsx", import.meta.url), "utf8");
  assert.match(source, /typeof cryptoApi\?\.randomUUID === "function"/);
  assert.match(source, /cryptoApi\.getRandomValues\(bytes\)/);
  assert.match(source, /createIdempotencyKey\(\)/);
  assert.doesNotMatch(source, /\?\?= crypto\.randomUUID\(\)/);
});

test("server-renders the privacy page", async () => {
  const response = await render("/privacy");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /隐私说明/);
  assert.match(html, /我们收集的信息/);
  assert.match(html, /你的权利/);
  assert.match(html, /379381070@qq\.com/);
});

test("stores a lead and tracks browser-delivered notification status", async () => {
  const idempotencyKey = "11111111-2222-4333-8444-555555555555";
  const payload = {
    campaignCode: "talent-strategy-workshop-2026",
    name: "服务器测试",
    phone: "13800000000",
    company: "自托管验证",
    jobTitle: "测试记录",
    budgetRange: "暂不确定",
    contactTime: "工作日下午",
    consent: true,
    consentVersion: "2026-08-10-self-hosted-v1",
    website: "",
    attribution: {
      utmSource: "test",
      utmMedium: "node-test",
      utmCampaign: "20260810",
      landingUrl: `${origin}/`,
    },
  };

  const response = await fetch(`${origin}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.notification.endpoint, "https://api.web3forms.com/submit");
  assert.equal(result.notification.accessKey, "test_access_key");

  const trackingResponse = await fetch(`${origin}/api/leads/notification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ leadId: result.leadId, status: "sent" }),
  });
  assert.equal(trackingResponse.status, 200);

  const duplicateResponse = await fetch(`${origin}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
  assert.equal(duplicateResponse.status, 200);
  const duplicate = await duplicateResponse.json();
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.notification, null);
});
