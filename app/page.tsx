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
              <p className="eyebrow">报名咨询</p>
              <h1>有课程问题，<br />直接联系吴老师。</h1>
              <p className="registration-lead">
                课程安排、报名流程和上课地点，都可以通过电话或微信咨询。
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card__topline">
                <div>
                  <span className="contact-card__label">课程顾问</span>
                  <strong>蓝血研究吴老师</strong>
                </div>
                <a className="contact-phone" href="tel:15260211397" aria-label="拨打吴老师电话 15260211397">
                  15260211397
                </a>
              </div>

              <div className="contact-qr-wrap">
                <Image
                  className="contact-qr"
                  src="/contact-wu-wechat.png"
                  alt="蓝血研究吴老师的微信二维码"
                  width="982"
                  height="1382"
                />
              </div>
              <p className="contact-tip">微信扫码添加好友，咨询课程与报名</p>
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
