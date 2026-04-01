// 隐私政策页面
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(158deg, #f8f5ef 0%, #f2eef5 58%, #f5f2ee 100%)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* 顶栏 */}
        <div className="flex items-center gap-3 mb-10">
          <Link to="/" className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>

        <article className="prose-stone">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">隐私政策</h1>
          <p className="text-sm text-stone-400 mb-10">最后更新：2025 年 4 月 1 日</p>

          <div className="space-y-8 text-sm text-stone-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">1. 引言</h2>
              <p>
                印记（"我们"、"我们的"）深知个人隐私的重要性。本隐私政策说明了我们在您使用印记智能日记应用（"服务"）时，如何收集、使用、存储和保护您的个人信息。
              </p>
              <p className="mt-2">
                使用我们的服务即表示您同意本隐私政策中描述的做法。如果您不同意本政策，请勿使用我们的服务。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">2. 我们收集的信息</h2>
              <h3 className="text-base font-medium text-stone-600 mb-2">2.1 您主动提供的信息</h3>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong>账户信息：</strong>注册时提供的邮箱地址、用户名（可选）、密码。</li>
                <li><strong>日记内容：</strong>您在服务中撰写的日记文本及相关内容。</li>
                <li><strong>个人画像：</strong>您选择提供的 MBTI 类型、社交风格等个人信息。</li>
              </ul>

              <h3 className="text-base font-medium text-stone-600 mb-2 mt-4">2.2 自动收集的信息</h3>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong>使用数据：</strong>服务使用频率、功能使用情况等匿名统计数据。</li>
                <li><strong>设备信息：</strong>浏览器类型、操作系统等基本设备信息。</li>
                <li><strong>日志数据：</strong>服务器日志，包括 IP 地址、访问时间等。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">3. 信息使用方式</h2>
              <p>我们使用收集的信息用于：</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
                <li>提供和维护服务功能，包括 AI 日记分析和情绪追踪。</li>
                <li>改进和优化服务体验。</li>
                <li>发送服务相关通知（如验证码、重要更新）。</li>
                <li>防止欺诈和滥用行为。</li>
                <li>遵守法律法规要求。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">4. AI 分析与数据处理</h2>
              <p>
                印记使用人工智能技术对您的日记进行情绪分析和心理洞察。请注意：
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
                <li>AI 分析仅用于为您提供个性化的心理洞察和建议。</li>
                <li>您的日记内容不会被用于训练通用 AI 模型。</li>
                <li>AI 分析结果仅供参考，不构成专业心理咨询或医疗建议。</li>
                <li>我们对 AI 分析使用的第三方服务提供商有严格的数据处理协议。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">5. 数据存储与安全</h2>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>您的数据存储在安全的服务器上，采用加密传输（HTTPS）。</li>
                <li>密码使用单向哈希加密存储，我们无法获取您的明文密码。</li>
                <li>我们定期审查安全措施，并及时修复已知安全漏洞。</li>
                <li>尽管我们采取合理措施保护您的数据，但无法保证互联网传输 100% 安全。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">6. 数据共享</h2>
              <p>我们<strong>不会</strong>出售您的个人信息。我们仅在以下情况下共享您的数据：</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
                <li>获得您的明确同意。</li>
                <li>为提供服务所必需的第三方服务商（如 AI 分析、邮件服务），且受严格数据协议约束。</li>
                <li>法律法规要求或司法、行政机关的合法要求。</li>
                <li>保护我们、用户或公众的权利、财产或安全所必需。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">7. 您的权利</h2>
              <p>您有权：</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
                <li><strong>访问：</strong>查看和导出您的个人数据。</li>
                <li><strong>更正：</strong>修改不准确的个人信息。</li>
                <li><strong>删除：</strong>请求删除您的账户和相关数据。</li>
                <li><strong>撤回同意：</strong>随时停止使用服务。</li>
              </ul>
              <p className="mt-2">如需行使上述权利，请通过设置页面操作或联系我们。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">8. Cookie 政策</h2>
              <p>
                我们使用必要的 Cookie 和本地存储来维持登录状态和基本服务功能。我们不使用第三方跟踪 Cookie 进行广告投放。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">9. 未成年人保护</h2>
              <p>
                我们的服务不面向 16 周岁以下的未成年人。如果我们发现未经家长或监护人同意收集了未成年人的信息，我们将尽快删除相关数据。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">10. 隐私政策变更</h2>
              <p>
                我们可能会不时更新本隐私政策。重大变更将通过服务内通知或邮件告知您。继续使用服务即表示您接受更新后的政策。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">11. 联系我们</h2>
              <p>
                如果您对本隐私政策有任何疑问或意见，请通过以下方式联系我们：
              </p>
              <p className="mt-2">
                邮箱：<a href="mailto:support@yinji.app" className="text-[#b56f61] hover:underline">support@yinji.app</a>
              </p>
            </section>
          </div>
        </article>

        {/* 底部导航 */}
        <div className="mt-12 pt-8 border-t border-stone-200/50 flex flex-wrap gap-4 text-xs text-stone-400">
          <Link to="/terms" className="hover:text-stone-600 transition-colors">服务条款</Link>
          <Link to="/refund" className="hover:text-stone-600 transition-colors">退款政策</Link>
          <Link to="/" className="hover:text-stone-600 transition-colors">返回首页</Link>
        </div>
      </div>
    </div>
  )
}
