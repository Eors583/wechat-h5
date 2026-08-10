import Link from "next/link";
import { siteConfig } from "../../site.config";

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <article className="privacy-shell">
        <Link className="privacy-back" href="/">← 返回报名页</Link>
        <h1>隐私说明</h1>
        <p className="privacy-updated">最近更新：2026 年 8 月 10 日</p>

        <p>本页面由{siteConfig.brand}运营。我们尊重并保护你在课程咨询和报名过程中提供的个人信息。</p>

        <h2>一、我们收集的信息</h2>
        <p>当你提交预约时，我们可能收集姓名、手机号码、公司、职位、预算范围、方便沟通时间，以及页面来源和活动渠道信息。</p>

        <h2>二、使用目的</h2>
        <p>这些信息仅用于确认课程需求、提供课程资料、安排咨询服务、分析活动效果和改进服务质量。我们不会把你的个人信息出售给无关第三方。</p>

        <h2>三、保存、邮件通知与保护</h2>
        <p>提交的信息会保存在本网站服务器的数据库中，并通过 Web3Forms 表单通知服务发送一份预约通知到运营者指定的 379381070@qq.com 邮箱。我们会在实现上述目的所需的合理期限内保存信息，并采取访问控制、最小权限和必要的技术措施降低未经授权访问、泄露或滥用的风险。</p>

        <h2>四、你的权利</h2>
        <p>你可以通过发布本页面的微信公众号联系我们，申请查询、更正或删除你提交的信息，也可以随时拒绝后续营销联系。</p>

        <h2>五、说明更新</h2>
        <p>如本说明发生重要变化，我们会在页面更新版本和日期。继续提交信息前，请阅读最新版本。</p>
      </article>
    </main>
  );
}
