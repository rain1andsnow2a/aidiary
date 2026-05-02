// 映光资产页：映光/护盾/星球/流水
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Shield, Orbit, PenLine, Award, TrendingUp } from 'lucide-react'
import { diaryService } from '@/services/diary.service'
import type { TreasureResponse, LightPointLedgerEntry } from '@/types/diary'

const EMOTION_LABEL: Record<string, string> = {
  happy: '开心',
  calm: '平静',
  neutral: '一般',
  sad: '低落',
  anxious: '焦虑',
  angry: '烦躁',
  exhausted: '疲惫',
  rest: '休息',
}

function reasonLabel(reason: string, meta: Record<string, any> | null): string {
  if (reason === 'checkin') return '心灯签到'
  if (reason === 'one_line') return '写下一句心情'
  if (reason === 'planet_unlock') {
    const planet = meta?.planet
    const label = planet ? EMOTION_LABEL[planet] || planet : ''
    return label ? `首次解锁「${label}」星球` : '首次解锁情绪星球'
  }
  return reason
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  return value
}

export default function TreasurePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<TreasureResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    diaryService
      .getTreasure()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || '加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(158deg, #fbf7f2 0%, #f4efea 62%, #f8f2ec 100%)' }}
    >
      <header className="sticky top-0 z-30 border-b border-[#ead9cd]/70 bg-[rgba(251,247,242,0.9)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-stone-400 hover:text-stone-600"
          >
            ← 首页
          </button>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-600">
            <Sparkles className="h-4 w-4 text-[#b56f61]" /> 映光资产
          </span>
          <button
            onClick={() => navigate('/heart-light')}
            className="text-sm font-semibold text-[#b56f61] hover:text-[#9c5e52]"
          >
            去点亮 →
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#eaded8] border-t-[#d9796f]" />
          </div>
        )}
        {error && !loading && (
          <div className="rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center text-sm text-red-500">
            {error}
          </div>
        )}
        {!loading && data && (
          <>
            <HeroSection data={data} />
            <TrendRow data={data} />
            <ByReasonCard data={data} />
            <LedgerSection ledger={data.recent_ledger} count={data.all_time_count} />
          </>
        )}
      </main>
    </div>
  )
}

function HeroSection({ data }: { data: TreasureResponse }) {
  return (
    <section className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
      <div className="relative overflow-hidden rounded-[28px] border border-[#eadfd8] bg-[linear-gradient(135deg,#fffaf2,#ffefe4_55%,#f6ecff)] p-6 shadow-[0_18px_52px_rgba(115,84,69,0.08)]">
        <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-white/40 blur-xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/78 text-[#c47a61]">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-500">累计映光</p>
            <p className="text-4xl font-bold text-[#b56f61]">{data.total}</p>
          </div>
        </div>
        <p className="relative mt-4 text-sm leading-6 text-stone-500">
          已记录 {data.all_time_count} 条映光流水。每一次轻轻回来，都是沉淀。
        </p>
      </div>

      <div className="rounded-[28px] border border-[#eadfd8] bg-white/82 p-6 shadow-[0_18px_52px_rgba(115,84,69,0.06)]">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef7f1] text-[#4bbf88]">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-500">心灯护盾</p>
            <p className="text-2xl font-bold text-stone-800">
              {data.shield.balance}
              <span className="ml-1 text-sm font-medium text-stone-400">/ {data.shield.max}</span>
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-stone-500">
          每连续点亮 7 天奖励一个；忘记记录的那天会自动使用护盾，保住连续。
        </p>
      </div>

      <div className="rounded-[28px] border border-[#eadfd8] bg-white/82 p-6 shadow-[0_18px_52px_rgba(115,84,69,0.06)]">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eeff] text-[#8f65e8]">
            <Orbit className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-500">情绪星球</p>
            <p className="text-2xl font-bold text-stone-800">
              {data.planets.unlocked}
              <span className="ml-1 text-sm font-medium text-stone-400">/ {data.planets.total}</span>
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-stone-500">
          每一种情绪首次出现都会解锁一颗星球，并获得 +20 映光奖励。
        </p>
      </div>
    </section>
  )
}

function TrendRow({ data }: { data: TreasureResponse }) {
  const items = [
    {
      icon: <TrendingUp />,
      label: '本周映光',
      value: data.this_week_points,
      hint: '周一起算',
      tone: 'text-[#4bbf88]',
      bg: 'bg-[#eef7f1]',
    },
    {
      icon: <TrendingUp />,
      label: '本月映光',
      value: data.this_month_points,
      hint: '月初至今',
      tone: 'text-[#c47a61]',
      bg: 'bg-[#fbece3]',
    },
    {
      icon: <Award />,
      label: '单日峰值',
      value: data.top_day.points,
      hint: formatDate(data.top_day.date),
      tone: 'text-[#b78a3b]',
      bg: 'bg-[#fbf4e4]',
    },
    {
      icon: <Award />,
      label: '单周峰值',
      value: data.top_week.points,
      hint: data.top_week.week_start ? `自 ${data.top_week.week_start}` : '—',
      tone: 'text-[#8f65e8]',
      bg: 'bg-[#f3eeff]',
    },
  ]
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-[#eadfd8] bg-white/82 p-4 shadow-[0_10px_28px_rgba(115,84,69,0.05)]"
        >
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.tone} [&_svg]:h-5 [&_svg]:w-5`}>
              {item.icon}
            </span>
            <div>
              <p className="text-xs font-semibold text-stone-500">{item.label}</p>
              <p className="text-xl font-bold text-stone-800">{item.value}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-stone-400">{item.hint}</p>
        </div>
      ))}
    </section>
  )
}

function ByReasonCard({ data }: { data: TreasureResponse }) {
  const total = Math.max(
    data.by_reason.checkin + data.by_reason.one_line + data.by_reason.planet_unlock,
    1,
  )
  const segments = [
    { label: '签到', value: data.by_reason.checkin, color: '#f6b95c', icon: <Sparkles /> },
    { label: '写一句', value: data.by_reason.one_line, color: '#d58aa5', icon: <PenLine /> },
    { label: '首解行星', value: data.by_reason.planet_unlock, color: '#8f65e8', icon: <Orbit /> },
  ]
  return (
    <section className="rounded-[28px] border border-[#eadfd8] bg-white/82 p-6 shadow-[0_14px_40px_rgba(115,84,69,0.06)]">
      <h2 className="mb-5 text-lg font-bold text-stone-800">映光来源</h2>
      <div className="mb-5 flex h-3 w-full overflow-hidden rounded-full bg-[#f3ede7]">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
            className="h-full transition-all"
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {segments.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between rounded-2xl bg-[#faf5ef] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white [&_svg]:h-4 [&_svg]:w-4"
                style={{ background: s.color }}
              >
                {s.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-stone-700">{s.label}</p>
                <p className="text-xs text-stone-400">
                  {total > 0 ? Math.round((s.value / total) * 100) : 0}%
                </p>
              </div>
            </div>
            <span className="text-xl font-bold text-stone-800">{s.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function LedgerSection({ ledger, count }: { ledger: LightPointLedgerEntry[]; count: number }) {
  return (
    <section className="rounded-[28px] border border-[#eadfd8] bg-white/82 p-6 shadow-[0_14px_40px_rgba(115,84,69,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-800">映光流水</h2>
        <span className="text-xs text-stone-400">共 {count} 条，展示最近 {ledger.length} 条</span>
      </div>
      {ledger.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-400">
          还没有映光流水。从点亮第一盏心灯开始吧。
        </p>
      ) : (
        <ul className="space-y-2">
          {ledger.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded-2xl bg-[#faf5ef] px-4 py-3 text-sm"
            >
              <div>
                <div className="font-semibold text-stone-700">
                  {reasonLabel(row.reason, row.meta)}
                </div>
                <div className="text-xs text-stone-400">
                  {row.ref_date} · {row.created_at.slice(0, 10)}
                </div>
              </div>
              <span
                className={`text-lg font-bold ${
                  row.delta > 0 ? 'text-[#c47a61]' : 'text-stone-500'
                }`}
              >
                {row.delta > 0 ? '+' : ''}
                {row.delta}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
