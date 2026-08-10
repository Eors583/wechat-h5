import type { Metadata } from "next";
import Image from "next/image";
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
            <div className="contact-heading">
              <div className="eyebrow-row">
                <p className="eyebrow">线下公开课 · 报名咨询</p>
                <span className="availability"><i /> 报名开放中</span>
              </div>
              <h1>先了解清楚，<br />再决定是否参加。</h1>
              <p className="registration-lead">
                课程安排、报名流程和上课地点，都可以直接咨询吴老师；也可以填写右侧信息，由我们主动联系你。
              </p>
              <ul className="course-chips" aria-label="课程特点">
                <li>2 天线下工作坊</li>
                <li>上海</li>
                <li>小班研讨</li>
              </ul>
            </div>

            <div className="contact-card">
              <div className="consultant-row">
                <span className="consultant-avatar" aria-hidden="true">吴</span>
                <div className="consultant-meta">
                  <span>课程顾问</span>
                  <strong>蓝血研究吴老师</strong>
                </div>
                <span className="consultant-status"><i /> 在线咨询</span>
              </div>

              <div className="contact-card__body">
                <div className="contact-qr-wrap">
                  <Image
                    className="contact-qr"
                    src="/contact-wu-wechat.png"
                    alt="蓝血研究吴老师的微信二维码"
                    width="982"
                    height="1382"
                    priority
                  />
                </div>

                <div className="contact-actions">
                  <div>
                    <span className="contact-actions__label">微信咨询</span>
                    <strong>扫码添加好友</strong>
                    <p>添加时请备注“课程咨询”</p>
                  </div>
                  <a className="contact-phone" href="tel:15260211397" aria-label="拨打吴老师电话 15260211397">
                    <span>电话咨询</span>
                    <strong>15260211397</strong>
                  </a>
                </div>
              </div>
            </div>
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
