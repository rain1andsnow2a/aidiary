// 产品介绍首页 - Landing Page
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Brain, Leaf, Sparkles, Shield, BarChart3, Heart, ChevronRight, Check, BookOpen } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(158deg, #f8f5ef 0%, #f2eef5 58%, #f5f2ee 100%)' }}>
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f5ef]/80 border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/yingji_logo_2_healing_1_no_bg.png"
              alt={t('landing.logoAlt')}
              className="w-8 h-8 rounded-xl object-cover shadow-sm"
            />
            <span className="text-stone-700 text-lg font-semibold">{t('landing.brandName')}</span>
            <span className="text-[10px] text-stone-400 bg-[#f5efea] border border-[#e7dbd5] rounded-full px-2 py-0.5">Beta</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:inline text-sm text-stone-500 hover:text-stone-700 transition-colors px-3 py-1.5">{t('landing.nav.features')}</a>
            <a href="#pricing" className="hidden sm:inline text-sm text-stone-500 hover:text-stone-700 transition-colors px-3 py-1.5">{t('landing.nav.pricing')}</a>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-stone-600 hover:text-stone-800 transition-colors px-4 py-2 rounded-xl hover:bg-white/60"
            >
              {t('common.login')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-medium text-white px-5 py-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}
            >
              {t('landing.freeStart')}
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
            {t('landing.hero.badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#3d2b2b' }}>
            {t('landing.hero.titleLine1')}<br />
            <span className="text-gradient">{t('landing.hero.titleLine2')}</span>
          </h1>

          <p className="text-stone-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            {t('landing.hero.desc1')}<br className="hidden sm:block" />
            {t('landing.hero.desc2')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto text-sm font-semibold text-white px-8 py-3.5 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}
            >
              {t('landing.hero.startFree')}
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto text-sm font-medium text-stone-600 px-8 py-3.5 rounded-2xl border border-[#e7dbd5] bg-white/60 hover:bg-white/90 transition-all duration-200"
            >
              {t('landing.hero.hasAccount')}
            </button>
          </div>

          <p className="text-xs text-stone-300 mt-5">{t('landing.hero.noCreditCard')}</p>
        </div>
      </section>

      {/* 功能亮点 */}
      <section id="features" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-stone-800 mb-3">{t('landing.features.title')}</h2>
            <p className="text-stone-400 text-sm max-w-lg mx-auto">{t('landing.features.subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Brain className="w-6 h-6 text-[#b56f61]" />,
                titleKey: 'landing.features.aiAnalysis',
                descKey: 'landing.features.aiAnalysisDesc',
                gradient: 'from-[#fceee9] to-[#f5efea]'
              },
              {
                icon: <Leaf className="w-6 h-6 text-emerald-500" />,
                titleKey: 'landing.features.emotionTracking',
                descKey: 'landing.features.emotionTrackingDesc',
                gradient: 'from-[#ecf5ec] to-[#f0f5ef]'
              },
              {
                icon: <Sparkles className="w-6 h-6 text-amber-500" />,
                titleKey: 'landing.features.healing',
                descKey: 'landing.features.healingDesc',
                gradient: 'from-[#fef5e7] to-[#f5f2ee]'
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-violet-500" />,
                titleKey: 'landing.features.growthReport',
                descKey: 'landing.features.growthReportDesc',
                gradient: 'from-[#f0ecf5] to-[#f2eef5]'
              },
              {
                icon: <BookOpen className="w-6 h-6 text-sky-500" />,
                titleKey: 'landing.features.timelineMemory',
                descKey: 'landing.features.timelineMemoryDesc',
                gradient: 'from-[#e9f2f8] to-[#eef2f5]'
              },
              {
                icon: <Shield className="w-6 h-6 text-stone-500" />,
                titleKey: 'landing.features.privacy',
                descKey: 'landing.features.privacyDesc',
                gradient: 'from-[#f0efec] to-[#f3f2f0]'
              },
            ].map((item) => (
              <div key={item.titleKey}
                className={`p-6 rounded-2xl bg-gradient-to-br ${item.gradient} border border-white/60 hover:shadow-md transition-all duration-300 group`}
              >
                <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-stone-700 mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{t(item.descKey)}</p>
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
            <h2 className="text-3xl font-bold text-stone-800 mb-3">{t('landing.pricing.title')}</h2>
            <p className="text-stone-400 text-sm max-w-lg mx-auto">{t('landing.pricing.subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* 免费版 */}
            <div className="p-7 rounded-2xl bg-white/70 border border-[#e9e3de] hover:shadow-md transition-all duration-300">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-stone-700">{t('landing.pricing.free.name')}</h3>
                <p className="text-xs text-stone-400 mt-1">{t('landing.pricing.free.desc')}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-stone-800">¥0</span>
                <span className="text-sm text-stone-400 ml-1">/{t('landing.pricing.month')}</span>
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  t('landing.pricing.free.f1'),
                  t('landing.pricing.free.f2'),
                  t('landing.pricing.free.f3'),
                  t('landing.pricing.free.f4'),
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
                {t('landing.freeStart')}
              </button>
            </div>

            {/* 标准版 - 推荐 */}
            <div className="p-7 rounded-2xl bg-white border-2 border-[#e88f7b]/30 hover:shadow-lg transition-all duration-300 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}>
                {t('landing.pricing.recommended')}
              </div>
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-stone-700">{t('landing.pricing.standard.name')}</h3>
                <p className="text-xs text-stone-400 mt-1">{t('landing.pricing.standard.desc')}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-stone-800">¥19.9</span>
                <span className="text-sm text-stone-400 ml-1">/{t('landing.pricing.month')}</span>
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  t('landing.pricing.standard.f1'),
                  t('landing.pricing.standard.f2'),
                  t('landing.pricing.standard.f3'),
                  t('landing.pricing.standard.f4'),
                  t('landing.pricing.standard.f5'),
                  t('landing.pricing.standard.f6'),
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
                {t('landing.pricing.subscribe')}
              </button>
            </div>

            {/* 年度版 */}
            <div className="p-7 rounded-2xl bg-white/70 border border-[#e9e3de] hover:shadow-md transition-all duration-300">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-stone-700">{t('landing.pricing.yearly.name')}</h3>
                <p className="text-xs text-stone-400 mt-1">{t('landing.pricing.yearly.desc')}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-stone-800">¥168</span>
                <span className="text-sm text-stone-400 ml-1">/{t('landing.pricing.year')}</span>
                <div className="inline-block ml-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">
                  {t('landing.pricing.yearly.save')}
                </div>
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  t('landing.pricing.yearly.f1'),
                  t('landing.pricing.yearly.f2'),
                  t('landing.pricing.yearly.f3'),
                  t('landing.pricing.yearly.f4'),
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
                {t('landing.pricing.yearlySubscribe')}
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
              {t('landing.cta.title')}
            </h2>
            <p className="text-stone-400 text-sm mb-8 max-w-md mx-auto">
              {t('landing.cta.desc')}
            </p>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-semibold text-white px-8 py-3.5 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}
            >
              {t('landing.cta.button')}
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
                src="/yingji_logo_2_healing_1_no_bg.png"
                alt={t('landing.logoAlt')}
                className="w-6 h-6 rounded-lg object-cover"
              />
              <span className="text-stone-500 text-sm">{t('landing.brandName')} © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-stone-400">
              <a href="/terms" className="hover:text-stone-600 transition-colors">{t('landing.footer.terms')}</a>
              <a href="/privacy" className="hover:text-stone-600 transition-colors">{t('landing.footer.privacy')}</a>
              <a href="/refund" className="hover:text-stone-600 transition-colors">{t('landing.footer.refund')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
