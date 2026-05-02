// 情绪星图 — 面向用户理解的情绪聚类可视化
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Info,
  Loader2,
  Moon,
  Sparkles,
  SunMedium,
  Telescope,
} from 'lucide-react'
import { emotionService, type EmotionClusterResult, type EmotionPoint } from '@/services/emotion.service'
import { toast } from '@/components/ui/toast'

const CLUSTER_PALETTE = [
  { main: '#e8927c', soft: 'rgba(232,146,124,0.16)', glow: 'rgba(232,146,124,0.32)' },
  { main: '#7cade8', soft: 'rgba(124,173,232,0.16)', glow: 'rgba(124,173,232,0.32)' },
  { main: '#a8d5a2', soft: 'rgba(168,213,162,0.18)', glow: 'rgba(168,213,162,0.34)' },
  { main: '#d4a0d4', soft: 'rgba(212,160,212,0.16)', glow: 'rgba(212,160,212,0.32)' },
  { main: '#e8d27c', soft: 'rgba(232,210,124,0.18)', glow: 'rgba(232,210,124,0.34)' },
  { main: '#7ce8d5', soft: 'rgba(124,232,213,0.16)', glow: 'rgba(124,232,213,0.3)' },
]

const FEATURE_LABELS: Record<string, string> = {
  valence: '情绪效价',
  arousal: '唤醒度',
  dominance: '掌控感',
  self_ref: '自我关注',
  social: '关系浓度',
  cognitive: '思考复杂度',
  temporal: '时间取向',
  richness: '表达丰富度',
}

const FEATURE_FRIENDLY: Record<string, { high: string; low: string }> = {
  valence: { high: '心里更亮', low: '心情偏沉' },
  arousal: { high: '能量更满', low: '节奏更慢' },
  dominance: { high: '更有掌控', low: '需要支持' },
  self_ref: { high: '更关注自己', low: '更多看向外界' },
  social: { high: '关系感更强', low: '更适合独处' },
  cognitive: { high: '思考更深', low: '感受更直接' },
  temporal: { high: '更看向未来', low: '更停在当下' },
  richness: { high: '表达更丰沛', low: '记录更简洁' },
}

function paletteOf(id: number) {
  return CLUSTER_PALETTE[id % CLUSTER_PALETTE.length]
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function formatSigned(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
}

function getClusterTone(label: string) {
  if (label.includes('活力') || label.includes('积极') || label.includes('开心') || label.includes('成就')) {
    return {
      metaphor: '像一片正在升温的晨光',
      meaning: '这组日记通常带着行动感、掌控感和向前推进的力量。',
      care: '适合继续记录让你有能量的事，把它们变成可复用的小习惯。',
    }
  }
  if (label.includes('焦虑') || label.includes('压力') || label.includes('紧张')) {
    return {
      metaphor: '像一团需要慢慢松开的结',
      meaning: '这组日记里可能有压力、赶进度、担心失控或对自己要求较高的痕迹。',
      care: '先不用急着解决全部问题，试着把最小的下一步写下来。',
    }
  }
  if (label.includes('低落') || label.includes('消沉') || label.includes('疲惫') || label.includes('难过')) {
    return {
      metaphor: '像一处需要休息的山谷',
      meaning: '这组日记更像是在提醒你：最近的能量被消耗了，需要被看见和照顾。',
      care: '给自己留一点恢复空间，少做评判，多做补给。',
    }
  }
  if (label.includes('平和') || label.includes('满足') || label.includes('平静')) {
    return {
      metaphor: '像把生活重新放回手心',
      meaning: '这组日记常常代表秩序、收获、安定感，以及对生活的温柔确认。',
      care: '可以回看其中的细节，找到让你安稳下来的环境和节奏。',
    }
  }
  return {
    metaphor: '像一片正在成形的心情云图',
    meaning: '这组日记呈现出相近的表达方式和情绪结构，值得一起回看。',
    care: '点开代表日记，看看它们共同在提醒你什么。',
  }
}

function getTopCluster(data: EmotionClusterResult) {
  return [...data.clusters].sort((a, b) => b.size - a.size)[0]
}

function getRiskCluster(data: EmotionClusterResult) {
  return data.clusters.find(c => /焦虑|压力|低落|消沉|疲惫|难过|紧张/.test(c.label))
}

export default function EmotionMap() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [data, setData] = useState<EmotionClusterResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<EmotionPoint | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await emotionService.getClusterAnalysis(200)
        setData(result)
      } catch {
        toast(t('emotionMap.loadFailed'), 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  const visiblePoints = useMemo(() => {
    if (!data) return []
    if (selectedCluster === null) return data.points
    return data.points.filter(p => p.cluster === selectedCluster)
  }, [data, selectedCluster])

  const selectedClusterData = useMemo(() => {
    if (!data) return null
    const id = selectedCluster ?? getTopCluster(data)?.id
    return data.clusters.find(c => c.id === id) ?? null
  }, [data, selectedCluster])

  const selectedClusterPoints = useMemo(() => {
    if (!data || !selectedClusterData) return []
    return data.points
      .filter(p => p.cluster === selectedClusterData.id)
      .sort((a, b) => Number(b.diary_id) - Number(a.diary_id))
      .slice(0, 3)
  }, [data, selectedClusterData])

  const bounds = useMemo(() => {
    if (!data || data.points.length === 0) return { minX: -3, maxX: 3, minY: -3, maxY: 3 }
    const xs = data.points.map(p => p.x)
    const ys = data.points.map(p => p.y)
    const pad = 0.5
    return {
      minX: Math.min(...xs) - pad,
      maxX: Math.max(...xs) + pad,
      minY: Math.min(...ys) - pad,
      maxY: Math.max(...ys) + pad,
    }
  }, [data])

  const SVG_W = 760
  const SVG_H = 450
  const PAD = 62
  const toSvgX = useCallback((x: number) => {
    const span = bounds.maxX - bounds.minX || 1
    return PAD + ((x - bounds.minX) / span) * (SVG_W - PAD * 2)
  }, [bounds])
  const toSvgY = useCallback((y: number) => {
    const span = bounds.maxY - bounds.minY || 1
    return SVG_H - PAD - ((y - bounds.minY) / span) * (SVG_H - PAD * 2)
  }, [bounds])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f1ec]">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#c17f6e]" />
          <span className="text-sm">正在整理你的情绪星图...</span>
        </div>
      </div>
    )
  }

  if (!data || data.points.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-400 bg-[#f7f1ec]">
        <Sparkles className="w-12 h-12" />
        <p className="text-lg">{t('emotionMap.notEnoughDiaries')}</p>
        <p className="text-sm">{t('emotionMap.writeMoreHint')}</p>
        <button onClick={() => navigate('/heart-light')} className="mt-2 px-5 py-2.5 rounded-2xl bg-[#c17f6e] text-white text-sm shadow-lg shadow-[#c17f6e]/20">
          {t('emotionMap.goWrite')}
        </button>
      </div>
    )
  }

  const topCluster = getTopCluster(data)
  const riskCluster = getRiskCluster(data)
  const topTone = topCluster ? getClusterTone(topCluster.label) : null
  const selectedTone = selectedClusterData ? getClusterTone(selectedClusterData.label) : null
  const trendText = data.stats.avg_valence > 0.25 ? '偏明亮' : data.stats.avg_valence < -0.25 ? '偏低沉' : '比较平稳'
  const energyText = data.stats.avg_arousal > 0.45 ? '能量偏高' : data.stats.avg_arousal < -0.25 ? '需要补电' : '节奏适中'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(232,146,124,0.12),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(124,173,232,0.10),transparent_24%),linear-gradient(135deg,#faf6f2,#f3ede8)] pb-20 text-stone-700">
      <div className="sticky top-0 z-20 border-b border-[#e7dbd5]/60 bg-[#fbf7f3]/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="rounded-2xl p-2 transition hover:bg-[#efe5dd]" aria-label="返回">
            <ArrowLeft className="h-5 w-5 text-stone-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-stone-800">情绪星图</h1>
            <p className="text-xs text-stone-400">基于 {data.stats.total_diaries} 篇日记，先看懂状态，再展开算法</p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs transition ${showInfo ? 'border-stone-700 bg-stone-700 text-white' : 'border-[#e7dbd5] bg-white/70 text-stone-500 hover:bg-white'}`}
          >
            <Info className="h-4 w-4" />
            算法说明
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-5xl space-y-5 px-4 pt-5">
        {showInfo && (
          <section className="rounded-[28px] border border-[#e7dbd5] bg-white/72 p-5 text-sm text-stone-500 shadow-sm backdrop-blur animate-fade-in">
            <div className="mb-3 flex items-center gap-2 font-semibold text-stone-700">
              <Telescope className="h-4 w-4 text-[#b36f5d]" />
              这张图是怎么来的？
            </div>
            <p className="leading-7">
              每篇日记会先被转成 8 个维度的情绪特征：情绪效价、唤醒度、掌控感、自我关注、关系浓度、思考复杂度、时间取向、表达丰富度。系统再用 K-Means 找出相近的记录，并通过 PCA 把高维特征压缩成二维星图。
            </p>
            <div className="mt-3 grid gap-3 rounded-2xl bg-[#faf6f2] p-3 text-xs sm:grid-cols-3">
              <span>轮廓系数：<b>{data.stats.silhouette_score}</b></span>
              <span>聚类数量：<b>{data.stats.num_clusters}</b></span>
              <span>二维解释率：<b>{(data.stats.explained_variance_2d.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%</b></span>
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-[34px] border border-[#eadfd8] bg-white/78 p-6 shadow-[0_18px_50px_rgba(118,88,72,0.10)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#e8927c]/16 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-20 h-64 w-64 rounded-full bg-[#a8d5a2]/14 blur-3xl" />
          <div className="relative grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fbf1ec] px-3 py-1.5 text-xs font-medium text-[#b36f5d]">
                <Sparkles className="h-3.5 w-3.5" />
                最近的情绪天气
              </div>
              <h2 className="text-2xl font-bold leading-tight text-stone-800 sm:text-3xl">
                最近的你：{topCluster?.label ?? '正在形成自己的情绪轨迹'}，{trendText}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
                {topTone?.meaning ?? '这些日记正在慢慢组成你的情绪星图。'} 这页会先用人话解释状态，如果你需要，也可以打开算法说明查看特征向量和聚类指标。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <InsightChip label="主要状态" value={topCluster?.label ?? '-'} tone="sage" />
              <InsightChip label="整体情绪" value={trendText} tone="amber" />
              <InsightChip label="当前节奏" value={energyText} tone="blue" />
            </div>
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <ClusterChip active={selectedCluster === null} onClick={() => setSelectedCluster(null)} color="#3f3935" label={`全部 (${data.points.length})`} />
          {data.clusters.map(c => (
            <ClusterChip
              key={c.id}
              active={selectedCluster === c.id}
              onClick={() => setSelectedCluster(selectedCluster === c.id ? null : c.id)}
              color={paletteOf(c.id).main}
              label={`${c.label} (${c.size})`}
            />
          ))}
        </div>

        <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-[30px] border border-[#eadfd8] bg-[#fffcf9]/88 p-5 shadow-[0_16px_40px_rgba(118,88,72,0.08)]">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-500">
              <Moon className="h-4 w-4 text-[#b36f5d]" />
              当前主星系
            </div>
            {selectedClusterData && selectedTone && (
              <>
                <div className="mb-4 flex items-start gap-3">
                  <span className="mt-1 h-4 w-4 rounded-full shadow-inner" style={{ background: paletteOf(selectedClusterData.id).main }} />
                  <div>
                    <h3 className="text-3xl font-bold text-stone-800">{selectedClusterData.label}</h3>
                    <p className="mt-2 text-base font-medium text-[#9c6d5f]">{selectedTone.metaphor}</p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-stone-500">{selectedTone.meaning}</p>
                <div className="mt-4 rounded-2xl bg-[#f7f1ec] p-4 text-sm leading-7 text-stone-600">
                  <span className="font-semibold text-stone-700">可以这样照顾自己：</span>
                  {selectedTone.care}
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                    <BookOpen className="h-4 w-4 text-[#b36f5d]" />
                    代表日记
                  </div>
                  {selectedClusterPoints.map(p => (
                    <button
                      key={p.diary_id}
                      onClick={() => navigate(`/diaries/${p.diary_id}`)}
                      className="group flex w-full items-center justify-between rounded-2xl border border-[#eadfd8] bg-white/70 px-3 py-2.5 text-left transition hover:border-[#d1b8aa] hover:bg-white"
                    >
                      <span>
                        <span className="block text-xs text-[#b36f5d]">{p.diary_date}</span>
                        <span className="line-clamp-1 text-sm font-medium text-stone-700">{p.title || '未命名日记'}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-[#b36f5d]" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </aside>

          <div className="relative overflow-hidden rounded-[30px] border border-[#eadfd8] bg-[#fffcf9]/90 p-4 shadow-[0_16px_40px_rgba(118,88,72,0.08)]">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="h-[430px] w-full">
              <defs>
                <radialGradient id="paperGlow" cx="50%" cy="45%" r="70%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#fbf3ee" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="28" fill="url(#paperGlow)" />
              {[150, 230, 310].map(r => (
                <circle key={r} cx={SVG_W / 2} cy={SVG_H / 2} r={r} fill="none" stroke="#eadfd8" strokeWidth="1" opacity="0.48" />
              ))}
              <line x1={PAD} y1={SVG_H / 2} x2={SVG_W - PAD} y2={SVG_H / 2} stroke="#eadfd8" strokeWidth="1" opacity="0.55" />
              <line x1={SVG_W / 2} y1={PAD} x2={SVG_W / 2} y2={SVG_H - PAD} stroke="#eadfd8" strokeWidth="1" opacity="0.55" />
              <text x={PAD + 4} y={SVG_H - 30} fontSize="12" fill="#a99e97">松开一点</text>
              <text x={SVG_W - PAD - 58} y={SVG_H - 30} fontSize="12" fill="#a99e97">更有掌控</text>
              <text x={PAD + 4} y={PAD - 18} fontSize="12" fill="#a99e97">更舒展</text>
              <text x={PAD + 4} y={SVG_H - PAD + 26} fontSize="12" fill="#a99e97">更低沉</text>

              {data.clusters.map(c => {
                const clusterPoints = data.points.filter(p => p.cluster === c.id)
                if (clusterPoints.length === 0) return null
                const cx = clusterPoints.reduce((sum, p) => sum + toSvgX(p.x), 0) / clusterPoints.length
                const cy = clusterPoints.reduce((sum, p) => sum + toSvgY(p.y), 0) / clusterPoints.length
                const maxR = Math.max(...clusterPoints.map(p => Math.hypot(toSvgX(p.x) - cx, toSvgY(p.y) - cy)), 34)
                const radius = clamp(maxR + 24, 54, 150)
                const colors = paletteOf(c.id)
                const active = selectedCluster === null || selectedCluster === c.id
                return (
                  <g key={`cluster-${c.id}`} opacity={active ? 1 : 0.16}>
                    <circle cx={cx} cy={cy} r={radius} fill={colors.soft} stroke={colors.main} strokeWidth="1" strokeDasharray="6 5" />
                    <text x={cx} y={cy - radius + 24} textAnchor="middle" fontSize="13" fontWeight="700" fill={colors.main}>{c.label}</text>
                  </g>
                )
              })}

              {visiblePoints.map(p => {
                const cx = toSvgX(p.x)
                const cy = toSvgY(p.y)
                const colors = paletteOf(p.cluster)
                const isHovered = hoveredPoint?.diary_id === p.diary_id
                const intensity = Math.abs(p.features?.arousal ?? 0) + Math.abs(p.features?.valence ?? 0)
                const r = clamp(6 + intensity * 3, 6, 12)
                return (
                  <g key={p.diary_id} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)} onClick={() => navigate(`/diaries/${p.diary_id}`)}>
                    <circle cx={cx} cy={cy} r={isHovered ? r + 12 : r + 6} fill={colors.glow} opacity={isHovered ? 0.95 : 0.55} />
                    <circle cx={cx} cy={cy} r={isHovered ? r + 2 : r} fill={colors.main} opacity={isHovered ? 1 : 0.82} stroke="#fffaf7" strokeWidth="3" />
                  </g>
                )
              })}
            </svg>

            {hoveredPoint && (
              <div className="absolute left-6 right-6 top-6 rounded-3xl border border-[#eadfd8] bg-white/94 p-4 shadow-[0_18px_50px_rgba(100,76,60,0.18)] backdrop-blur animate-fade-in sm:left-auto sm:w-[330px]">
                <div className="mb-1 text-xs font-medium text-[#b36f5d]">{hoveredPoint.diary_date} · {data.clusters.find(c => c.id === hoveredPoint.cluster)?.label}</div>
                <div className="line-clamp-1 text-base font-bold text-stone-800">{hoveredPoint.title || '未命名日记'}</div>
                <p className="mt-2 text-sm leading-6 text-stone-500">{pointSummary(hoveredPoint)}</p>
                <button onClick={() => navigate(`/diaries/${hoveredPoint.diary_id}`)} className="mt-3 text-xs font-semibold text-[#b36f5d]">查看这篇日记 →</button>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {data.clusters.map(c => {
            const tone = getClusterTone(c.label)
            const colors = paletteOf(c.id)
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCluster(selectedCluster === c.id ? null : c.id)}
                className={`rounded-[28px] border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(118,88,72,0.10)] ${selectedCluster === c.id ? 'border-stone-300 bg-white shadow-md' : 'border-[#eadfd8] bg-white/68'}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: colors.main }} />
                  <span className="text-lg font-bold text-stone-800">{c.label}</span>
                  <span className="ml-auto text-sm text-stone-400">{c.size} 篇</span>
                </div>
                <p className="text-sm font-medium text-[#9c6d5f]">{tone.metaphor}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">{tone.meaning}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.dominant_features.slice(0, 3).map(f => (
                    <span key={f.name} className="rounded-full bg-[#faf6f2] px-2.5 py-1 text-xs text-stone-500">
                      {featurePhrase(f.name, Number(f.value))}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </section>

        <section className="grid gap-3 rounded-[30px] border border-[#eadfd8] bg-white/70 p-5 shadow-sm sm:grid-cols-4">
          <StatCard label="平均明亮度" value={data.stats.avg_valence} desc={data.stats.avg_valence > 0.2 ? '偏积极' : data.stats.avg_valence < -0.2 ? '偏低沉' : '中性'} />
          <StatCard label="平均能量" value={data.stats.avg_arousal} desc={data.stats.avg_arousal > 0.45 ? '偏活跃' : '偏平静'} />
          <StatCard label="平均掌控感" value={data.stats.avg_dominance} desc={data.stats.avg_dominance > 0.35 ? '较有掌控' : '需要支持'} />
          <StatCard label="情绪波动" value={data.stats.valence_std} desc={data.stats.valence_std > 0.4 ? '波动较大' : '相对稳定'} />
        </section>

        {riskCluster && (
          <section className="rounded-[28px] border border-[#eadfd8] bg-[#fff8f4] p-5 text-sm leading-7 text-stone-600">
            <div className="mb-2 flex items-center gap-2 font-bold text-stone-800">
              <SunMedium className="h-4 w-4 text-[#e8927c]" />
              一个温柔提醒
            </div>
            你的星图里出现了「{riskCluster.label}」这一组记录。它不代表你“状态不好”，更像是系统帮你标出了需要被照顾的区域。可以点开这组日记，看看压力通常从哪里开始，又在什么时刻缓下来。
          </section>
        )}
      </main>
    </div>
  )
}

function ClusterChip({ active, onClick, color, label }: { active: boolean; onClick: () => void; color: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${active ? 'text-white shadow-lg' : 'border-[#eadfd8] bg-white/70 text-stone-600 hover:bg-white'}`}
      style={active ? { background: color, borderColor: color } : undefined}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: active ? 'rgba(255,255,255,0.82)' : color }} />
      {label}
    </button>
  )
}

function InsightChip({ label, value, tone }: { label: string; value: string; tone: 'sage' | 'amber' | 'blue' }) {
  const styles = {
    sage: 'border-[#d7ead1] bg-[#f3faf1] text-[#5f9861]',
    amber: 'border-[#f0dfac] bg-[#fff8df] text-[#ad7d10]',
    blue: 'border-[#d5e5f6] bg-[#f2f7fd] text-[#5d8bc5]',
  }[tone]
  return (
    <div className={`rounded-3xl border px-4 py-3 ${styles}`}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  )
}

function StatCard({ label, value, desc }: { label: string; value: number; desc: string }) {
  return (
    <div className="rounded-2xl bg-[#faf6f2]/70 p-4 text-center">
      <div className="text-xs text-stone-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-stone-800">{formatSigned(value)}</div>
      <div className="mt-1 text-xs text-stone-400">{desc}</div>
    </div>
  )
}

function featurePhrase(name: string, value: number) {
  const label = FEATURE_FRIENDLY[name]
  if (!label) return `${FEATURE_LABELS[name] ?? name} ${formatSigned(value)}`
  return value >= 0 ? label.high : label.low
}

function pointSummary(point: EmotionPoint) {
  const features = point.features ?? {}
  const parts = [
    featurePhrase('valence', features.valence ?? 0),
    featurePhrase('dominance', features.dominance ?? 0),
    featurePhrase('richness', features.richness ?? 0),
  ]
  return `这篇记录更接近「${parts.join('、')}」的状态。点击后可以回到原文，看看那天具体发生了什么。`
}

