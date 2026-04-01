// 服务条款页面
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(158deg, #f8f5ef 0%, #f2eef5 58%, #f5f2ee 100%)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-10">
          <Link to="/" className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>

        <article className="prose-stone">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">服务条款</h1>
          <p className="text-sm text-stone-400 mb-10">最后更新：2025 年 4 月 1 日</p>

          <div className="space-y-8 text-sm text-stone-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">1. 服务说明</h2>
              <p>印记是一款基于人工智能的智能日记应用，提供日记撰写、情绪分析、心理洞察等功能。本服务条款（"条款"）构成您与印记之间的法律协议。</p>
              <p className="mt-2">使用我们的服务即表示您同意受本条款的约束。如果您不同意本条款的任何部分，请勿使用我们的服务。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">2. 账户注册</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>您必须年满 16 周岁才能注册使用本服务。</li>
                <li>您需要提供真实有效的邮箱地址进行注册。</li>
                <li>您有责任保护您的账户安全，包括妥善保管密码。</li>
                <li>您对通过您的账户发生的所有活动负责。</li>
                <li>如发现未经授权使用您的账户，请立即通知我们。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">3. 用户内容</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>您保留您在服务中创建的所有内容（日记、个人信息等）的所有权。</li>
                <li>您授予我们为提供服务目的处理您内容的有限许可（如 AI 分析）。</li>
                <li>您不得发布违法、有害、威胁性、滥用性或侵权的内容。</li>
                <li>我们保留删除违反本条款内容的权利。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">4. AI 服务免责声明</h2>
              <p>印记提供的 AI 分析和心理洞察功能：</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
                <li><strong>不构成</strong>专业心理咨询、心理治疗或医疗建议。</li>
                <li>仅供参考和自我探索使用。</li>
                <li>如您正在经历严重的心理健康问题，请寻求专业心理咨询师或医生的帮助。</li>
                <li>AI 分析可能存在不准确之处，我们不对分析结果的准确性做任何保证。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">5. 付费服务</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>部分高级功能需要付费订阅。</li>
                <li>订阅费用在购买时明确标示。</li>
                <li>订阅将自动续期，除非您在续期前取消。</li>
                <li>价格可能会调整，调整前我们将提前通知。</li>
                <li>退款政策详见<Link to="/refund" className="text-[#b56f61] hover:underline mx-0.5">退款政策</Link>页面。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">6. 禁止行为</h2>
              <p>使用本服务时，您不得：</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
                <li>违反任何适用的法律法规。</li>
                <li>侵犯他人的知识产权或其他合法权益。</li>
                <li>尝试未经授权访问服务的任何部分。</li>
                <li>干扰或破坏服务的正常运行。</li>
                <li>使用自动化手段（如爬虫）大规模访问服务。</li>
                <li>传播恶意软件或有害代码。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">7. 服务变更与终止</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>我们保留随时修改、暂停或终止服务的权利。</li>
                <li>重大变更将提前通过服务内通知或邮件告知。</li>
                <li>我们可能因违反条款而暂停或终止您的账户。</li>
                <li>您可以随时删除账户并停止使用服务。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">8. 知识产权</h2>
              <p>服务中的所有内容（不包括用户内容），包括但不限于文字、图片、图标、代码、设计等，均为印记或其许可方的知识产权，受法律保护。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">9. 责任限制</h2>
              <p>在法律允许的最大范围内，印记不对因使用或无法使用服务而导致的任何间接、偶然、特殊或惩罚性损害承担责任。我们的最大责任限额不超过您在过去 12 个月内支付的服务费用。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">10. 条款变更</h2>
              <p>我们可能会不时更新本服务条款。重大变更将通过服务内通知告知您。继续使用服务即表示您接受更新后的条款。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">11. 适用法律</h2>
              <p>本条款受中华人民共和国法律管辖。因本条款产生的任何争议，双方应友好协商解决；协商不成的，任何一方均可向印记所在地有管辖权的人民法院提起诉讼。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">12. 联系我们</h2>
              <p>如果您对本服务条款有任何疑问，请联系：</p>
              <p className="mt-2">邮箱：<a href="mailto:support@yinji.app" className="text-[#b56f61] hover:underline">support@yinji.app</a></p>
            </section>
          </div>
        </article>

        <div className="mt-12 pt-8 border-t border-stone-200/50 flex flex-wrap gap-4 text-xs text-stone-400">
          <Link to="/privacy" className="hover:text-stone-600 transition-colors">隐私政策</Link>
          <Link to="/refund" className="hover:text-stone-600 transition-colors">退款政策</Link>
          <Link to="/" className="hover:text-stone-600 transition-colors">返回首页</Link>
        </div>
      </div>
    </div>
  )
}
