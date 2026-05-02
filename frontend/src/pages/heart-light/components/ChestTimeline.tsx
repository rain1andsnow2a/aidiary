// 周宝箱 + 月勋章
import { useEffect, useMemo, useState } from 'react'
import type { CareProgress } from '@/types/diary'
import { Gift, Medal, Sparkles } from 'lucide-react'

const CHEST_PREFIX = 'yinji.heartlight.chest'
const MEDAL_PREFIX = 'yinji.heartlight.medal'

function weekKey(weekStart: string) {
  return `${CHEST_PREFIX}.${weekStart}`
}

function monthKey() {
  const now = new Date()
  return `${MEDAL_PREFIX}.${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function isMarked(key: string) {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function mark(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {}
}

export default function ChestTimeline({ progress }: { progress: CareProgress | null }) {
  const weeklyGoal = progress?.weekly_goal ?? 3
  const weeklyActive = progress?.weekly_active_count ?? 0
  const weekStart = progress?.week_start ?? ''
  const weekPct = Math.min(100, Math.round((weeklyActive / weeklyGoal) * 100))
  const weekUnlocked = weeklyActive >= weeklyGoal
  const weekKeyVal = useMemo(() => weekKey(weekStart), [weekStart])
  const [weekPlayed, setWeekPlayed] = useState(() => isMarked(weekKeyVal))

  // 当月 ACTIVE 天数（来自 recent_statuses 中当月 ACTIVE/SHIELDED 计入）
  const monthActiveDays = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    return (progress?.recent_statuses ?? []).filter((r) => {
      if (r.status !== 'ACTIVE') return false
      const [yy, mm] = r.date.split('-').map(Number)
      return yy === y && mm === m + 1
    }).length
  }, [progress])

  const medalGoal = 20
  const medalPct = Math.min(100, Math.round((monthActiveDays / medalGoal) * 100))
  const medalUnlocked = monthActiveDays >= medalGoal
  const medalKey = monthKey()
  const [medalPlayed, setMedalPlayed] = useState(() => isMarked(medalKey))

  useEffect(() => {
    if (weekUnlocked && !weekPlayed) {
      mark(weekKeyVal)
      setWeekPlayed(true)
    }
  }, [weekUnlocked, weekPlayed, weekKeyVal])

  useEffect(() => {
    if (medalUnlocked && !medalPlayed) {
      mark(medalKey)
      setMedalPlayed(true)
    }
  }, [medalUnlocked, medalPlayed, medalKey])

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <ChestCard
        title="本周宝箱"
        subtitle={`${weeklyActive}/${weeklyGoal} 次轻记录`}
        pct={weekPct}
        unlocked={weekUnlocked}
        unlockedText="已开启 · 获得情绪卡牌"
        lockedText={`再 ${Math.max(0, weeklyGoal - weeklyActive)} 次解锁本周宝箱`}
        icon={<Gift className="h-6 w-6" />}
        gradient="from-[#ffd9c2] to-[#ffb38c]"
        celebrate={weekUnlocked}
      />
      <ChestCard
        title="月度勋章"
        subtitle={`${monthActiveDays}/${medalGoal} 天连续在场`}
        pct={medalPct}
        unlocked={medalUnlocked}
        unlockedText="恒心勋章已点亮"
        lockedText={`再 ${Math.max(0, medalGoal - monthActiveDays)} 天获得本月勋章`}
        icon={<Medal className="h-6 w-6" />}
        gradient="from-[#e5d7ff] to-[#b6a2ea]"
        celebrate={medalUnlocked}
      />
    </section>
  )
}

function ChestCard({
  title,
  subtitle,
  pct,
  unlocked,
  unlockedText,
  lockedText,
  icon,
  gradient,
  celebrate,
}: {
  title: string
  subtitle: string
  pct: number
  unlocked: boolean
  unlockedText: string
  lockedText: string
  icon: React.ReactNode
  gradient: string
  celebrate: boolean
}) {
  return (
    <article className={`relative overflow-hidden rounded-3xl border border-[#eadfd8] p-5 shadow-[0_14px_40px_rgba(122,83,73,0.08)] ${unlocked ? `bg-gradient-to-br ${gradient}` : 'bg-white/82'}`}>
      {celebrate && (
        <span className="pointer-events-none absolute right-3 top-3 animate-pulse">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
      )}
      <div className="flex items-start gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${unlocked ? 'bg-white/70 text-[#b56f61]' : 'bg-[#fff4dc] text-[#c47a4f]'}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`text-base font-bold ${unlocked ? 'text-white' : 'text-stone-700'}`}>{title}</h3>
          <p className={`mt-0.5 text-xs ${unlocked ? 'text-white/80' : 'text-stone-400'}`}>{subtitle}</p>
          <div className={`mt-3 h-2 w-full overflow-hidden rounded-full ${unlocked ? 'bg-white/35' : 'bg-[#f6ede8]'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${unlocked ? 'bg-white' : 'bg-[linear-gradient(90deg,#f58b7d,#b19adc)]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className={`mt-2 text-xs font-semibold ${unlocked ? 'text-white' : 'text-[#b56f61]'}`}>
            {unlocked ? unlockedText : lockedText}
          </p>
        </div>
      </div>
    </article>
  )
}
