// 仪表盘/首页 - 温暖柔和心理日记风格
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDiaryStore } from '@/store/diaryStore'
import { toast } from '@/components/ui/toast'
import EmotionChart from '@/components/common/EmotionChart'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { diaries, fetchDiaries, fetchEmotionStats, emotionStats, isLoading } = useDiaryStore()
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    topEmotion: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchDiaries({ page: 1, pageSize: 5 }),
      fetchEmotionStats(30),
    ])
  }

  useEffect(() => {
    if (diaries.length > 0) {
      const now = new Date()
      const thisMonth = diaries.filter((d) => {
        const date = new Date(d.diary_date)
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length

      const emotionCounts: Record<string, number> = {}
      diaries.forEach((d) => {
        d.emotion_tags.forEach((tag) => {
          emotionCounts[tag] = (emotionCounts[tag] || 0) + 1
        })
      })

      const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '暂无'

      setStats({
        total: diaries.length,
        thisMonth,
        topEmotion,
      })
    }
  }, [diaries])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 6) return '夜深了'
    if (h < 12) return '早上好'
    if (h < 14) return '中午好'
    if (h < 18) return '下午好'
    return '晚上好'
  }

  if (isLoading && diaries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff8f5, #fdf4ff)' }}>
        <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fff8f5 0%, #fdf4ff 60%, #f5f3ff 100%)' }}>
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-rose-100/60" style={{ background: 'rgba(255,248,245,0.85)' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-15 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                style={{ background: 'linear-gradient(135deg, #fb7185, #c084fc)' }}>印</div>
              <span className="text-stone-700 font-semibold">印记</span>
              <div className="hidden sm:flex items-center gap-0.5 ml-3">
                {[['/', '首页'], ['/diaries', '日记'], ['/timeline', '时间轴']].map(([path, label]) => (
                  <button key={path} onClick={() => navigate(path)}
                    className="px-3 py-1.5 text-sm rounded-xl text-stone-500 hover:text-stone-800 hover:bg-rose-50 transition-all">
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-400 hidden sm:block">
                {user?.username || user?.email?.split('@')[0]}
              </span>
              <button onClick={() => navigate('/settings')}
                className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-100 transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button onClick={handleLogout} className="text-xs text-stone-300 hover:text-stone-500 transition-colors">登出</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        {/* 欢迎横幅 */}
        <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)' }}>
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-30 -translate-y-1/3 translate-x-1/3"
            style={{ background: 'radial-gradient(circle, #f9a8d4, #c4b5fd)' }} />
          <div className="absolute bottom-0 left-1/2 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #fdba74, #fca5a5)' }} />
          <div className="relative">
            <p className="text-rose-400/80 text-sm mb-1">{greeting()} 👋</p>
            <h1 className="text-2xl font-bold text-stone-700 mb-1.5">
              {user?.username || user?.email?.split('@')[0]}
            </h1>
            <p className="text-stone-400 text-sm mb-5">今天想记录些什么呢？</p>
            <button
              onClick={() => navigate('/diaries/new')}
              className="h-10 px-6 rounded-2xl text-sm font-semibold text-white shadow-md transition-all duration-200 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #fb7185, #c084fc)' }}
            >
              ✍️ 开始写日记
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '累计日记', value: stats.total, emoji: '📔', bg: 'from-rose-50 to-pink-50', border: 'border-rose-100', val: 'text-rose-500' },
            { label: '本月记录', value: stats.thisMonth, emoji: '🌙', bg: 'from-violet-50 to-purple-50', border: 'border-violet-100', val: 'text-violet-500' },
            { label: '主要情绪', value: stats.topEmotion || '—', emoji: '🌸', bg: 'from-amber-50 to-orange-50', border: 'border-amber-100', val: 'text-amber-500' },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl bg-gradient-to-br ${item.bg} border ${item.border} p-5`}>
              <span className="text-xl block mb-2">{item.emoji}</span>
              <p className="text-xs text-stone-400 mb-1">{item.label}</p>
              <p className={`text-xl font-bold ${item.val}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '✍️', title: '写日记', desc: '记录今天', bg: 'hover:bg-rose-50 hover:border-rose-200', action: () => navigate('/diaries/new') },
            { icon: '📖', title: '日记本', desc: '浏览记录', bg: 'hover:bg-violet-50 hover:border-violet-200', action: () => navigate('/diaries') },
            { icon: '🌿', title: '时间轴', desc: '回顾历程', bg: 'hover:bg-emerald-50 hover:border-emerald-200', action: () => navigate('/timeline') },
            { icon: '🔮', title: 'AI 分析', desc: '心理洞察', bg: 'hover:bg-amber-50 hover:border-amber-200', action: () => {
              if (diaries.length > 0) navigate(`/analysis/${diaries[0].id}`)
              else toast('请先创建一篇日记', 'info')
            }},
          ].map((item) => (
            <button
              key={item.title}
              onClick={item.action}
              className={`group card-warm p-5 text-left ${item.bg} transition-all duration-200 active:scale-[0.97]`}
            >
              <span className="text-2xl block mb-3">{item.icon}</span>
              <p className="text-sm font-semibold text-stone-700">{item.title}</p>
              <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* 情绪统计图表 */}
        {emotionStats.length > 0 && (
          <div className="card-warm p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💭</span>
              <h2 className="text-sm font-semibold text-stone-700">情绪分布</h2>
            </div>
            <p className="text-xs text-stone-400 mb-4 ml-7">近 30 天的情绪变化</p>
            <EmotionChart data={emotionStats} type="bar" />
          </div>
        )}

        {/* 最近日记 */}
        {diaries.length > 0 && (
          <div className="card-warm overflow-hidden">
            <div className="flex justify-between items-center px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <div>
                  <h2 className="text-sm font-semibold text-stone-700">最近日记</h2>
                  <p className="text-xs text-stone-400">你最近的记录</p>
                </div>
              </div>
              <button onClick={() => navigate('/diaries')}
                className="text-xs text-rose-400 hover:text-rose-500 transition-colors">
                查看全部 →
              </button>
            </div>
            <div className="px-4 pb-4 space-y-1">
              {diaries.slice(0, 4).map((diary) => (
                <div
                  key={diary.id}
                  className="p-4 rounded-2xl hover:bg-rose-50/60 cursor-pointer transition-all duration-200"
                  onClick={() => navigate(`/diaries/${diary.id}`)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-stone-700 truncate pr-4">
                      {diary.title || '无标题'}
                    </h3>
                    <span className="text-[11px] text-stone-300 shrink-0">{diary.diary_date}</span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{diary.content}</p>
                  {diary.emotion_tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {diary.emotion_tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-400 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {diaries.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4 animate-float">🌱</p>
            <p className="text-stone-500 text-sm mb-1.5">还没有任何日记</p>
            <p className="text-stone-300 text-xs mb-6">点击上方按钮，开始你的第一篇吧</p>
          </div>
        )}
      </main>
    </div>
  )
}
