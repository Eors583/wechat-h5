import type { Metadata } from "next";
import { LeadForm } from "./components/LeadForm";
import { siteConfig } from "../site.config";

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
};

export default function Home() {
  return (
    <main className="registration-page">
      <section className="registration-section" id="register">
        <div className="page-shell registration-grid">
          <div className="registration-copy">
            <p className="eyebrow">预约席位</p>
            <h1>先留下联系方式，<br />课程顾问将与你确认详情。</h1>
            <p className="registration-lead">
              提交后，我们会在一个工作日内与你联系。你可以先了解课程安排，再决定是否参加。
            </p>
            <dl className="detail-list">
              <div><dt>课程时间</dt><dd>{siteConfig.course.date}</dd></div>
              <div><dt>上课地点</dt><dd>{siteConfig.course.location}</dd></div>
              <div><dt>课程形式</dt><dd>{siteConfig.course.format}</dd></div>
            </dl>
          </div>

          <LeadForm
            campaignCode={siteConfig.campaignCode}
            consentVersion={siteConfig.consentVersion}
          />
        </div>
      </section>
    </main>
  );
}
