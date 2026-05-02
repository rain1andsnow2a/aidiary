// 日记相关类型定义

export type EmotionTag = string
export type EventType = 'work' | 'relationship' | 'health' | 'achievement' | 'other'

export interface Diary {
  id: number
  user_id: number
  title: string
  content: string
  content_html?: string
  diary_date: string
  emotion_tags: EmotionTag[]
  importance_score: number
  word_count: number
  media_urls: string[]
  created_at: string
  updated_at: string
  is_analyzed: boolean
}

export interface DiaryCreate {
  title: string
  content: string
  content_html?: string
  diary_date?: string
  emotion_tags?: EmotionTag[]
  importance_score?: number
  media_urls?: string[]
}

export interface DiaryUpdate {
  title?: string
  content?: string
  content_html?: string
  diary_date?: string
  emotion_tags?: EmotionTag[]
  importance_score?: number
  media_urls?: string[]
}

export interface DiaryListResponse {
  items: Diary[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TimelineEvent {
  id: number
  diary_id: number
  event_summary: string
  emotion_tag: string
  importance_score: number
  event_type: EventType
  related_entities: Record<string, any>
  event_date: string
  created_at: string
}

export interface EmotionStats {
  tag: string
  count: number
  percentage: number
}

export interface TerrainEvent {
  id: number | null
  diary_id: number
  summary: string
  emotion_tag: string | null
  importance_score: number
  event_type: EventType | null
  source_label?: string
}

export interface TerrainPoint {
  date: string
  energy: number | null
  valence: number | null
  density: number
  events: TerrainEvent[]
}

export interface TerrainPeak {
  date: string
  value: number
  label: string
  summary: string
}

export interface TerrainValley {
  date_range: [string, string]
  min_value: number
  days: number
  label: string
  summary: string
}

export interface TerrainInsights {
  peaks: TerrainPeak[]
  valleys: TerrainValley[]
  trend: 'ascending' | 'descending' | 'stable' | 'overall' | string
  trend_description: string
}

export interface TerrainMeta {
  start_date: string
  end_date: string
  total_events: number
  days_with_data: number
  total_days: number
}

export interface TerrainResponse {
  points: TerrainPoint[]
  insights: TerrainInsights
  meta: TerrainMeta
}

export interface DashboardInsightEmotion {
  tag: string
  label: string
  count: number
  percentage: number
}

export interface DashboardInsightDiary {
  id: number
  title: string
  diary_date: string
  emotion_tags: EmotionTag[]
  summary: string
  word_count: number
  importance_score: number
  is_analyzed: boolean
  analysis_path: string
}

export interface DashboardInsights {
  window_days: number
  generated_at: string
  stats: {
    total_diaries: number
    last_days_count: number
    this_month_count: number
    top_emotion: string
    top_emotion_label: string
    top_emotion_count: number
    trend: 'ascending' | 'descending' | 'stable' | string
    trend_label: string
    trend_delta: number
    risk_label: string
    risk_desc: string
    negative_ratio: number
  }
  ai_observation: {
    title: string
    summary: string
    encouragement: string
    source: string
  }
  emotion_stats: DashboardInsightEmotion[]
  insights: string[]
  recent_diaries: DashboardInsightDiary[]
  analysis_entry: {
    overall_path: string
    single_diary_path_template: string
    description: string
  }
}

export interface CareProgress {
  active_days: number
  actual_streak: number
  protected_streak: number
  shield_balance: number
  shielded_days: number
  shield_awarded: boolean
  shield_max: number
  weekly_goal: number
  weekly_active_count: number
  weekly_completed: boolean
  week_start: string
  today_status: 'ACTIVE' | 'REST' | 'SHIELDED' | 'MISSED' | 'PENDING' | string
  recent_statuses: Array<{
    date: string
    status: 'ACTIVE' | 'REST' | 'SHIELDED' | 'MISSED' | 'PENDING' | string
  }>
  message: string
}

export interface GrowthDailyInsight {
  date: string
  primary_emotion?: string
  summary?: string
  has_content: boolean
  cached: boolean
  source?: string
  message?: string
}

export interface PlanetEntry {
  emotion: string
  label: string
  planet: string
  emoji: string
  unlocked: boolean
  first_unlocked: string | null
  count: number
}

export interface PlanetCollection {
  total: number
  unlocked: number
  planets: PlanetEntry[]
}

export interface HeartLightCheckinPayload {
  emotion: string
  energy: number
  event?: string | null
  one_line_text?: string | null
  reflection_key?: string | null
  is_rest?: boolean
}

export interface HeartLightCheckin {
  id: number
  user_id: number
  checkin_date: string
  emotion: string
  energy: number
  event: string | null
  one_line_text: string | null
  reflection_key: string | null
  is_rest: boolean
  awarded_points: number
  created_at: string
  updated_at: string
}

export interface HeartLightCheckinSubmitResponse {
  checkin: HeartLightCheckin
  points_delta: number
  total_points: number
  new_planet: string | null
  streak: number
  shield_balance: number
}

export interface MonthCheckinDay {
  date: string
  emotion: string
  energy: number
  event: string | null
  is_rest: boolean
  one_line_excerpt: string | null
}

export interface MonthCheckinsResponse {
  month: string
  days: MonthCheckinDay[]
  diary_dates: string[]
  streak: number
  total_points: number
}

export type LightPointReason = 'checkin' | 'one_line' | 'planet_unlock' | string

export interface LightPointLedgerEntry {
  id: number
  delta: number
  reason: LightPointReason
  ref_date: string
  ref_id: number | null
  meta: Record<string, any> | null
  created_at: string
}

export interface LightPointsSummary {
  total: number
  recent_ledger: LightPointLedgerEntry[]
}

export interface LightPointByReason {
  checkin: number
  one_line: number
  planet_unlock: number
}

export interface TreasureTopDay {
  date: string | null
  points: number
}

export interface TreasureTopWeek {
  week_start: string | null
  points: number
}

export interface TreasureShield {
  balance: number
  max: number
  last_reward_streak: number
}

export interface TreasurePlanets {
  unlocked: number
  total: number
}

export interface TreasureResponse {
  total: number
  by_reason: LightPointByReason
  this_week_points: number
  this_month_points: number
  all_time_count: number
  top_day: TreasureTopDay
  top_week: TreasureTopWeek
  shield: TreasureShield
  planets: TreasurePlanets
  recent_ledger: LightPointLedgerEntry[]
}
