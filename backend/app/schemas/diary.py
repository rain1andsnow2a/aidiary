"""
日记相关的 Pydantic Schemas
"""
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field, field_validator


class DiaryCreate(BaseModel):
    """创建日记请求"""
    title: Optional[str] = Field(None, max_length=200, description="日记标题")
    content: str = Field(..., min_length=1, max_length=10000, description="日记内容")
    content_html: Optional[str] = Field(None, max_length=50000, description="日记HTML内容")
    diary_date: Optional[date] = Field(None, description="日记日期")
    emotion_tags: Optional[List[str]] = Field(None, description="情绪标签列表")
    importance_score: int = Field(default=5, ge=1, le=10, description="重要性评分（1-10）")
    images: Optional[List[str]] = Field(None, description="图片URL列表")

    @field_validator('diary_date', mode='before')
    @classmethod
    def set_default_date(cls, v):
        """如果没有提供日期，使用今天"""
        if v is None:
            return date.today()
        return v

    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        """验证内容不为空"""
        if not v or not v.strip():
            raise ValueError('日记内容不能为空')
        return v


class DiaryUpdate(BaseModel):
    """更新日记请求"""
    title: Optional[str] = Field(None, max_length=200, description="日记标题")
    content: Optional[str] = Field(None, min_length=1, max_length=10000, description="日记内容")
    content_html: Optional[str] = Field(None, max_length=50000, description="日记HTML内容")
    diary_date: Optional[date] = Field(None, description="日记日期")
    emotion_tags: Optional[List[str]] = Field(None, description="情绪标签列表")
    importance_score: Optional[int] = Field(None, ge=1, le=10, description="重要性评分（1-10）")
    images: Optional[List[str]] = Field(None, description="图片URL列表")
    is_analyzed: Optional[bool] = Field(None, description="是否已分析")


class DiaryResponse(BaseModel):
    """日记响应"""
    id: int
    user_id: int
    title: Optional[str]
    content: str
    content_html: Optional[str]
    diary_date: date
    emotion_tags: Optional[List[str]]
    importance_score: int
    word_count: int
    images: Optional[List[str]]
    is_analyzed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DiaryListResponse(BaseModel):
    """日记列表响应"""
    items: List[DiaryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class TimelineEventCreate(BaseModel):
    """创建时间轴事件请求"""
    diary_id: Optional[int] = Field(None, description="关联的日记ID")
    event_date: date = Field(..., description="事件日期")
    event_summary: str = Field(..., min_length=1, max_length=500, description="事件摘要")
    emotion_tag: Optional[str] = Field(None, max_length=50, description="情绪标签")
    importance_score: int = Field(default=5, ge=1, le=10, description="重要性评分")
    event_type: Optional[str] = Field(None, max_length=50, description="事件类型")
    related_entities: Optional[dict] = Field(None, description="相关实体")


class TimelineEventResponse(BaseModel):
    """时间轴事件响应"""
    id: int
    user_id: int
    diary_id: Optional[int]
    event_date: date
    event_summary: str
    emotion_tag: Optional[str]
    importance_score: int
    event_type: Optional[str]
    related_entities: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


class HeartLightCheckinCreate(BaseModel):
    """心灯签到入参"""
    emotion: str = Field(..., max_length=20, description="情绪键：happy/calm/neutral/sad/anxious/angry/exhausted/rest")
    energy: int = Field(default=3, ge=1, le=5, description="能量 1-5")
    event: Optional[str] = Field(None, max_length=40, description="事件键：study/family/...")
    one_line_text: Optional[str] = Field(None, max_length=500, description="一句话心情")
    reflection_key: Optional[str] = Field(None, max_length=40, description="反思选项 key")
    is_rest: bool = Field(default=False, description="是否为休息日（今天不想写）")

    @field_validator("emotion")
    @classmethod
    def _strip_emotion(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("emotion 不能为空")
        return v

    @field_validator("one_line_text", mode="before")
    @classmethod
    def _normalize_one_line(cls, v):
        if v is None:
            return None
        v = str(v).strip()
        return v or None


class HeartLightCheckinOut(BaseModel):
    """心灯签到 DTO"""
    id: int
    user_id: int
    checkin_date: date
    emotion: str
    energy: int
    event: Optional[str]
    one_line_text: Optional[str]
    reflection_key: Optional[str]
    is_rest: bool
    awarded_points: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LightPointLedgerOut(BaseModel):
    """映光流水条目"""
    id: int
    delta: int
    reason: str  # checkin / one_line / planet_unlock
    ref_date: date
    ref_id: Optional[int]
    meta: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


class LightPointsSummary(BaseModel):
    """映光总览"""
    total: int
    recent_ledger: List[LightPointLedgerOut]


class HeartLightCheckinSubmitResponse(BaseModel):
    """提交签到后的返回结构"""
    checkin: HeartLightCheckinOut
    points_delta: int
    total_points: int
    new_planet: Optional[str] = None
    streak: int
    shield_balance: int


class MonthCheckinDay(BaseModel):
    """月历单日"""
    date: date
    emotion: str
    energy: int
    event: Optional[str]
    is_rest: bool
    one_line_excerpt: Optional[str] = None


class MonthCheckinsResponse(BaseModel):
    """月历响应"""
    month: str  # YYYY-MM
    days: List[MonthCheckinDay]
    diary_dates: List[date]
    streak: int
    total_points: int


class LightPointByReason(BaseModel):
    """按来源汇总"""
    checkin: int = 0
    one_line: int = 0
    planet_unlock: int = 0


class TreasureTopDay(BaseModel):
    """映光峰值：某一天获得最多"""
    date: Optional[date] = None
    points: int = 0


class TreasureTopWeek(BaseModel):
    """映光峰值：某一周"""
    week_start: Optional[date] = None
    points: int = 0


class TreasureShield(BaseModel):
    balance: int
    max: int
    last_reward_streak: int


class TreasurePlanets(BaseModel):
    unlocked: int
    total: int


class TreasureResponse(BaseModel):
    """资产页聚合数据"""
    total: int
    by_reason: LightPointByReason
    this_week_points: int
    this_month_points: int
    all_time_count: int
    top_day: TreasureTopDay
    top_week: TreasureTopWeek
    shield: TreasureShield
    planets: TreasurePlanets
    recent_ledger: List[LightPointLedgerOut]
