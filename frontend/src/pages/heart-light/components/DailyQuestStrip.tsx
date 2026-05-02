// 每日 3 任务打卡条
import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, PenLine, Flame, BookOpen } from 'lucide-react'
import { todayKey } from '../constants'

type QuestKey = 'light' | 'oneLine' | 'review'

interface QuestState {
  light: boolean
  oneLine: boolean
  review: boolean
  celebrated: boolean
}

const STORAGE_PREFIX = 'yinji.heartlight.quests'

function readState(): QuestState {
  try {
    const raw = localStorage.getItem(todayKey(STORAGE_PREFIX))
    if (!raw) return { light: false, oneLine: false, review: false, celebrated: false }
    return { light: false, oneLine: false, review: false, celebrated: false, ...JSON.parse(raw) }
  } catch {
    return { light: false, oneLine: false, review: false, celebrated: false }
  }
}

function writeState(state: QuestState) {
  try {
    localStorage.setItem(todayKey(STORAGE_PREFIX), JSON.stringify(state))
  } catch {}
}

export default function DailyQuestStrip({
  todayActive,
  hasOneLine,
  onGoReview,
  onAllCompleted,
}: {
  todayActive: boolean
  hasOneLine: boolean
  onGoReview: () => void
  onAllCompleted: () => void
}) {
  const [state, setState] = useState<QuestState>(() => readState())

  // 同步外部信号到本地状态
  useEffect(() => {
    setState((prev) => {
      const next = { ...prev }
      if (todayActive) next.light = true
      if (hasOneLine) next.oneLine = true
      writeState(next)
      return next
    })
  }, [todayActive, hasOneLine])

  const toggle = (key: QuestKey) => {
    setState((prev) => {
      if (prev[key]) return prev
      const next = { ...prev, [key]: true }
      writeState(next)
      return next
    })
  }

  const completed = Number(state.light) + Number(state.oneLine) + Number(state.review)
  const pct = Math.round((completed / 3) * 100)

  useEffect(() => {
    if (completed === 3 && !state.celebrated) {
      const next = { ...state, celebrated: true }
      writeState(next)
      setState(next)
      onAllCompleted()
    }
  }, [completed, state, onAllCompleted])

  const quests: Array<{ key: QuestKey; title: string; desc: string; icon: React.ReactNode; action?: () => void }> = [
    { key: 'light', title: '点亮今日心灯', desc: '完成一次 5 秒情绪签到', icon: <Flame className="h-4 w-4" /> },
    { key: 'oneLine', title: '写一句以上', desc: '一句话也算，是你的练习', icon: <PenLine className="h-4 w-4" /> },
    {
      key: 'review',
      title: '回看一篇旧日记',
      desc: '感受自己走过的一天',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => {
        toggle('review')
        onGoReview()
      },
    },
  ]

  return (
    <section className="rounded-3xl border border-[#eadfd8] bg-white/82 p-5 shadow-[0_14px_40px_rgba(122,83,73,0.08)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-stone-800">今日小目标</h3>
          <p className="mt-0.5 text-xs text-stone-400">完成 3 个轻任务，像种下 3 颗种子</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#b56f61]">
          <span>{completed}/3</span>
        </div>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#f6ede8]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#f58b7d,#b19adc)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {quests.map((q) => {
          const done = state[q.key]
          return (
            <button
              key={q.key}
              type="button"
              onClick={q.action || (() => toggle(q.key))}
              disabled={done && !q.action}
              className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
                done
                  ? 'border-[#c9e5d2] bg-[#f2fbf5]'
                  : 'border-[#eadfd8] bg-white hover:-translate-y-0.5 hover:bg-[#fff8f4]'
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-[#d5eddd] text-[#4a9b70]' : 'bg-[#fff4dc] text-[#c47a4f]'}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : q.icon}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${done ? 'text-[#4a9b70]' : 'text-stone-700'}`}>{q.title}</span>
                <span className="mt-0.5 block text-xs text-stone-400">{q.desc}</span>
              </span>
              {!done && !q.action && <Circle className="ml-auto h-4 w-4 text-stone-200" />}
            </button>
          )
        })}
      </div>
    </section>
  )
}
