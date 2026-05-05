// Dashboard 月历签到图：替代「最近日记」主位
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Sparkles, Moon } from 'lucide-react'
import { useHeartLightStore, currentMonthKey } from '@/store/heartLightStore'
import type { MonthCheckinDay } from '@/types/diary'

const EMOTION_COLOR: Record<string, string> = {
  happy: '#f6b95c',
  calm: '#7cc4b3',
  neutral: '#c9c1b8',
  sad: '#8ea7d4',
  anxious: '#d58aa5',
  angry: '#e28b73',
  exhausted: '#a895c3',
  rest: '#d5c9bf',
}

function shiftMonth(monthKey: string, delta: number): string {
  const [yStr, mStr] = monthKey.split('-')
  let year = Number(yStr)
  let month = Number(mStr) + delta
  while (month < 1) { month += 12; year -= 1 }
  while (month > 12) { month -= 12; year += 1 }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`
}

function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function firstDayWeekIndex(monthKey: string): number {
  // Monday=0 ... Sunday=6
  const [y, m] = monthKey.split('-').map(Number)
  const jsDay = new Date(y, m - 1, 1).getDay()
  return (jsDay + 6) % 7
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function reasonLabel(
  reason: string,
  meta: Record<string, any> | null,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (reason === 'checkin') return t('heartLightCalendar.reasonCheckin')
  if (reason === 'one_line') return t('heartLightCalendar.reasonOneLine')
  if (reason === 'planet_unlock') {
    const planet = meta?.planet
    if (planet) {
      const label = t(`emotion.${planet}`, planet)
      return t('heartLightCalendar.reasonPlanetUnlock', { planet: label })
    }
    return t('heartLightCalendar.reasonPlanetUnlockGeneric')
  }
  return reason
}

export default function HeartLightCalendar() {
  const { t } = useTranslation()
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const monthCheckins = useHeartLightStore((s) => s.monthCheckins)
  const monthDiaryDates = useHeartLightStore((s) => s.monthDiaryDates)
  const streak = useHeartLightStore((s) => s.streak)
  const totalPoints = useHeartLightStore((s) => s.totalPoints)
  const loadMonth = useHeartLightStore((s) => s.loadMonth)
  const loadLightPoints = useHeartLightStore((s) => s.loadLightPoints)
  const lightPoints = useHeartLightStore((s) => s.lightPoints)
  const [showLedger, setShowLedger] = useState(false)

  useEffect(() => {
    void loadMonth(monthKey)
  }, [monthKey, loadMonth])

  useEffect(() => {
    void loadLightPoints()
  }, [loadLightPoints])

  const days = monthCheckins[monthKey] || []
  const diaryDates = monthDiaryDates[monthKey] || []

  const byDate = useMemo(() => {
    const map = new Map<string, MonthCheckinDay>()
    for (const d of days) map.set(d.date, d)
    return map
  }, [days])

  const diarySet = useMemo(() => new Set(diaryDates), [diaryDates])

  const cells: Array<{ date: string; day: number; placeholder?: boolean }> = []
  const total = daysInMonth(monthKey)
  const leadBlanks = firstDayWeekIndex(monthKey)
  for (let i = 0; i < leadBlanks; i++) cells.push({ date: '', day: 0, placeholder: true })
  const [y, m] = monthKey.split('-')
  for (let d = 1; d <= total; d++) {
    const date = `${y}-${m}-${String(d).padStart(2, '0')}`
    cells.push({ date, day: d })
  }
  while (cells.length % 7 !== 0) cells.push({ date: '', day: 0, placeholder: true })

  const today = todayKey()

  const monthLabel = t('heartLightCalendar.monthLabel', { year: y, month: Number(m) })
  const weekdays = [
    t('heartLightCalendar.weekdayMon'),
    t('heartLightCalendar.weekdayTue'),
    t('heartLightCalendar.weekdayWed'),
    t('heartLightCalendar.weekdayThu'),
    t('heartLightCalendar.weekdayFri'),
    t('heartLightCalendar.weekdaySat'),
    t('heartLightCalendar.weekdaySun'),
  ]

  return (
    <section className="rounded-[28px] border border-[#eadfd8] bg-white/80 p-6 shadow-[0_18px_52px_rgba(115,84,69,0.08)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#b76458]" />
          <div>
            <h2 className="text-xl font-bold text-stone-800">{t('heartLightCalendar.title')}</h2>
            <p className="text-sm text-stone-400">{t('heartLightCalendar.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthKey((k) => shiftMonth(k, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd8] bg-white/78 text-stone-500 hover:text-[#b76458]"
            title={t('heartLightCalendar.prevMonth')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[7.5rem] text-center text-sm font-semibold text-stone-600">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setMonthKey((k) => shiftMonth(k, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfd8] bg-white/78 text-stone-500 hover:text-[#b76458]"
            title={t('heartLightCalendar.nextMonth')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-stone-400">
        {weekdays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (cell.placeholder) {
            return <div key={`ph-${idx}`} className="aspect-square" />
          }
          const checkin = byDate.get(cell.date)
          const isToday = cell.date === today
          const isFuture = cell.date > today
          const hasDiary = diarySet.has(cell.date)
          const color = checkin ? EMOTION_COLOR[checkin.emotion] || '#cfc4b9' : undefined

          let tooltip: string | undefined
          if (checkin) {
            const parts = [
              cell.date,
              t(`emotion.${checkin.emotion}`, checkin.emotion),
              t('heartLightCalendar.tooltipEnergy', { energy: checkin.energy }),
            ]
            if (checkin.event) parts.push(t(`event.${checkin.event}`, checkin.event))
            tooltip = parts.join(' · ')
            if (checkin.one_line_excerpt) tooltip += `\n${checkin.one_line_excerpt}`
          }

          return (
            <div
              key={cell.date}
              title={tooltip}
              className={`relative flex aspect-square items-center justify-center rounded-2xl text-xs font-semibold transition-all ${
                isFuture
                  ? 'text-stone-300'
                  : checkin
                    ? 'text-white'
                    : 'text-stone-400'
              } ${isToday ? 'ring-2 ring-[#b76458] ring-offset-2 ring-offset-white' : ''}`}
              style={{
                background: checkin
                  ? color
                  : isFuture
                    ? 'transparent'
                    : 'rgba(240,235,230,0.6)',
                opacity: isFuture ? 0.35 : 1,
              }}
            >
              <span>{cell.day}</span>
              {hasDiary && !checkin?.is_rest && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white/90 ring-1 ring-[#b76458]" />
              )}
              {checkin?.is_rest && (
                <Moon className="absolute left-1 bottom-1 h-2.5 w-2.5 text-white/80" />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f1e9e3] pt-4">
        <p className="text-sm text-stone-500">
          {t('heartLightCalendar.footer', { streak, points: totalPoints })}
        </p>
        <button
          type="button"
          onClick={() => setShowLedger(true)}
          className="text-xs font-semibold text-[#8f63e4] hover:text-[#6b46c5]"
        >
          {t('heartLightCalendar.viewLedger')}
        </button>
      </div>

      {showLedger && (
        <LightPointsModal
          onClose={() => setShowLedger(false)}
          ledger={lightPoints?.recent_ledger ?? []}
          total={totalPoints}
        />
      )}
    </section>
  )
}

function LightPointsModal({
  onClose,
  ledger,
  total,
}: {
  onClose: () => void
  ledger: Array<{ id: number; delta: number; reason: string; ref_date: string; meta: Record<string, any> | null; created_at: string }>
  total: number
}) {
  const { t } = useTranslation()
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[92%] max-w-md rounded-3xl border border-[#eadfd8] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-800">{t('heartLightCalendar.ledgerTitle')}</h3>
          <span className="text-sm text-stone-500">
            {t('heartLightCalendar.ledgerTotal')} <span className="font-bold text-[#b76458]">{total}</span>
          </span>
        </div>
        {ledger.length === 0 ? (
          <p className="py-10 text-center text-sm text-stone-400">{t('heartLightCalendar.ledgerEmpty')}</p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {ledger.map((row) => (
              <li key={row.id} className="flex items-center justify-between rounded-2xl bg-[#faf5ef] px-4 py-2.5 text-sm">
                <div>
                  <div className="font-semibold text-stone-700">{reasonLabel(row.reason, row.meta, t)}</div>
                  <div className="text-xs text-stone-400">{row.ref_date}</div>
                </div>
                <span className={`font-bold ${row.delta > 0 ? 'text-[#c47a61]' : 'text-stone-500'}`}>
                  {row.delta > 0 ? '+' : ''}{row.delta}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-[#b76458] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#9c4f46]"
        >
          {t('heartLightCalendar.close')}
        </button>
      </div>
    </div>
  )
}
