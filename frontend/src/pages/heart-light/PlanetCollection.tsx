// 情绪星球图鉴
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Sparkles } from 'lucide-react'
import { diaryService } from '@/services/diary.service'
import type { PlanetCollection, PlanetEntry } from '@/types/diary'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

const PLANET_GRADIENTS: Record<string, string> = {
  happy: 'from-[#ffd77d] to-[#f8b84e]',
  calm: 'from-[#a9e6ed] to-[#78cbd5]',
  neutral: 'from-[#eaded2] to-[#d8c7b7]',
  sad: 'from-[#bac8f3] to-[#8ba1d8]',
  anxious: 'from-[#ffc0b9] to-[#f2978d]',
  angry: 'from-[#f9a098] to-[#df6b63]',
  exhausted: 'from-[#d7c8ee] to-[#b9a7d8]',
}

export default function PlanetCollectionPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<PlanetCollection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    diaryService
      .getPlanetCollection()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(158deg, #f8f5ef 0%, #f2eef5 58%, #f5f2ee 100%)' }}>
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[rgba(248,245,239,0.88)] backdrop-blur-xl">
        <div className="absolute right-4 top-2"><LanguageSwitcher /></div>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          <button onClick={() => navigate(-1)} className="text-sm text-stone-400 hover:text-stone-600">
            ← 返回
          </button>
          <span className="text-sm font-semibold text-stone-600">情绪星球图鉴</span>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <section className="mb-6 rounded-3xl border border-[#eadfd8] bg-white/82 p-6 text-center shadow-[0_14px_40px_rgba(122,83,73,0.08)]">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-[#d98878]" />
          <h1 className="text-2xl font-bold text-stone-800">情绪星球收集</h1>
          <p className="mt-2 text-sm text-stone-500">
            每一种情绪都是你走过的一颗星。已点亮 <span className="text-xl font-bold text-[#b56f61]">{data?.unlocked ?? 0}</span>
            <span className="text-stone-400"> / {data?.total ?? 7}</span>
          </p>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-[#eadfd8] bg-white/60 p-8 text-center text-stone-400">
            正在加载图鉴…
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.planets ?? []).map((p) => (
              <PlanetCard key={p.emotion} planet={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function PlanetCard({ planet }: { planet: PlanetEntry }) {
  const gradient = PLANET_GRADIENTS[planet.emotion] || 'from-[#eaded2] to-[#d8c7b7]'
  if (!planet.unlocked) {
    return (
      <article className="relative overflow-hidden rounded-3xl border border-[#eadfd8] bg-white/50 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-200 text-2xl grayscale">
            {planet.emoji}
          </span>
          <div>
            <h3 className="text-base font-bold text-stone-400">{planet.planet}</h3>
            <p className="text-xs text-stone-400">{planet.label}</p>
          </div>
          <Lock className="ml-auto h-4 w-4 text-stone-300" />
        </div>
        <p className="mt-3 text-xs text-stone-400">记录一次此情绪即可解锁</p>
      </article>
    )
  }
  return (
    <article className={`relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br ${gradient} p-5 text-white shadow-[0_14px_40px_rgba(122,83,73,0.14)]`}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-xl" />
      <div className="relative flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-2xl shadow-inner">
          {planet.emoji}
        </span>
        <div>
          <h3 className="text-lg font-bold">{planet.planet}</h3>
          <p className="text-xs text-white/80">{planet.label}</p>
        </div>
      </div>
      <div className="relative mt-4 flex items-center justify-between text-xs text-white/90">
        <span>首次点亮：{planet.first_unlocked}</span>
        <span className="rounded-full bg-white/30 px-2 py-0.5 font-semibold">已记录 {planet.count} 次</span>
      </div>
    </article>
  )
}
