// Streak 可视化：本周心灯链 + 历史记录
import { useMemo, useState } from 'react'
import type { CareProgress } from '@/types/diary'
import { Flame, Sparkles, ShieldCheck } from 'lucide-react'

const BEST_KEY = 'yinji.heartlight.bestStreak'

function readBestStreak(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) || 0) || 0
  } catch {
    return 0
  }
}

function writeBestStreak(value: number) {
  try {
    localStorage.setItem(BEST_KEY, String(value))
  } catch {}
}

type Status = 'ACTIVE' | 'REST' | 'SHIELDED' | 'MISSED' | 'PENDING'

function statusOf(date: string, recent: { date: string; status: string }[]): Status {
  const hit = recent.find((r) => r.date === date)
  return ((hit?.status as Status) || 'PENDING')
}

function buildLastNDays(n: number): string[] {
  const out: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export default function StreakFlame({ progress }: { progress: CareProgress | null }) {
  const [expanded, setExpanded] = useState(false)
  const protectedStreak = progress?.protected_streak ?? 0
  const recent = progress?.recent_statuses ?? []

  const best = useMemo(() => {
    const stored = readBestStreak()
    if (protectedStreak > stored) {
      writeBestStreak(protectedStreak)
      return protectedStreak
    }
    return stored
  }, [protectedStreak])

  const week7 = useMemo(() => buildLastNDays(7), [])
  const days14 = useMemo(() => buildLastNDays(14), [])

  const tilFloor = (() => {
    if (protectedStreak === 0) return '点亮第 1 天，开启连续记录'
    if (best <= protectedStreak) return `当前连续 ${protectedStreak} 天，正在创造个人新纪录`
    const gap = best - protectedStreak + 1
    return `再 ${gap} 天就能追平你的最佳纪录 (${best} 天)`
  })()

  return (
    <section className="rounded-3xl border border-[#eadfd8] bg-white/85 p-5 shadow-[0_14px_40px_rgba(122,83,73,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4dc]">
            <Flame className="h-7 w-7 text-[#e9744f]" />
            <span className="absolute -bottom-1 -right-1 rounded-full bg-[#f58b7d] px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
              {protectedStreak}
            </span>
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-500">连续心灯</p>
            <p className="text-2xl font-bold tracking-normal text-stone-800">{protectedStreak} 天</p>
            <p className="mt-0.5 text-xs text-[#9a8b84]">{tilFloor}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-xl border border-[#eadfd8] bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-[#fff8f4]"
        >
          {expanded ? '收起' : '查看 14 天'}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {week7.map((d) => {
          const s = statusOf(d, recent)
          const isToday = d === week7[week7.length - 1]
          const dayLabel = ['日', '一', '二', '三', '四', '五', '六'][new Date(d).getDay()]
          return (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <FlameNode status={s} isToday={isToday} />
              <span className={`text-[10px] ${isToday ? 'font-bold text-[#b56f61]' : 'text-stone-400'}`}>{dayLabel}</span>
            </div>
          )
        })}
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-7 gap-1 rounded-2xl bg-[#fdf7f3] p-3">
          {days14.map((d) => {
            const s = statusOf(d, recent)
            return (
              <div key={d} title={`${d} ${s}`} className="flex flex-col items-center gap-1">
                <span className={`h-3 w-3 rounded-sm ${dotClass(s)}`} />
                <span className="text-[9px] text-stone-300">{d.slice(5)}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8f4] px-2.5 py-1">
          <Sparkles className="h-3 w-3 text-[#e9744f]" /> 历史最佳 {best} 天
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f1ff] px-2.5 py-1">
          <ShieldCheck className="h-3 w-3 text-[#8f7bd0]" /> 心灯护盾 {progress?.shield_balance ?? 0}/{progress?.shield_max ?? 3}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#fffaf3] px-2.5 py-1">
          本周 {progress?.weekly_active_count ?? 0}/{progress?.weekly_goal ?? 3}
        </span>
      </div>
    </section>
  )
}

function FlameNode({ status, isToday }: { status: Status; isToday: boolean }) {
  const base = 'flex h-9 w-9 items-center justify-center rounded-full text-base transition-all'
  const ring = isToday ? 'ring-2 ring-[#f58b7d] ring-offset-2 ring-offset-white' : ''
  if (status === 'ACTIVE') return <span className={`${base} ${ring} bg-[linear-gradient(135deg,#ffb88c,#ff7a59)] text-white shadow`}>🔥</span>
  if (status === 'SHIELDED') return <span className={`${base} ${ring} bg-[#f1ebff] text-[#7d6dc8]`}>🛡</span>
  if (status === 'REST') return <span className={`${base} ${ring} bg-[#fff4dc] text-[#caa05b]`}>🌙</span>
  if (status === 'MISSED') return <span className={`${base} ${ring} bg-stone-100 text-stone-300`}>·</span>
  return <span className={`${base} ${ring} border border-dashed border-[#eadfd8] bg-white text-stone-300`}>·</span>
}

function dotClass(s: Status) {
  if (s === 'ACTIVE') return 'bg-[#ff7a59]'
  if (s === 'SHIELDED') return 'bg-[#a496e5]'
  if (s === 'REST') return 'bg-[#caa05b]'
  if (s === 'MISSED') return 'bg-stone-200'
  return 'bg-stone-100'
}
