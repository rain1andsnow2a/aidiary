// 产品介绍首页 - Landing Page
import { useNavigate } from 'react-router-dom'
import { Brain, Leaf, Sparkles, Shield, BarChart3, Heart, ChevronRight, Check, BookOpen } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(158deg, #f8f5ef 0%, #f2eef5 58%, #f5f2ee 100%)' }}>
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f5ef]/80 border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/branding/yinji-logo-nanobanana-v1_1.png"
              alt="印记 Logo"
              className="w-8 h-8 rounded-xl object-cover shadow-sm"
            />
            <span className="text-stone-700 text-lg font-semibold">印记</span>
            <span className="text-[10px] text-stone-400 bg-[#f5efea] border border-[#e7dbd5] rounded-full px-2 py-0.5">Beta</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:inline text-sm text-stone-500 hover:text-stone-700 transition-colors px-3 py-1.5">功能</a>
            <a href="#pricing" className="hidden sm:inline text-sm text-stone-500 hover:text-stone-700 transition-colors px-3 py-1.5">定价</a>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-stone-600 hover:text-stone-800 transition-colors px-4 py-2 rounded-xl hover:bg-white/60"
            >
              登录
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-medium text-white px-5 py-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}
            >
              免费开始
            </button>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute top-20 right-[15%] w-80 h-80 rounded-full opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, rgba(163,154,188,0.3), transparent)' }} />
        <div className="absolute bottom-10 left-[10%] w-64 h-64 rounded-full opacity-15 animate-float"
          style={{ animationDelay: '1.2s', background: 'radial-gradient(circle, rgba(232,143,123,0.25), transparent)' }} />

        <div className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#e9e3de] text-xs text-stone-500 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            基于 AI 的智能心理日记
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#3d2b2b' }}>
            你的每一天，<br />
            <span className="text-gradient">都值得被记住</span>
          </h1>

          <p className="text-stone-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            印记是一款基于 AI 深度心理分析的智能日记应用。<br className="hidden sm:block" />
            记录生活，探索内心，让每一段文字都有温度。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto text-sm font-semibold text-white px-8 py-3.5 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}
            >
              免费开始使用
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto text-sm font-medium text-stone-600 px-8 py-3.5 rounded-2xl border border-[#e7dbd5] bg-white/60 hover:bg-white/90 transition-all duration-200"
            >
              已有账号？登录
            </button>
          </div>

          <p className="text-xs text-stone-300 mt-5">无需信用卡 · 免费体验核心功能</p>
        </div>
      </section>

      {/* 功能亮点 */}
      <section id="features" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-stone-800 mb-3">让 AI 成为你的心灵伙伴</h2>
            <p className="text-stone-400 text-sm max-w-lg mx-auto">不只是日记，更是通往内心的桥梁</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Brain className="w-6 h-6 text-[#b56f61]" />,
                title: 'AI 深度分析',
                desc: '基于萨提亚冰山模型，自动解读日记中的情绪、渴望与核心信念，帮你看见内心深处。',
                gradient: 'from-[#fceee9] to-[#f5efea]'
              },
              {
                icon: <Leaf className="w-6 h-6 text-emerald-500" />,
                title: '情绪追踪',
                desc: '可视化你的情绪变化趋势，发现生活中的规律，在情绪波动时给你温柔提醒。',
                gradient: 'from-[#ecf5ec] to-[#f0f5ef]'
              },
              {
                icon: <Sparkles className="w-6 h-6 text-amber-500" />,
                title: '疗愈回应',
                desc: 'AI 生成温暖、富有同理心的反馈，像一位理解你的朋友，给予你情感支持。',
                gradient: 'from-[#fef5e7] to-[#f5f2ee]'
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-violet-500" />,
                title: '成长报告',
                desc: '周度/月度心理成长报告，用数据记录你的变化，见证每一步内在成长。',
                gradient: 'from-[#f0ecf5] to-[#f2eef5]'
              },
              {
                icon: <BookOpen className="w-6 h-6 text-sky-500" />,
                title: '时间线回忆',
                desc: '按时间线浏览所有日记，AI 自动生成摘要标签，让回忆井然有序。',
                gradient: 'from-[#e9f2f8] to-[#eef2f5]'
              },
              {
                icon: <Shield className="w-6 h-6 text-stone-500" />,
                title: '隐私安全',
                desc: '你的日记只属于你。端到端数据保护，严格的隐私政策，绝不出售个人数据。',
                gradient: 'from-[#f0efec] to-[#f3f2f0]'
              },
            ].map((item) => (
              <div key={item.title}
                className={`p-6 rounded-2xl bg-gradient-to-br ${item.gradient} border border-white/60 hover:shadow-md transition-all duration-300 group`}
              >
                <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-stone-700 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 定价区域 */}
      <section id="pricing" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-stone-800 mb-3">简单透明的定价</h2>
            <p className="text-stone-400 text-sm max-w-lg mx-auto">选择适合你的方案，随时升级或取消</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* 免费版 */}
            <div className="p-7 rounded-2xl bg-white/70 border border-[#e9e3de] hover:shadow-md transition-all duration-300">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-stone-700">免费版</h3>
                <p className="text-xs text-stone-400 mt-1">体验核心功能</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-stone-800">¥0</span>
                <span className="text-sm text-stone-400 ml-1">/月</span>
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  '每月 10 篇 AI 分析',
                  '基础情绪追踪',
                  '7 天数据留存',
                  '基础疗愈回应',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-stone-500">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full h-11 rounded-xl text-sm font-medium text-stone-600 border border-[#e7dbd5] bg-[#f6f1ec] hover:bg-[#efe8e2] transition-all duration-200"
              >
                免费开始
              </button>
            </div>

            {/* 标准版 - 推荐 */}
            <div className="p-7 rounded-2xl bg-white border-2 border-[#e88f7b]/30 hover:shadow-lg transition-all duration-300 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}>
                推荐
              </div>
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-stone-700">标准版</h3>
                <p className="text-xs text-stone-400 mt-1">深度探索自己</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-stone-800">¥19.9</span>
                <span className="text-sm text-stone-400 ml-1">/月</span>
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  '无限 AI 深度分析',
                  '完整情绪追踪图表',
                  '无限数据留存',
                  '个性化疗愈回应',
                  '周度/月度成长报告',
                  '萨提亚冰山模型解析',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-stone-500">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] shadow-sm"
                style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}
              >
                立即订阅
              </button>
            </div>

            {/* 年度版 */}
            <div className="p-7 rounded-2xl bg-white/70 border border-[#e9e3de] hover:shadow-md transition-all duration-300">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-stone-700">年度版</h3>
                <p className="text-xs text-stone-400 mt-1">更优惠的年付方案</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-stone-800">¥168</span>
                <span className="text-sm text-stone-400 ml-1">/年</span>
                <div className="inline-block ml-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">
                  省 ¥70.8
                </div>
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  '标准版全部功能',
                  '优先体验新功能',
                  '专属数据导出',
                  '优先客服支持',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-stone-500">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full h-11 rounded-xl text-sm font-medium text-stone-600 border border-[#e7dbd5] bg-[#f6f1ec] hover:bg-[#efe8e2] transition-all duration-200"
              >
                年度订阅
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-white/60 border border-[#e9e3de] backdrop-blur-sm">
            <Heart className="w-10 h-10 text-[#e88f7b] mx-auto mb-5" />
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4">
              开始记录，遇见更好的自己
            </h2>
            <p className="text-stone-400 text-sm mb-8 max-w-md mx-auto">
              从今天起，让文字成为通往内心的桥梁。AI 会随着每一篇日记，更了解你。
            </p>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-semibold text-white px-8 py-3.5 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}
            >
              免费创建账号
            </button>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-10 border-t border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/branding/yinji-logo-nanobanana-v1_1.png"
                alt="印记 Logo"
                className="w-6 h-6 rounded-lg object-cover"
              />
              <span className="text-stone-500 text-sm">印记 © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-stone-400">
              <a href="/terms" className="hover:text-stone-600 transition-colors">服务条款</a>
              <a href="/privacy" className="hover:text-stone-600 transition-colors">隐私政策</a>
              <a href="/refund" className="hover:text-stone-600 transition-colors">退款政策</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
