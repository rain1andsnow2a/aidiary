import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiService } from '@/services/ai.service'
import { Loading } from '@/components/common/Loading'
import type { ComprehensiveAnalysisResponse } from '@/types/analysis'
import { Sparkles, Calendar, TrendingUp, Lightbulb, BookOpen } from 'lucide-react'

export default function AnalysisOverview() {
  const navigate = useNavigate()
  const [windowDays, setWindowDays] = useState(90)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ComprehensiveAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await aiService.comprehensiveAnalysis({ window_days: windowDays, max_diaries: 120 })
      setResult(data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || '综合分析失败')
    } finally {
      setIsLoading(false)
    }
  }

  const chip = 'text-xs px-3 py-1.5 rounded-2xl bg-[#f5efea] text-[#b56f61] border border-[#e7dbd5]'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(158deg, #f8f5ef 0%, #f2eef5 58%, #f5f2ee 100%)' }}>
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-stone-200/70" style={{ background: 'rgba(248,245,239,0.88)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center py-3.5">
            <button onClick={() => navigate('/')} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">← 返回</button>
            <span className="text-sm font-semibold text-stone-600 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#b56f61]" /> 综合分析</span>
            <div className="w-12" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        <div className="card-warm p-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-stone-600">分析窗口</span>
            {[30, 90, 180].map((d) => (
              <button
                key={d}
                onClick={() => setWindowDays(d)}
                className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${windowDays === d ? 'text-white border-transparent' : 'text-stone-500 border-stone-200 bg-white'}`}
                style={windowDays === d ? { background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' } : undefined}
              >
                近 {d} 天
              </button>
            ))}
            <button
              onClick={runAnalysis}
              disabled={isLoading}
              className="ml-auto h-10 px-5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #e88f7b, #a09ab8)' }}
            >
              {isLoading ? '分析中...' : '开始综合分析'}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="card-warm p-10 text-center">
            <Loading size="lg" />
            <p className="mt-4 text-stone-500 text-sm">正在检索历史日记并生成综合洞察...</p>
          </div>
        )}

        {error && <div className="card-warm p-4 text-sm text-red-400">{error}</div>}

        {result && (
          <div className="space-y-5">
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#b56f61]" />
                <h3 className="text-sm font-semibold text-stone-700">综合总结</h3>
              </div>
              <p className="text-sm text-stone-600 leading-7">{result.summary}</p>
              <p className="text-xs text-stone-300 mt-3">
                范围：{result.metadata.period.start_date} 至 {result.metadata.period.end_date} · {result.metadata.analyzed_diary_count} 篇
              </p>
            </div>

            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-violet-400" /><h3 className="text-sm font-semibold text-stone-700">主题与趋势</h3></div>
              <div className="flex flex-wrap gap-2 mb-4">{result.key_themes.map((t, i) => <span key={i} className={chip}>{t}</span>)}</div>
              <ul className="space-y-2 text-sm text-stone-600">
                {result.emotion_trends.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>

            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-amber-500" /><h3 className="text-sm font-semibold text-stone-700">连续信号与转折点</h3></div>
              <ul className="space-y-2 text-sm text-stone-600 mb-4">
                {result.continuity_signals.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
              <ul className="space-y-2 text-sm text-stone-600">
                {result.turning_points.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>

            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-[#b56f61]" /><h3 className="text-sm font-semibold text-stone-700">可执行建议</h3></div>
              <ul className="space-y-2 text-sm text-stone-600">
                {result.growth_suggestions.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
