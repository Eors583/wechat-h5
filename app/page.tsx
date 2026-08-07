import type { Metadata } from "next";
import { LeadForm } from "./components/LeadForm";
import { siteConfig } from "../site.config";

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
};

const outcomes = [
  {
    number: "01",
    title: "看清关键岗位",
    copy: "从业务目标反推关键岗位与能力缺口，不再用一份通用人才清单应付所有问题。",
  },
  {
    number: "02",
    title: "识别真正潜力",
    copy: "建立可讨论、可校准的人才标准，让经验、绩效与潜力回到同一张判断地图。",
  },
  {
    number: "03",
    title: "形成行动闭环",
    copy: "把盘点结果接到招聘、培养、继任与留任动作，带走一份可以继续推进的计划。",
  },
];

const agenda = [
  ["模块一", "战略翻译", "把经营目标拆成组织能力与人才议题"],
  ["模块二", "岗位地图", "识别关键岗位、关键任务和断点风险"],
  ["模块三", "人才判断", "统一绩效、能力、潜力的评估语言"],
  ["模块四", "梯队行动", "形成招聘、培养、继任与留任计划"],
];

const audiences = [
  "正在从事务执行走向业务伙伴的 HR",
  "需要搭建核心人才梯队的部门负责人",
  "面临扩张、转型或组织升级的管理者",
  "希望把人才盘点真正转化为行动的团队",
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <nav className="site-nav" aria-label="页面导航">
          <a className="brand" href="#top" aria-label={`${siteConfig.brand} 首页`}>
            <span className="brand-mark" aria-hidden="true">知</span>
            <span>{siteConfig.brand}</span>
          </a>
          <a className="nav-cta" href="#register">预约席位</a>
        </nav>

        <div className="hero-grid page-shell">
          <div className="hero-copy">
            <p className="eyebrow">{siteConfig.course.eyebrow}</p>
            <h1>{siteConfig.course.title}</h1>
            <p className="hero-lead">{siteConfig.course.subtitle}</p>
            <div className="hero-meta" aria-label="课程时间与地点">
              <div>
                <span>时间</span>
                <strong>{siteConfig.course.date}</strong>
              </div>
              <div>
                <span>地点</span>
                <strong>{siteConfig.course.location}</strong>
              </div>
            </div>
            <div className="hero-actions">
              <a className="primary-button" href="#register">领取课程资料与席位</a>
              <a className="text-link" href="#curriculum">先看课程内容 <span aria-hidden="true">→</span></a>
            </div>
            <p className="micro-proof">小班研讨 · 现场演练 · 可直接带走的工具模板</p>
          </div>

          <aside className="compass-card" aria-label="课程方法概览">
            <div className="compass-topline">
              <span>STRATEGY × TALENT</span>
              <span>2 DAYS</span>
            </div>
            <div className="compass-visual" aria-hidden="true">
              <div className="compass-ring ring-outer" />
              <div className="compass-ring ring-middle" />
              <div className="compass-core">
                <span>战略</span>
                <i />
                <span>人才</span>
              </div>
            </div>
            <div className="compass-footer">
              <strong>从业务目标出发</strong>
              <span>让人才动作有依据、有优先级、有结果</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="friction-strip" aria-label="常见人才管理困境">
        <div className="page-shell friction-grid">
          <p>招聘一直在做，关键岗位依然缺人</p>
          <p>人才盘点开了会，会后没有行动</p>
          <p>培养投入不少，业务仍感受不到变化</p>
        </div>
      </section>

      <section className="section page-shell" id="value">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow dark">这堂课解决什么</p>
            <h2>不是再学一套概念，<br />而是完成一次人才决策。</h2>
          </div>
          <p>围绕一个真实业务目标，逐步完成关键岗位识别、人才判断和行动计划，让人才管理从“经验驱动”走向“业务驱动”。</p>
        </div>
        <div className="outcome-grid">
          {outcomes.map((outcome) => (
            <article className="outcome-card" key={outcome.number}>
              <span>{outcome.number}</span>
              <h3>{outcome.title}</h3>
              <p>{outcome.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section curriculum-section" id="curriculum">
        <div className="page-shell curriculum-grid">
          <div className="section-heading curriculum-intro">
            <p className="eyebrow light">两天沉浸式工作坊</p>
            <h2>沿着一条清晰主线，<br />把方法变成结果。</h2>
            <p>每个模块都包含案例拆解、工具演练和小组校准。你不是来抄笔记，而是来推进一个真实问题。</p>
          </div>
          <div className="agenda-list">
            {agenda.map(([label, title, copy]) => (
              <article className="agenda-item" key={label}>
                <span>{label}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section page-shell audience-section">
        <div className="audience-panel">
          <div>
            <p className="eyebrow dark">适合谁来</p>
            <h2>带着真实问题来，<br />带着行动方案走。</h2>
          </div>
          <ul>
            {audiences.map((audience) => (
              <li key={audience}><span aria-hidden="true">✓</span>{audience}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section instructor-section">
        <div className="page-shell instructor-grid">
          <div className="portrait-placeholder" aria-label="讲师介绍装饰图">
            <span>{siteConfig.instructor.initial}</span>
            <small>COURSE FACILITATOR</small>
          </div>
          <div className="instructor-copy">
            <p className="eyebrow dark">课程导师</p>
            <h2>{siteConfig.instructor.name}</h2>
            <p className="instructor-role">{siteConfig.instructor.role}</p>
            <p>{siteConfig.instructor.bio}</p>
            <div className="instructor-stats">
              {siteConfig.instructor.highlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section registration-section" id="register">
        <div className="page-shell registration-grid">
          <div className="registration-copy">
            <p className="eyebrow light">预约席位</p>
            <h2>先留下联系方式，<br />课程顾问将与你确认详情。</h2>
            <p>提交后，我们会在一个工作日内与你联系。你可以先了解课程安排，再决定是否参加。</p>
            <dl className="detail-list">
              <div><dt>课程时间</dt><dd>{siteConfig.course.date}</dd></div>
              <div><dt>上课地点</dt><dd>{siteConfig.course.location}</dd></div>
              <div><dt>课程形式</dt><dd>{siteConfig.course.format}</dd></div>
            </dl>
          </div>
          <LeadForm campaignCode={siteConfig.campaignCode} consentVersion={siteConfig.consentVersion} />
        </div>
      </section>

      <footer>
        <div className="page-shell footer-inner">
          <div className="brand footer-brand">
            <span className="brand-mark" aria-hidden="true">知</span>
            <span>{siteConfig.brand}</span>
          </div>
          <p>让每一次人才决策，都更接近业务结果。</p>
          <a href="/privacy">隐私说明</a>
        </div>
      </footer>

      <div className="mobile-cta" aria-label="移动端快捷报名">
        <div><span>线下公开课</span><strong>预约席位</strong></div>
        <a href="#register">立即预约</a>
      </div>
    </main>
  );
}
