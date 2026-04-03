// 情绪统计图表组件 — 情绪漂浮气泡
import { useMemo, useState } from 'react'
import type { EmotionStats } from '@/types'

interface EmotionChartProps {
  data: EmotionStats[]
  type?: 'bubble' | 'donut'
}

// ==================== 完整情绪色谱 ====================
// 每种情绪都有独特颜色，按情绪色温分组
const EMOTION_COLORS: Record<string, string> = {
  // 暖阳系 — 积极高能量（琥珀金/暖橘）
  开心: '#E2A54E', 快乐: '#E2A54E', 愉快: '#DFAE5C',
  兴奋: '#E89B3E', 激动: '#E89B3E',
  喜悦: '#D4A04A', 欣喜: '#D4A04A',
  幸福: '#C8943C',

  // 柔绿系 — 成长/成就/踏实
  成就感: '#6EA872', 成长: '#6EA872',
  自豪: '#7DB87C', 充实: '#7AAF7A',
  踏实: '#89B88A', 欣慰: '#82B080',

  // 暖棕系 — 感恩/感动/温暖
  感恩: '#C4896A', 感动: '#CFA07A',
  温暖: '#C89070',

  // 薄荷系 — 平静/放松/释然
  平静: '#7DB8A8', 放松: '#8DC4B0',
  释然: '#96C7B8', 淡然: '#9ECBBE',
  坦然: '#8BC0AD', 轻松: '#92C6B2',
  满足: '#84B9A6',

  // 薰衣草系 — 期待/好奇
  期待: '#A882BE', 好奇: '#B090C4',

  // 雾蓝系 — 疲惫/无聊/倦怠
  疲惫: '#8398AD', 无聊: '#95A3B2',
  倦怠: '#8C9AAC',

  // 灰紫系 — 困惑/纠结/迷茫
  困惑: '#9590B3', 纠结: '#8D8AA8',
  犹豫: '#9A96B6', 迷茫: '#8E8BA8',

  // 暗橘系 — 担忧/焦虑/紧张/压力
  担忧: '#C08468', 焦虑: '#B8726A',
  紧张: '#BC7E6C', 不安: '#B87C68',
  烦躁: '#BA7A6A', 郁闷: '#A87A72',
  压力: '#B47C6C',

  // 青灰系 — 失落/难过/悲伤/孤独
  失落: '#6E84A0', 难过: '#6A7E9A',
  悲伤: '#607898', 沮丧: '#6A7E98',
  孤独: '#7888A0', 无助: '#6E7E96',
  心酸: '#7A8498',

  // 玫瑰灰系 — 委屈
  委屈: '#917B9A',

  // 赤陶系 — 愤怒/崩溃/恐惧/痛苦
  愤怒: '#B05858', 崩溃: '#8B5268',
  绝望: '#7C4E60', 恐惧: '#9A5E68',
  痛苦: '#8E5262', 懊悔: '#8A6678',

  // 中性
  平淡: '#B0A89E', 一般: '#B0A89E',
  普通: '#B0A89E', 正常: '#B0A89E',
}

const FALLBACK_COLOR = '#B0A89E'

function getEmotionColor(tag: string): string {
  if (EMOTION_COLORS[tag]) return EMOTION_COLORS[tag]
  // 模糊匹配
  for (const [key, color] of Object.entries(EMOTION_COLORS)) {
    if (tag.includes(key) || key.includes(tag)) return color
  }
  return FALLBACK_COLOR
}

// 导出色谱供其他组件使用
export { EMOTION_COLORS, getEmotionColor }

// ==================== 气泡布局算法 ====================
// 简单的力导向圆形排列：最大气泡在中心，其余按螺旋向外
interface BubbleItem {
  tag: string
  count: number
  percentage: number
  color: string
  r: number  // 半径
  x: number
  y: number
}

function layoutBubbles(data: EmotionStats[], width: number, height: number): BubbleItem[] {
  if (data.length === 0) return []

  const sorted = [...data].sort((a, b) => b.count - a.count)
  const maxCount = sorted[0].count
  const minR = 22
  const maxR = Math.min(58, Math.min(width, height) / 3.5)

  const items: BubbleItem[] = sorted.map((d) => {
    const ratio = maxCount > 0 ? d.count / maxCount : 0
    const r = minR + ratio * (maxR - minR)
    return {
      tag: d.tag, count: d.count, percentage: d.percentage,
      color: getEmotionColor(d.tag), r,
      x: width / 2, y: height / 2,
    }
  })

  // 将最大气泡放中心，其余螺旋排列
  const cx = width / 2
  const cy = height / 2
  items[0].x = cx
  items[0].y = cy

  // 放置其余气泡 — 螺旋 + 碰撞避免
  for (let i = 1; i < items.length; i++) {
    const item = items[i]
    let placed = false
    // 尝试不同角度和距离
    for (let dist = items[0].r + item.r + 4; dist < Math.max(width, height); dist += 6) {
      for (let a = 0; a < Math.PI * 2; a += 0.3) {
        const tx = cx + Math.cos(a + i * 0.8) * dist
        const ty = cy + Math.sin(a + i * 0.8) * dist
        // 边界检查
        if (tx - item.r < 4 || tx + item.r > width - 4 || ty - item.r < 4 || ty + item.r > height - 4) continue
        // 碰撞检查
        let collides = false
        for (let j = 0; j < i; j++) {
          const dx = tx - items[j].x
          const dy = ty - items[j].y
          const minDist = item.r + items[j].r + 3
          if (dx * dx + dy * dy < minDist * minDist) {
            collides = true
            break
          }
        }
        if (!collides) {
          item.x = tx
          item.y = ty
          placed = true
          break
        }
      }
      if (placed) break
    }
  }

  return items
}

// ==================== 气泡图组件 ====================

export default function EmotionChart({ data }: EmotionChartProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  const width = 520
  const height = 320

  const bubbles = useMemo(() => layoutBubbles(data, width, height), [data])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm">
        暂无情绪数据
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden" style={{ maxWidth: width }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: height }}
      >
        <defs>
          {bubbles.map((b) => (
            <radialGradient key={`grad-${b.tag}`} id={`bg-${b.tag}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={b.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0.7" />
            </radialGradient>
          ))}
        </defs>

        {bubbles.map((b) => {
          const isHovered = hovered === b.tag
          const scale = isHovered ? 1.08 : 1
          return (
            <g
              key={b.tag}
              onMouseEnter={() => setHovered(b.tag)}
              onMouseLeave={() => setHovered(null)}
              style={{
                transform: `translate(${b.x}px, ${b.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'default',
              }}
            >
              {/* 外层光晕 */}
              <circle
                cx={0} cy={0} r={b.r + 3}
                fill="none"
                stroke={b.color}
                strokeOpacity={isHovered ? 0.3 : 0.12}
                strokeWidth={isHovered ? 3 : 1.5}
                style={{ transition: 'all 0.2s' }}
              />
              {/* 主气泡 */}
              <circle
                cx={0} cy={0} r={b.r}
                fill={`url(#bg-${b.tag})`}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1.5}
              />
              {/* 高光 */}
              <ellipse
                cx={-b.r * 0.22} cy={-b.r * 0.28}
                rx={b.r * 0.35} ry={b.r * 0.2}
                fill="rgba(255,255,255,0.22)"
              />
              {/* 情绪名称 */}
              <text
                x={0} y={b.r > 28 ? -4 : -2}
                textAnchor="middle"
                fontSize={b.r > 35 ? 13 : b.r > 28 ? 11.5 : 10}
                fontWeight={700}
                fill="#ffffff"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.15)', pointerEvents: 'none' }}
              >
                {b.tag}
              </text>
              {/* 次数 */}
              <text
                x={0} y={b.r > 28 ? 14 : 11}
                textAnchor="middle"
                fontSize={b.r > 35 ? 12 : 10}
                fill="rgba(255,255,255,0.92)"
                style={{ pointerEvents: 'none' }}
              >
                {b.count}次
              </text>
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (() => {
        const b = bubbles.find((b) => b.tag === hovered)
        if (!b) return null
        return (
          <div className="flex items-center justify-center gap-4 pt-1 pb-2 text-xs text-stone-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
            <span className="font-medium text-stone-600">{b.tag}</span>
            <span>{b.count} 次</span>
            <span className="text-stone-400">{b.percentage}%</span>
          </div>
        )
      })()}
    </div>
  )
}
