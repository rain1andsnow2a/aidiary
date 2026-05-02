// 心灯签到 / 映光积分 store
import { create } from 'zustand'
import { diaryService } from '@/services/diary.service'
import type {
  HeartLightCheckinPayload,
  HeartLightCheckinSubmitResponse,
  MonthCheckinDay,
  LightPointsSummary,
} from '@/types/diary'

interface HeartLightState {
  monthCheckins: Record<string, MonthCheckinDay[]>
  monthDiaryDates: Record<string, string[]>
  streak: number
  totalPoints: number
  lightPoints: LightPointsSummary | null
  loadingMonth: string | null
  submitting: boolean

  loadMonth: (monthKey: string) => Promise<void>
  loadLightPoints: () => Promise<void>
  submitCheckin: (payload: HeartLightCheckinPayload) => Promise<HeartLightCheckinSubmitResponse>
}

function currentMonthKey(): string {
  const d = new Date()
  const y = d.getFullYear().toString().padStart(4, '0')
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  return `${y}-${m}`
}

export const useHeartLightStore = create<HeartLightState>((set, get) => ({
  monthCheckins: {},
  monthDiaryDates: {},
  streak: 0,
  totalPoints: 0,
  lightPoints: null,
  loadingMonth: null,
  submitting: false,

  loadMonth: async (monthKey) => {
    set({ loadingMonth: monthKey })
    try {
      const res = await diaryService.getHeartLightCheckins(monthKey)
      set((state) => ({
        monthCheckins: { ...state.monthCheckins, [monthKey]: res.days },
        monthDiaryDates: { ...state.monthDiaryDates, [monthKey]: res.diary_dates },
        streak: res.streak,
        totalPoints: res.total_points,
      }))
    } finally {
      set({ loadingMonth: null })
    }
  },

  loadLightPoints: async () => {
    const res = await diaryService.getLightPoints()
    set({ lightPoints: res, totalPoints: res.total })
  },

  submitCheckin: async (payload) => {
    set({ submitting: true })
    try {
      const res = await diaryService.submitHeartLightCheckin(payload)
      // 合并到当前月缓存
      const key = currentMonthKey()
      const existing = get().monthCheckins[key] || []
      const existingDates = get().monthDiaryDates[key] || []
      const checkinDate = res.checkin.checkin_date
      const nextDay: MonthCheckinDay = {
        date: checkinDate,
        emotion: res.checkin.emotion,
        energy: res.checkin.energy,
        event: res.checkin.event,
        is_rest: res.checkin.is_rest,
        one_line_excerpt: res.checkin.one_line_text
          ? res.checkin.one_line_text.length > 40
            ? res.checkin.one_line_text.slice(0, 40) + '...'
            : res.checkin.one_line_text
          : null,
      }
      const merged = existing.filter((d) => d.date !== checkinDate).concat(nextDay)
      merged.sort((a, b) => (a.date < b.date ? -1 : 1))

      set({
        monthCheckins: { ...get().monthCheckins, [key]: merged },
        monthDiaryDates: { ...get().monthDiaryDates, [key]: existingDates },
        streak: res.streak,
        totalPoints: res.total_points,
      })
      return res
    } finally {
      set({ submitting: false })
    }
  },
}))

export { currentMonthKey }
