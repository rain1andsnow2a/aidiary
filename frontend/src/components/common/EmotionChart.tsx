// 情绪统计图表组件
import {
  ScatterChart,
  Scatter,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { EmotionStats } from '@/types'

interface EmotionChartProps {
  data: EmotionStats[]
  type?: 'bubble' | 'donut'
}

const EMOTION_COLORS: Record<string, string> = {
  开心: '#E6B24D',
  兴奋: '#F59E4A',
  感恩: '#C77D5F',
  满足: '#8FA7D8',
  平静: '#8EAFA2',
  释然: '#A3C7BD',
  期待: '#B07CBF',
  成就感: '#7FAF72',
  成长: '#6E9A67',
  困惑: '#9A95B8',
  纠结: '#8F8CA7',
  担忧: '#C58A72',
  焦虑: '#B97878',
  紧张: '#C0826B',
  失落: '#7183A6',
  难过: '#6A7C9C',
  悲伤: '#607A9A',
  委屈: '#8B7D9A',
  疲惫: '#7F8FA3',
  愤怒: '#B55D5D',
  崩溃: '#7B4B5A',
  感动: '#D3A97A',
  轻松: '#9CC3AF',
  其他: '#B6AEA4',
}

function getEmotionColor(tag: string) {
  return EMOTION_COLORS[tag] || EMOTION_COLORS['其他']
}

function buildBubbleData(data: EmotionStats[]) {
  const sorted = [...data].sort((a, b) => b.count - a.count)
  const n = Math.max(sorted.length, 1)
  const max = sorted[0]?.count || 1

  return sorted.map((item, index) => {
    const angle = (index / n) * Math.PI * 2
    const radius = 20 + Math.floor(index / 2) * 14
    const x = 50 + Math.cos(angle) * radius
    const y = 50 + Math.sin(angle) * radius
    const z = 28 + (item.count / max) * 62
    return { x, y, z, tag: item.tag, count: item.count, percentage: item.percentage, color: getEmotionColor(item.tag) }
  })
}

export function EmotionBubbleChart({ data }: { data: EmotionStats[] }) {
  const chartData = buildBubbleData(data)

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 12, right: 10, bottom: 12, left: 10 }}>
        <ZAxis dataKey="z" range={[420, 6600]} />
        <Tooltip
          cursor={false}
          contentStyle={{
            borderRadius: 14,
            border: '1px solid #EFE4DE',
            background: 'rgba(255,253,250,0.98)',
            boxShadow: '0 8px 20px rgba(120,95,85,0.12)',
          }}
          formatter={(_value, _name, payload: any) => [`${payload?.payload?.count ?? 0} 次`, '出现次数']}
          labelFormatter={(_, payload: any[]) => payload?.[0]?.payload?.tag || ''}
        />
        <Scatter data={chartData} shape={(props: any) => {
          const { cx, cy, payload, size } = props
          const r = Math.max(18, Math.min(52, Math.sqrt(size) / 2.3))
          return (
            <g>
              <circle cx={cx} cy={cy} r={r} fill={payload.color} fillOpacity={0.82} stroke="rgba(255,255,255,0.92)" strokeWidth={2} />
              <text x={cx} y={cy - 2} textAnchor="middle" fontSize={12} fontWeight={700} fill="#ffffff">
                {payload.tag}
              </text>
              <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.95)">
                {payload.count}次
              </text>
            </g>
          )
        }}>
          {chartData.map((entry, idx) => (
            <Cell key={`bubble-${idx}`} fill={entry.color} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default function EmotionChart({ data }: EmotionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        暂无数据
      </div>
    )
  }
  return <EmotionBubbleChart data={data} />
}
