// 今日心灯独立页 - 5 秒情绪签到 + 游戏化反馈
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useHeartLightStore } from '@/store/heartLightStore'
import { diaryService } from '@/services/diary.service'
import { toast } from '@/components/ui/toast'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import type { CareProgress, Diary, PlanetCollection } from '@/types/diary'
import {
  PenLine, Sparkles, Mic, Wand2, ChevronRight, Gift, Orbit,
} from 'lucide-react'
import { CHECKIN_EMOTIONS, CHECKIN_EVENTS, REFLECTION_OPTIONS } from './constants'
import StreakFlame from './components/StreakFlame'
import DailyQuestStrip from './components/DailyQuestStrip'
import ChestTimeline from './components/ChestTimeline'

type LightMemory = Pick<Diary, 'id' | 'title' | 'content' | 'diary_date'>

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const

export default function HeartLightPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const submitCheckin = useHeartLightStore((state) => state.submitCheckin)
  const loadLightPoints = useHeartLightStore((state) => state.loadLightPoints)

  const [checkinEmotion, setCheckinEmotion] = useState('anxious')
  const [checkinEnergy, setCheckinEnergy] = useState(2)
  const [checkinEvent, setCheckinEvent] = useState('study')
  const [isLightCompleted, setIsLightCompleted] = useState(false)
  const [showLightCelebration, setShowLightCelebration] = useState(false)
  const [showOneLine, setShowOneLine] = useState(false)
  const [showAiQuestion, setShowAiQuestion] = useState(false)
  const [oneLineText, setOneLineText] = useState('')
  const [selectedReflection, setSelectedReflection] = useState('')
  const [lightReward, setLightReward] = useState<{ points: number; card: string } | null>(null)
  const [careProgress, setCareProgress] = useState<CareProgress | null>(null)
  const [lightMemory, setLightMemory] = useState<LightMemory | null>(null)
  const [planetCollection, setPlanetCollection] = useState<PlanetCollection | null>(null)
  const [guidedQuestion] = useState(() => {
    const key = QUESTION_KEYS[new Date().getDate() % QUESTION_KEYS.length]
    return t(`heartLightPage.questions.${key}`)
  })

  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedCheckinEmotion = useMemo(
    () => CHECKIN_EMOTIONS.find((item) => item.key === checkinEmotion) || CHECKIN_EMOTIONS[0],
    [checkinEmotion],
  )
  const selectedReflectionLabel = REFLECTION_OPTIONS.find((item) => item.key === selectedReflection)?.label

  const loadCareProgress = useCallback(async () => {
    try {
      const progress = await diaryService.getCareProgress()
      setCareProgress(progress)
    } catch {
      setCareProgress(null)
    }
  }, [])

  const loadPlanets = useCallback(async () => {
    try {
      const data = await diaryService.getPlanetCollection()
      setPlanetCollection(data)
    } catch {
      setPlanetCollection(null)
    }
  }, [])

  useEffect(() => {
    void loadCareProgress()
    void loadPlanets()
  }, [loadCareProgress, loadPlanets])

  // 记忆盲盒：按所选情绪拉一篇同类旧日记
  useEffect(() => {
    let cancelled = false
    const today = new Date().toISOString().slice(0, 10)
    diaryService
      .list({ page: 1, page_size: 4, emotion_tag: checkinEmotion })
      .then((result) => {
        if (cancelled) return
        const memory = result.items.find((item) => item.diary_date !== today)
        setLightMemory(memory ? { id: memory.id, title: memory.title, content: memory.content, diary_date: memory.diary_date } : null)
      })
      .catch(() => {
        if (!cancelled) setLightMemory(null)
      })
    return () => { cancelled = true }
  }, [checkinEmotion])

  useEffect(() => () => {
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current)
  }, [])

  const triggerCelebration = useCallback(() => {
    setShowLightCelebration(true)
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current)
    celebrationTimerRef.current = setTimeout(() => setShowLightCelebration(false), 2400)
  }, [])

  const completeHeartLight = async () => {
    try {
      const res = await submitCheckin({
        emotion: checkinEmotion,
        energy: checkinEnergy,
        event: checkinEvent,
        one_line_text: oneLineText.trim() || null,
        reflection_key: selectedReflection || null,
        is_rest: false,
      })
      setIsLightCompleted(true)
      triggerCelebration()
      if (res.points_delta > 0) {
        setLightReward({
          points: res.points_delta,
          card: selectedReflectionLabel || selectedCheckinEmotion.label,
        })
      }
      void loadCareProgress()
      void loadPlanets()
      void loadLightPoints()
      if (res.new_planet) {
        const label = CHECKIN_EMOTIONS.find((item) => item.key === res.new_planet)?.label || res.new_planet
        toast(t('heartLightPage.toastUnlockedPlanet', { label }), 'success')
      } else {
        toast(t('heartLightPage.toastCompleted'), 'success')
      }
    } catch (error: any) {
      toast(error.message || t('heartLightPage.toastSaveFailed'), 'error')
    }
  }

  const handleRestCareRecord = async () => {
    try {
      await submitCheckin({
        emotion: 'rest',
        energy: 3,
        event: 'rest',
        is_rest: true,
      })
      setIsLightCompleted(true)
      triggerCelebration()
      void loadCareProgress()
      void loadLightPoints()
      toast(t('heartLightPage.toastRestRecorded'), 'success')
    } catch (error: any) {
      toast(error.message || t('heartLightPage.toastRestFailed'), 'error')
    }
  }

  const openFullEditor = () => {
    navigate(`/diaries/new?emotion=${encodeURIComponent(checkinEmotion)}`)
  }

  const goReviewOldDiary = () => {
    if (lightMemory) {
      navigate(`/diaries/${lightMemory.id}`)
    } else {
      navigate('/diaries')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(158deg, #f8f5ef 0%, #f2eef5 58%, #f5f2ee 100%)' }}>
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[rgba(248,245,239,0.88)] backdrop-blur-xl">
        <div className="absolute right-4 top-2"><LanguageSwitcher /></div>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <button onClick={() => navigate('/')} className="text-sm text-stone-400 hover:text-stone-600">
            {t('heartLightPage.headerHome')}
          </button>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-600">
            <Sparkles className="h-4 w-4 text-[#b56f61]" /> {t('heartLightPage.headerTitle')}
          </span>
          <button
            onClick={openFullEditor}
            className="text-sm font-semibold text-[#b56f61] hover:text-[#9c5e52]"
          >
            {t('heartLightPage.headerWriteFull')}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-6 py-8">
        <HeartLightCheckin
          emotion={checkinEmotion}
          energy={checkinEnergy}
          eventType={checkinEvent}
          isCompleted={isLightCompleted}
          showCelebration={showLightCelebration}
          onEmotionChange={setCheckinEmotion}
          onEnergyChange={setCheckinEnergy}
          onEventChange={setCheckinEvent}
          onComplete={completeHeartLight}
          onRest={handleRestCareRecord}
          onAddLine={() => {
            setShowOneLine(true)
            setTimeout(() => document.getElementById('light-one-line')?.focus(), 50)
          }}
        />

        <StreakFlame progress={careProgress} />

        <DailyQuestStrip
          todayActive={isLightCompleted || careProgress?.today_status === 'ACTIVE'}
          hasOneLine={oneLineText.trim().length > 0}
          onGoReview={goReviewOldDiary}
          onAllCompleted={triggerCelebration}
        />

        <ChestTimeline progress={careProgress} />

        <DailyReflectionPrompt
          question={guidedQuestion}
          showAiQuestion={showAiQuestion}
          selectedReflection={selectedReflection}
          onSkip={handleRestCareRecord}
          onWriteOneLine={() => {
            setShowOneLine(true)
            setTimeout(() => document.getElementById('light-one-line')?.focus(), 50)
          }}
          onVoice={() => toast(t('heartLightPage.toastVoicePending'), 'success')}
          onAskAi={() => setShowAiQuestion(true)}
          onSelectReflection={(value) => {
            setSelectedReflection(value)
            const label = REFLECTION_OPTIONS.find((item) => item.key === value)?.label || ''
            const generated = t('heartLightPage.lightNotePlaceholder')
            // 用占位句作为生成草稿（避免拼字符串混 i18n）
            void label
            setOneLineText(generated)
            setShowOneLine(true)
          }}
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_0.82fr]">
          <LightNotePanel
            visible={showOneLine}
            value={oneLineText}
            onChange={setOneLineText}
          />
          <div className="space-y-4">
            <EmotionPlanet emotion={selectedCheckinEmotion} />
            <PlanetEntryCard
              total={planetCollection?.total ?? 7}
              unlocked={planetCollection?.unlocked ?? 0}
              onOpen={() => navigate('/heart-light/planets')}
            />
            {lightMemory ? <MemoryBlindBox memory={lightMemory} onOpen={() => navigate(`/diaries/${lightMemory.id}`)} /> : null}
          </div>
        </div>

        {lightReward && <LightRewardBar points={lightReward.points} card={lightReward.card} />}

        <NextStepBar onOpenFullEditor={openFullEditor} onOpenGrowth={() => navigate('/growth')} />
      </main>
    </div>
  )
}

// ---------- 以下为页内子组件 ----------

function HeartLightCheckin({
  emotion, energy, eventType, isCompleted, showCelebration,
  onEmotionChange, onEnergyChange, onEventChange, onComplete, onRest, onAddLine,
}: {
  emotion: string
  energy: number
  eventType: string
  isCompleted: boolean
  showCelebration: boolean
  onEmotionChange: (value: string) => void
  onEnergyChange: (value: number) => void
  onEventChange: (value: string) => void
  onComplete: () => void
  onRest: () => void
  onAddLine: () => void
}) {
  const { t } = useTranslation()
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#eadfd8] bg-white/82 shadow-[0_18px_54px_rgba(122,83,73,0.1)]">
      <div className="absolute inset-y-0 left-0 hidden w-36 overflow-hidden bg-[linear-gradient(160deg,#fff4e8,#ffe7ee_55%,#f2edff)] sm:block">
        <div className="absolute left-5 top-10 h-24 w-24 rounded-full bg-white/45 blur-xl" />
        <img
          src="/xindeng-small.png"
          alt="心灯"
          width={96}
          height={96}
          className="absolute left-5 top-12 h-24 w-24 object-contain drop-shadow-[0_18px_28px_rgba(214,135,116,0.2)]"
        />
        <Sparkles className="absolute left-6 top-6 h-4 w-4 text-white" />
        <Sparkles className="absolute right-5 top-11 h-3 w-3 text-[#f2a7a0]" />
      </div>

      {showCelebration && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 animate-[heartLightCenterPop_2.4s_ease-in-out_forwards] flex-col items-center text-center">
          <img src="/star-small.png" alt={t('heartLightPage.rewardLit')} width={96} height={96} className="h-24 w-24 object-contain drop-shadow-[0_18px_28px_rgba(233,172,91,0.34)]" />
          <span className="mt-1 rounded-full bg-white/78 px-4 py-1.5 text-sm font-bold text-[#c57668] shadow-[0_10px_24px_rgba(163,103,95,0.12)] backdrop-blur">
            {t('heartLightPage.rewardLit')}
          </span>
        </div>
      )}

      <div className="relative p-5 sm:pl-40">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff4df] shadow-inner sm:hidden">
            <img src="/xindeng-small.png" alt="心灯" width={48} height={48} className="h-12 w-12 object-contain" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-normal text-stone-800">{t('heartLightPage.checkinTitle')}</h2>
              <Sparkles className="h-4 w-4 text-[#f0a09a]" />
            </div>
            <p className="mt-1 text-sm text-stone-400">{t('heartLightPage.checkinSub')}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#eadfd8] bg-white/62 p-4 shadow-inner">
          <CheckinRow label={t('heartLightPage.rowEmotion')}>
            {CHECKIN_EMOTIONS.map((item) => (
              <ChoicePill key={item.key} active={emotion === item.key} onClick={() => onEmotionChange(item.key)}>
                <span>{item.emoji}</span>{item.label}
              </ChoicePill>
            ))}
          </CheckinRow>
          <CheckinRow label={t('heartLightPage.rowEnergy')}>
            {[1, 2, 3, 4, 5].map((item) => (
              <ChoicePill key={item} active={energy === item} onClick={() => onEnergyChange(item)}>
                {item}
              </ChoicePill>
            ))}
          </CheckinRow>
          <CheckinRow label={t('heartLightPage.rowEvent')}>
            {CHECKIN_EVENTS.map((item) => (
              <ChoicePill key={item.key} active={eventType === item.key} onClick={() => onEventChange(item.key)}>
                {item.label}
              </ChoicePill>
            ))}
          </CheckinRow>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#f58b7d,#b19adc)] px-7 text-sm font-bold text-white shadow-[0_14px_34px_rgba(210,113,121,0.24)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" /> {t('heartLightPage.btnComplete')}
          </button>
          <button
            type="button"
            onClick={onAddLine}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[#eadfd8] bg-white/82 px-6 text-sm font-bold text-stone-600 shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <PenLine className="h-4 w-4" /> {t('heartLightPage.btnAddLine')}
          </button>
          <button
            type="button"
            onClick={onRest}
            className="h-12 px-3 text-sm font-semibold text-stone-400 transition-colors hover:text-[#b56f61]"
          >
            {t('heartLightPage.btnRest')}
          </button>
        </div>
        <p className="mt-3 text-center text-sm text-stone-400">
          {isCompleted ? t('heartLightPage.completedHint') : t('heartLightPage.incompleteHint')}
        </p>
      </div>
    </section>
  )
}

function CheckinRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 py-2 sm:grid-cols-[72px_1fr] sm:items-center">
      <div className="text-sm font-semibold text-stone-500">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function ChoicePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-16 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? 'border-[#a7a0d8] bg-[#f6f1ff] text-[#6c62af] shadow-sm ring-1 ring-[#cfc8ef]'
          : 'border-[#eadfd8] bg-white/78 text-stone-500 hover:border-[#d5c5bc] hover:bg-[#fff8f4]'
      }`}
    >
      {children}
    </button>
  )
}

function DailyReflectionPrompt({
  question, showAiQuestion, selectedReflection,
  onSkip, onWriteOneLine, onVoice, onAskAi, onSelectReflection,
}: {
  question: string
  showAiQuestion: boolean
  selectedReflection: string
  onSkip: () => void
  onWriteOneLine: () => void
  onVoice: () => void
  onAskAi: () => void
  onSelectReflection: (value: string) => void
}) {
  const { t } = useTranslation()
  return (
    <section className="rounded-3xl border border-[#eadfd8] bg-white/76 p-5 shadow-[0_14px_40px_rgba(122,83,73,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff4dc] text-amber-500">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-500">{t('heartLightPage.promptTodayTitle')}</p>
            <p className="mt-1 text-lg font-bold leading-7 text-stone-800">{question}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <PromptButton icon={<ChevronRight />} label={t('heartLightPage.promptSkip')} onClick={onSkip} />
          <PromptButton icon={<PenLine />} label={t('heartLightPage.promptWriteOne')} onClick={onWriteOneLine} active />
          <PromptButton icon={<Mic />} label={t('heartLightPage.promptVoice')} onClick={onVoice} />
          <PromptButton icon={<Wand2 />} label={t('heartLightPage.promptAskAi')} onClick={onAskAi} />
        </div>
      </div>
      {showAiQuestion && (
        <div className="mt-4 rounded-3xl border border-[#eadfd8] bg-[#fffaf6] p-4">
          <p className="mb-3 text-sm font-semibold text-stone-600">{t('heartLightPage.promptReflectTitle')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {REFLECTION_OPTIONS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectReflection(item.key)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                  selectedReflection === item.key
                    ? 'border-[#a7a0d8] bg-[#f6f1ff] text-[#6c62af]'
                    : 'border-[#eadfd8] bg-white text-stone-500 hover:bg-[#fff6f2]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function PromptButton({ icon, label, onClick, active = false }: { icon: ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition-all active:scale-[0.98] ${
        active ? 'border-[#b7a6df] bg-white text-[#7767b6]' : 'border-[#eadfd8] bg-white/78 text-stone-500 hover:bg-[#fff6f2]'
      }`}
    >
      <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>{label}
    </button>
  )
}

function LightNotePanel({ visible, value, onChange }: { visible: boolean; value: string; onChange: (value: string) => void }) {
  const { t } = useTranslation()
  return (
    <section className="rounded-3xl border border-[#eadfd8] bg-white/78 p-5 shadow-[0_14px_40px_rgba(122,83,73,0.08)]">
      <div className="mb-3 flex items-center gap-2">
        <PenLine className="h-4 w-4 text-[#d98878]" />
        <h3 className="text-base font-bold text-stone-700">{t('heartLightPage.lightNoteTitle')}</h3>
      </div>
      {visible ? (
        <>
          <textarea
            id="light-one-line"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('heartLightPage.lightNotePlaceholder')}
            className="min-h-36 w-full resize-none rounded-2xl border border-[#eadfd8] bg-white/70 p-4 text-sm leading-7 text-stone-700 outline-none transition-all placeholder:text-stone-300 focus:border-[#c9badc]"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-stone-400">
            <span>{t('heartLightPage.lightNoteCharCount', { n: value.length })}</span>
            <span>{t('heartLightPage.lightNoteHint')}</span>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#eadfd8] bg-white/50 p-6 text-sm leading-7 text-stone-400">
          {t('heartLightPage.lightNoteEmpty')}
        </div>
      )}
    </section>
  )
}

function EmotionPlanet({ emotion }: { emotion: typeof CHECKIN_EMOTIONS[number] }) {
  const { t } = useTranslation()
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#eadfd8] bg-white/78 p-5 shadow-[0_14px_40px_rgba(122,83,73,0.08)]">
      <div className="absolute right-3 top-4 h-24 w-32 rounded-full bg-[radial-gradient(circle,#d8c4ff_0%,#ffe1f2_45%,transparent_70%)] blur-sm" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">🌌</span>
            <h3 className="text-base font-bold text-stone-700">{t('heartLightPage.planetSectionTitle')}</h3>
          </div>
          <p className="text-sm leading-7 text-stone-600">{t('heartLightPage.planetTodayLine', { planet: emotion.planet })}</p>
          <p className="text-sm leading-7 text-stone-500">{emotion.description}</p>
        </div>
        <div className="relative flex h-24 w-28 shrink-0 items-center justify-center">
          <div className="absolute h-16 w-24 rotate-[-10deg] rounded-full border border-violet-200" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b8a7ff,#ffd5e5)] text-2xl shadow-[0_0_24px_rgba(170,137,245,0.35)]">
            {emotion.emoji}
          </div>
          <Sparkles className="absolute right-2 top-1 h-5 w-5 text-amber-300" />
        </div>
      </div>
    </section>
  )
}

function PlanetEntryCard({ total, unlocked, onOpen }: { total: number; unlocked: number; onOpen: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between rounded-3xl border border-[#eadfd8] bg-[linear-gradient(135deg,#fff4e8,#f5efff)] p-5 text-left shadow-[0_14px_40px_rgba(122,83,73,0.08)] transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#b56f61]">
          <Orbit className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-stone-700">{t('heartLightPage.planetEntryTitle')}</h3>
          <p className="mt-0.5 text-xs text-stone-500">{t('heartLightPage.planetEntryProgress', { unlocked, total })}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-stone-300" />
    </button>
  )
}

function MemoryBlindBox({ memory, onOpen }: { memory: LightMemory; onOpen: () => void }) {
  const { t } = useTranslation()
  const preview = memory.content.replace(/\s+/g, ' ').slice(0, 68)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative w-full overflow-hidden rounded-3xl border border-[#eadfd8] bg-white/78 p-5 text-left shadow-[0_14px_40px_rgba(122,83,73,0.08)] transition-all hover:-translate-y-0.5"
    >
      <div className="absolute right-4 top-5 h-20 w-24 rounded-full bg-[radial-gradient(circle,#ffe1b8_0%,#f1d8ff_55%,transparent_72%)] blur-sm" />
      <div className="relative flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0df] text-2xl shadow-inner">
          🎁
        </span>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#d99370]" />
            <h3 className="text-base font-bold text-stone-700">{t('heartLightPage.memoryBoxTitle')}</h3>
          </div>
          <p className="text-sm leading-6 text-stone-600">{t('heartLightPage.memoryBoxDateLine', { date: memory.diary_date })}</p>
          <p className="text-sm leading-6 text-stone-500">{preview}{memory.content.length > 68 ? '...' : ''}</p>
        </div>
      </div>
    </button>
  )
}

function LightRewardBar({ points, card }: { points: number; card: string }) {
  const { t } = useTranslation()
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#eadfd8] bg-[linear-gradient(100deg,#fffaf3,#ffe7df,#f0e9ff)] px-6 py-4 shadow-[0_14px_40px_rgba(122,83,73,0.08)]">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_40%,#fff_0_2px,transparent_3px),radial-gradient(circle_at_80%_55%,#fff_0_2px,transparent_3px)]" />
      <div className="relative flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-stone-700">
        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/62 px-5 py-2 text-[#c47a61]">
          <Sparkles className="h-4 w-4" /> {t('heartLightPage.rewardLight', { points })}
        </span>
        <span className="h-6 w-px bg-[#e6d7d0]" />
        <span>{t('heartLightPage.rewardCard', { card })}</span>
        <span className="rotate-6 rounded-xl bg-white/60 px-3 py-2 text-xs text-[#8e83bd] shadow-sm">{t('heartLightPage.rewardLit')}</span>
      </div>
    </div>
  )
}

function NextStepBar({ onOpenFullEditor, onOpenGrowth }: { onOpenFullEditor: () => void; onOpenGrowth: () => void }) {
  const { t } = useTranslation()
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={onOpenFullEditor}
        className="flex items-center justify-between rounded-3xl border border-[#eadfd8] bg-white/78 px-5 py-4 text-left shadow-[0_12px_34px_rgba(122,83,73,0.07)] transition-all hover:-translate-y-0.5"
      >
        <span>
          <span className="block text-sm font-bold text-stone-700">{t('heartLightPage.nextWriteFullTitle')}</span>
          <span className="mt-1 block text-xs text-stone-400">{t('heartLightPage.nextWriteFullDesc')}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-stone-300" />
      </button>
      <button
        type="button"
        onClick={onOpenGrowth}
        className="flex items-center justify-between rounded-3xl border border-[#eadfd8] bg-white/64 px-5 py-4 text-left shadow-[0_12px_34px_rgba(122,83,73,0.05)] transition-all hover:-translate-y-0.5"
      >
        <span>
          <span className="block text-sm font-bold text-stone-700">{t('heartLightPage.nextGrowthTitle')}</span>
          <span className="mt-1 block text-xs text-stone-400">{t('heartLightPage.nextGrowthDesc')}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-stone-300" />
      </button>
    </section>
  )
}
