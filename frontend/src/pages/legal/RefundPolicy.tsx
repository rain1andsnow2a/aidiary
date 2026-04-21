// 退款政策页面
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function RefundPolicy() {
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
          <h1 className="text-3xl font-bold text-stone-800 mb-2">退款政策</h1>
          <p className="text-sm text-stone-400 mb-10">最后更新：2025 年 4 月 1 日</p>

          <div className="space-y-8 text-sm text-stone-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">1. 退款原则</h2>
              <p>
                映记致力于为用户提供高质量的服务体验。我们理解在某些情况下您可能需要申请退款，本政策旨在提供清晰透明的退款规则。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">2. 免费试用</h2>
              <p>
                映记提供免费版本，您可以在付费订阅前充分体验核心功能。我们建议您在免费版本中充分了解服务后再决定是否订阅。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">3. 月度订阅退款</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong>7 天内：</strong>首次订阅后 7 天内，如果您对服务不满意，可以申请全额退款。</li>
                <li><strong>7 天后：</strong>超过 7 天的月度订阅不支持退款，但您可以随时取消订阅，服务将持续到当前计费周期结束。</li>
                <li><strong>自动续期：</strong>如果您忘记取消自动续期，可在续期后 48 小时内申请退款。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">4. 年度订阅退款</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong>14 天内：</strong>首次年度订阅后 14 天内，可以申请全额退款。</li>
                <li><strong>14 天后至 30 天内：</strong>可申请按比例退款（扣除已使用天数对应费用，按月度标准价计算）。</li>
                <li><strong>30 天后：</strong>不再支持退款，但您可以继续使用到订阅期结束。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">5. 特殊情况退款</h2>
              <p>以下情况我们将酌情处理退款申请：</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
                <li><strong>服务故障：</strong>因我方原因导致服务长时间不可用（超过 72 小时连续中断），可申请按比例退款。</li>
                <li><strong>重复扣费：</strong>因技术问题导致的重复扣费，将全额退还多扣金额。</li>
                <li><strong>未经授权交易：</strong>如发现未经您授权的订阅交易，请立即联系我们处理。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">6. 不予退款的情况</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>因违反服务条款被暂停或终止的账户。</li>
                <li>超出上述退款时限的申请。</li>
                <li>已使用过退款权利后再次订阅又申请退款的（滥用退款政策）。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">7. 如何申请退款</h2>
              <ol className="list-decimal list-inside space-y-1.5 ml-2">
                <li>发送邮件至 <a href="mailto:support@yinji.app" className="text-[#b56f61] hover:underline">support@yinji.app</a>。</li>
                <li>邮件标题注明"退款申请"。</li>
                <li>提供您的注册邮箱、订阅类型和退款原因。</li>
                <li>我们将在 3-5 个工作日内审核并回复您的申请。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">8. 退款方式</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>退款将原路返回至您的支付账户。</li>
                <li>退款到账时间取决于支付渠道，通常为 5-10 个工作日。</li>
                <li>退款金额以人民币计算。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">9. 取消订阅</h2>
              <p>
                您可以随时在账户设置中取消订阅。取消后，您仍可使用付费功能直到当前计费周期结束，之后将自动降级为免费版本。取消订阅不会删除您的数据。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">10. 政策变更</h2>
              <p>
                我们保留更新退款政策的权利。变更将在页面上公示，重大变更将通过邮件通知。变更后的政策不适用于变更前已完成的交易。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">11. 联系我们</h2>
              <p>如有退款相关问题，请联系：</p>
              <p className="mt-2">邮箱：<a href="mailto:support@yinji.app" className="text-[#b56f61] hover:underline">support@yinji.app</a></p>
            </section>
          </div>
        </article>

        <div className="mt-12 pt-8 border-t border-stone-200/50 flex flex-wrap gap-4 text-xs text-stone-400">
          <Link to="/terms" className="hover:text-stone-600 transition-colors">服务条款</Link>
          <Link to="/privacy" className="hover:text-stone-600 transition-colors">隐私政策</Link>
          <Link to="/" className="hover:text-stone-600 transition-colors">返回首页</Link>
        </div>
      </div>
    </div>
  )
}

