// AI分析相关类型定义

export interface AnalysisRequest {
  diary_id?: number
  window_days?: number
  max_diaries?: number
}

export interface ComprehensiveAnalysisRequest {
  window_days?: number
  max_diaries?: number
  focus?: string
}

export interface EvidenceItem {
  diary_id: number
  diary_date: string
  title: string
  snippet: string
  reason: string
  score: number
}

export interface ComprehensiveAnalysisResponse {
  summary: string
  key_themes: string[]
  emotion_trends: string[]
  continuity_signals: string[]
  turning_points: string[]
  growth_suggestions: string[]
  evidence: EvidenceItem[]
  metadata: {
    analysis_scope: string
    window_days: number
    analyzed_diary_count: number
    retrieved_chunk_count: number
    retrieval_strategy?: string
    ranking_formula?: string
    period: {
      start_date: string
      end_date: string
    }
  }
}

// ── 冰山综合分析类型 ──────────────────────────────────

export interface IcebergBehaviorPattern {
  behavior: string
  frequency: string
  evidence_dates: string[]
}

export interface IcebergBehaviorLayer {
  patterns: IcebergBehaviorPattern[]
  summary: string
}

export interface EmotionPhase {
  phase: string
  dominant_emotion: string
  color: 'warm' | 'cool' | 'neutral' | string
  description: string
}

export interface EmotionTurningPoint {
  date: string
  description: string
}

export interface IcebergEmotionLayer {
  emotion_flow: EmotionPhase[]
  turning_points: EmotionTurningPoint[]
  summary: string
}

export interface ThoughtPattern {
  pattern: string
  trigger: string
  evidence_snippet: string
}

export interface IcebergCognitionLayer {
  thought_patterns: ThoughtPattern[]
  summary: string
}

export interface IcebergCoreBelief {
  belief: string
  origin_hint: string
  impact: string
}

export interface IcebergBeliefLayer {
  core_beliefs: IcebergCoreBelief[]
  self_narrative: string
  summary: string
}

export interface IcebergYearning {
  yearning: string
  connection: string
}

export interface IcebergYearningLayer {
  yearnings: IcebergYearning[]
  life_energy: string
  summary: string
}

export interface IcebergAgentRun {
  agent_code: string
  agent_name: string
  status: 'success' | 'error'
  duration_ms: number
  error?: string
}

export interface IcebergAnalysisResponse {
  behavior_layer: IcebergBehaviorLayer
  emotion_layer: IcebergEmotionLayer
  cognition_layer: IcebergCognitionLayer
  belief_layer: IcebergBeliefLayer
  yearning_layer: IcebergYearningLayer
  letter: string
  evidence: EvidenceItem[]
  metadata: {
    analysis_scope: string
    window_days: number
    analyzed_diary_count: number
    retrieved_chunk_count: number
    processing_time: number
    agent_runs: IcebergAgentRun[]
    period: {
      start_date: string
      end_date: string
    }
  }
}

export interface DailyGuidanceResponse {
  question: string
  source: 'ai' | 'fallback' | string
  metadata: Record<string, any>
}

export interface SocialStyleSamplesResponse {
  total: number
  samples: string[]
  metadata: Record<string, any>
}

export interface TimelineEventAnalysis {
  event_summary: string
  emotion_tag: string
  importance_score: number
  event_type: string
  related_entities: Record<string, any>
}

export interface EmotionLayer {
  surface_emotion: string
  underlying_emotion?: string
  emotion_intensity?: number
  emotion_description?: string
}

export interface CognitiveLayer {
  irrational_beliefs?: string[]
  automatic_thoughts?: string[]
  cognitive_patterns?: string[]
}

export interface BeliefLayer {
  core_beliefs?: string[]
  life_rules?: string[]
  value_system?: string[]
}

export interface CoreSelfLayer {
  deepest_desire?: string
  universal_needs?: string[]
  life_energy?: string
}

export interface SatirAnalysis {
  behavior_layer: Record<string, any>
  emotion_layer: EmotionLayer
  cognitive_layer: CognitiveLayer
  belief_layer: BeliefLayer
  core_self_layer: CoreSelfLayer
}

export interface SocialPost {
  version: string
  style: string
  content: string
}

export interface AnalysisMetadata {
  processing_time: number
  current_step: string
  error?: string
  analysis_scope?: 'single_diary' | 'user_integrated'
  analyzed_diary_count?: number
  analyzed_period?: {
    start_date: string
    end_date: string
    anchor_date: string
    window_days: number
  }
  analyzed_diary_ids?: number[]
  workflow?: string[]
  agent_runs?: Array<{
    agent_code: string
    agent_name: string
    model: string
    step: string
    status: 'running' | 'success' | 'error'
    started_at: number
    ended_at?: number
    duration_ms?: number
    error?: string
  }>
  persist_warning?: string
}

export interface AnalysisResponse {
  diary_id: number
  user_id: number
  timeline_event: TimelineEventAnalysis
  satir_analysis: SatirAnalysis
  therapeutic_response: string
  social_posts: SocialPost[]
  metadata: AnalysisMetadata
}
