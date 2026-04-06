// 情绪星图 — 基于特征向量聚类的情绪可视化
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { emotionService, type EmotionClusterResult, type EmotionPoint } from '@/services/emotion.service'
import { toast } from '@/components/ui/toast'
import { Loader2, ArrowLeft, Info, Sparkles, BarChart3 } from 'lucide-react'

// 聚类调色板 — 温暖风
const CLUSTER_COLORS = [
  '#e8927c', // 珊瑚橙
  '#7cade8', // 天蓝
  '#a8d5a2', // 草绿
  '#d4a0d4', // 薰衣草
  '#e8d27c', // 暖金
  '#7ce8d5', // 薄荷
]

const CLUSTER_COLORS_LIGHT = [
  'rgba(232,146,124,0.15)',
  'rgba(124,173,232,0.15)',
  'rgba(168,213,162,0.15)',
  'rgba(212,160,212,0.15)',
  'rgba(232,210,124,0.15)',
  'rgba(124,232,213,0.15)',
]

export default function EmotionMap() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [data, setData] = useState<EmotionClusterResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<EmotionPoint | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  // 特征标签 - 使用翻译
  const featureLabels: Record<string, string> = useMemo(() => ({
    valence: t('emotionMap.features.valence'),
    arousal: t('emotionMap.features.arousal'),
    dominance: t('emotionMap.features.dominance'),
    self_ref: t('emotionMap.features.selfRef'),
    social: t('emotionMap.features.social'),
    cognitive: t('emotionMap.features.cognitive'),
    temporal: t('emotionMap.features.temporal'),
    richness: t('emotionMap.features.richness'),
  }), [t])

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

  // 过滤显示的点
  const visiblePoints = useMemo(() => {
    if (!data) return []
    if (selectedCluster === null) return data.points
    return data.points.filter(p => p.cluster === selectedCluster)
  }, [data, selectedCluster])

  // 计算坐标范围用于缩放
  const bounds = useMemo(() => {
    if (!data || data.points.length === 0) return { minX: -3, maxX: 3, minY: -3, maxY: 3 }
    const xs = data.points.map(p => p.x)
    const ys = data.points.map(p => p.y)
    const pad = 0.5
    return {
      minX: Math.min(...xs) - pad, maxX: Math.max(...xs) + pad,
      minY: Math.min(...ys) - pad, maxY: Math.max(...ys) + pad,
    }
  }, [data])

  // 坐标映射到 SVG
  const SVG_W = 600, SVG_H = 400, PAD = 40
  const toSvgX = useCallback((x: number) => {
    return PAD + ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * (SVG_W - PAD * 2)
  }, [bounds])
  const toSvgY = useCallback((y: number) => {
    return SVG_H - PAD - ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * (SVG_H - PAD * 2)
  }, [bounds])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c17f6e]" />
      </div>
    )
  }

  if (!data || data.points.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-400">
        <Sparkles className="w-12 h-12" />
        <p className="text-lg">{t('emotionMap.notEnoughDiaries')}</p>
        <p className="text-sm">{t('emotionMap.writeMoreHint')}</p>
        <button onClick={() => navigate('/diaries')} className="mt-2 px-4 py-2 rounded-xl bg-[#c17f6e] text-white text-sm">
          {t('emotionMap.goWrite')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf6f2] to-[#f3ede8] pb-20">
      {/* 顶栏 */}
      <div className="sticky top-0 z-20 bg-[#faf6f2]/80 backdrop-blur-md border-b border-[#e7dbd5]/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-[#f0e6df] transition">
            <ArrowLeft className="w-5 h-5 text-stone-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-stone-700">{t('emotionMap.title')}</h1>
            <p className="text-xs text-stone-400">{t('emotionMap.subtitle', { count: data.stats.total_diaries })}</p>
          </div>
          <button onClick={() => setShowInfo(!showInfo)} className="p-1.5 rounded-xl hover:bg-[#f0e6df] transition">
            <Info className="w-5 h-5 text-stone-400" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* 算法说明面板 */}
        {showInfo && (
          <div className="p-4 rounded-2xl bg-white/60 border border-[#e7dbd5]/50 text-xs text-stone-500 space-y-2 animate-fade-in">
            <p className="font-semibold text-stone-600">{t('emotionMap.algo.title')}</p>
            <p>{t('emotionMap.algo.desc1')}</p>
            <p className="font-mono text-[10px] bg-stone-50 p-2 rounded-lg">
              {t('emotionMap.algo.vector')}
            </p>
            <p>{t('emotionMap.algo.desc2')}</p>
            <p>{t('emotionMap.algo.silhouette')}: <b>{data.stats.silhouette_score}</b></p>
            {data.stats.explained_variance_2d.length > 0 && (
              <p>{t('emotionMap.algo.variance')}: <b>{(data.stats.explained_variance_2d.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%</b></p>
            )}
            <div className="flex gap-4 text-[10px]">
              <span>PC1: {data.pca_components.pc1_label}</span>
              <span>PC2: {data.pca_components.pc2_label}</span>
            </div>
          </div>
        )}

        {/* 聚类标签卡片 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCluster(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
              selectedCluster === null
                ? 'bg-stone-700 text-white border-stone-700'
                : 'bg-white/60 text-stone-500 border-[#e7dbd5] hover:bg-[#f0e6df]'
            }`}
          >
            {t('emotionMap.all')} ({data.points.length})
          </button>
          {data.clusters.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCluster(selectedCluster === c.id ? null : c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border flex items-center gap-1.5 ${
                selectedCluster === c.id
                  ? 'text-white border-transparent'
                  : 'bg-white/60 text-stone-600 border-[#e7dbd5] hover:bg-[#f0e6df]'
              }`}
              style={selectedCluster === c.id ? { background: CLUSTER_COLORS[c.id % CLUSTER_COLORS.length] } : {}}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: CLUSTER_COLORS[c.id % CLUSTER_COLORS.length] }} />
              {c.label} ({c.size})
            </button>
          ))}
        </div>

        {/* 散点图主体 */}
        <div className="relative rounded-2xl bg-white/70 border border-[#e7dbd5]/50 shadow-sm overflow-hidden">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full"
            style={{ maxHeight: '480px' }}
          >
            {/* 背景网格 */}
            {Array.from({ length: 7 }, (_, i) => {
              const x = PAD + ((SVG_W - PAD * 2) / 6) * i
              return <line key={`vg${i}`} x1={x} y1={PAD} x2={x} y2={SVG_H - PAD} stroke="#f0e6df" strokeWidth={0.5} />
            })}
            {Array.from({ length: 5 }, (_, i) => {
              const y = PAD + ((SVG_H - PAD * 2) / 4) * i
              return <line key={`hg${i}`} x1={PAD} y1={y} x2={SVG_W - PAD} y2={y} stroke="#f0e6df" strokeWidth={0.5} />
            })}

            {/* 坐标轴标签 */}
            <text x={SVG_W / 2} y={SVG_H - 8} textAnchor="middle" fontSize={10} fill="#a89990">
              {data.pca_components.pc1_label}
            </text>
            <text x={12} y={SVG_H / 2} textAnchor="middle" fontSize={10} fill="#a89990" transform={`rotate(-90, 12, ${SVG_H / 2})`}>
              {data.pca_components.pc2_label}
            </text>

            {/* 聚类区域背景（凸包简化为圆） */}
            {data.clusters.map(c => {
              const clusterPoints = data.points.filter(p => p.cluster === c.id)
              if (clusterPoints.length < 2) return null
              const cx = clusterPoints.reduce((s, p) => s + toSvgX(p.x), 0) / clusterPoints.length
              const cy = clusterPoints.reduce((s, p) => s + toSvgY(p.y), 0) / clusterPoints.length
              const maxR = Math.max(
                ...clusterPoints.map(p => Math.hypot(toSvgX(p.x) - cx, toSvgY(p.y) - cy)),
                20
              )
              return (
                <circle
                  key={`bg${c.id}`}
                  cx={cx} cy={cy} r={maxR + 15}
                  fill={CLUSTER_COLORS_LIGHT[c.id % CLUSTER_COLORS_LIGHT.length]}
                  stroke={CLUSTER_COLORS[c.id % CLUSTER_COLORS.length]}
                  strokeWidth={0.5}
                  strokeDasharray="4 2"
                  opacity={selectedCluster === null || selectedCluster === c.id ? 0.6 : 0.1}
                />
              )
            })}

            {/* 数据点 */}
            {visiblePoints.map(p => {
              const cx = toSvgX(p.x)
              const cy = toSvgY(p.y)
              const color = CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length]
              const isHovered = hoveredPoint?.diary_id === p.diary_id
              return (
                <g key={p.diary_id}>
                  <circle
                    cx={cx} cy={cy}
                    r={isHovered ? 8 : 5}
                    fill={color}
                    fillOpacity={isHovered ? 1 : 0.75}
                    stroke={isHovered ? '#4a3f3a' : color}
                    strokeWidth={isHovered ? 2 : 1}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => navigate(`/diaries/${p.diary_id}`)}
                  />
                  {isHovered && (
                    <text x={cx} y={cy - 14} textAnchor="middle" fontSize={10} fill="#4a3f3a" fontWeight={600}>
                      {p.title.length > 12 ? p.title.slice(0, 12) + '...' : p.title}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Hover 详情卡 */}
          {hoveredPoint && (
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/95 backdrop-blur-sm border border-[#e7dbd5] shadow-lg text-xs animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-700">{hoveredPoint.title}</span>
                <span className="text-stone-400">{hoveredPoint.diary_date}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(hoveredPoint.features).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <div className="text-[10px] text-stone-400">{featureLabels[key] || key}</div>
                    <div className="font-mono text-stone-600">{val.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 聚类详情卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.clusters.map(c => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                selectedCluster === c.id
                  ? 'bg-white border-stone-300 shadow-md'
                  : 'bg-white/50 border-[#e7dbd5]/50 hover:bg-white/80'
              }`}
              onClick={() => setSelectedCluster(selectedCluster === c.id ? null : c.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ background: CLUSTER_COLORS[c.id % CLUSTER_COLORS.length] }} />
                <span className="font-semibold text-stone-700">{c.label}</span>
                <span className="text-xs text-stone-400 ml-auto">{c.size} {t('emotionMap.entries')}</span>
              </div>
              {c.dominant_features.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {c.dominant_features.map(f => (
                    <span key={f.name} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-50 text-stone-500">
                      {f.label}: {f.value > 0 ? '+' : ''}{f.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 整体统计 */}
        <div className="p-4 rounded-2xl bg-white/50 border border-[#e7dbd5]/50">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-stone-400" />
            <span className="text-sm font-semibold text-stone-600">{t('emotionMap.overview')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label={t('emotionMap.stats.avgValence')} value={data.stats.avg_valence} desc={data.stats.avg_valence > 0.2 ? t('emotionMap.stats.positive') : data.stats.avg_valence < -0.2 ? t('emotionMap.stats.negative') : t('emotionMap.stats.neutral')} />
            <StatCard label={t('emotionMap.stats.avgArousal')} value={data.stats.avg_arousal} desc={data.stats.avg_arousal > 0.5 ? t('emotionMap.stats.excited') : t('emotionMap.stats.calm')} />
            <StatCard label={t('emotionMap.stats.avgDominance')} value={data.stats.avg_dominance} desc={data.stats.avg_dominance > 0.5 ? t('emotionMap.stats.inControl') : t('emotionMap.stats.passive')} />
            <StatCard label={t('emotionMap.stats.volatility')} value={data.stats.valence_std} desc={data.stats.valence_std > 0.4 ? t('emotionMap.stats.highVolatility') : t('emotionMap.stats.stable')} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, desc }: { label: string; value: number; desc: string }) {
  return (
    <div className="text-center p-2 rounded-xl bg-[#faf6f2]/60">
      <div className="text-[10px] text-stone-400 mb-0.5">{label}</div>
      <div className="text-lg font-bold text-stone-700">{value > 0 ? '+' : ''}{value.toFixed(2)}</div>
      <div className="text-[10px] text-stone-400">{desc}</div>
    </div>
  )
}
