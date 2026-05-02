// 心灯页共享常量
export const CHECKIN_EMOTIONS = [
  { key: 'happy', label: '开心', emoji: '😄', planet: '晴屿', description: '通常出现在你感到轻松、愿意靠近世界的时候。' },
  { key: 'calm', label: '平静', emoji: '🙂', planet: '静湾', description: '通常出现在你节奏稳定、心里有一点空间的时候。' },
  { key: 'neutral', label: '一般', emoji: '😐', planet: '灰原', description: '通常出现在你没有明显起伏，只是平平走过一天的时候。' },
  { key: 'sad', label: '低落', emoji: '😞', planet: '雨谷', description: '通常出现在你需要被理解、也需要慢一点的时候。' },
  { key: 'anxious', label: '焦虑', emoji: '😰', planet: '雾岛', description: '通常出现在你感到疲惫、任务很多或想独处的时候。' },
  { key: 'angry', label: '烦躁', emoji: '😡', planet: '赤丘', description: '通常出现在你的边界被触碰、能量被消耗的时候。' },
  { key: 'exhausted', label: '疲惫', emoji: '😴', planet: '眠星', description: '通常出现在身体想暂停、需要恢复的时候。' },
] as const

export const CHECKIN_EVENTS = [
  { key: 'study', label: '学习' },
  { key: 'relationship', label: '人际' },
  { key: 'family', label: '家庭' },
  { key: 'body', label: '身体' },
  { key: 'work', label: '工作' },
  { key: 'other', label: '其他' },
] as const

export const REFLECTION_OPTIONS = [
  { key: 'too_much', label: '事情太多' },
  { key: 'not_good_enough', label: '害怕做不好' },
  { key: 'where_to_start', label: '不知道从哪里开始' },
  { key: 'messy', label: '说不清，只是很乱' },
] as const

export type CheckinEmotion = typeof CHECKIN_EMOTIONS[number]

export function buildLightContent({
  emotionLabel,
  energy,
  eventLabel,
  oneLineText,
  reflectionLabel,
}: {
  emotionLabel: string
  energy: number
  eventLabel: string
  oneLineText: string
  reflectionLabel?: string
}) {
  const lines = [
    `今天我点亮了一盏心灯。`,
    `情绪：${emotionLabel}；能量：${energy}/5；事件：${eventLabel}。`,
  ]
  if (reflectionLabel) lines.push(`这份感受更像是：${reflectionLabel}。`)
  if (oneLineText.trim()) lines.push(oneLineText.trim())
  return lines.join('\n')
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function todayKey(prefix: string) {
  return `${prefix}.${new Date().toISOString().slice(0, 10)}`
}
