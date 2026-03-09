"""
日记相关API端点
"""
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.diary import (
    DiaryCreate,
    DiaryUpdate,
    DiaryResponse,
    DiaryListResponse,
    TimelineEventResponse
)
from app.services.diary_service import diary_service, timeline_service
from app.core.deps import get_current_active_user
from app.models.database import User

router = APIRouter(prefix="/diaries", tags=["日记"])


# ==================== 日记CRUD ====================

@router.post("/", response_model=DiaryResponse, summary="创建日记")
async def create_diary(
    diary_data: DiaryCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    创建新日记

    - **title**: 日记标题（可选）
    - **content**: 日记内容（必填）
    - **diary_date**: 日记日期（默认今天）
    - **emotion_tags**: 情绪标签列表
    - **importance_score**: 重要性评分（1-10，默认5）
    - **images**: 图片URL列表
    """
    diary = await diary_service.create_diary(db, current_user.id, diary_data)
    return DiaryResponse.model_validate(diary)


@router.get("/", response_model=DiaryListResponse, summary="获取日记列表")
async def list_diaries(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页大小"),
    start_date: Optional[date] = Query(None, description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期"),
    emotion_tag: Optional[str] = Query(None, description="情绪标签过滤"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取日记列表（分页）

    支持按日期范围和情绪标签过滤
    """
    diaries, total = await diary_service.list_diaries(
        db,
        current_user.id,
        page=page,
        page_size=page_size,
        start_date=start_date,
        end_date=end_date,
        emotion_tag=emotion_tag
    )

    total_pages = (total + page_size - 1) // page_size

    return DiaryListResponse(
        items=[DiaryResponse.model_validate(d) for d in diaries],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{diary_id}", response_model=DiaryResponse, summary="获取日记详情")
async def get_diary(
    diary_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取指定日记的详情
    """
    diary = await diary_service.get_diary(db, diary_id, current_user.id)

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="日记不存在"
        )

    return DiaryResponse.model_validate(diary)


@router.put("/{diary_id}", response_model=DiaryResponse, summary="更新日记")
async def update_diary(
    diary_id: int,
    diary_data: DiaryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    更新日记

    只需要提供要更新的字段
    """
    diary = await diary_service.update_diary(
        db,
        diary_id,
        current_user.id,
        diary_data
    )

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="日记不存在"
        )

    return DiaryResponse.model_validate(diary)


@router.delete("/{diary_id}", summary="删除日记")
async def delete_diary(
    diary_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    删除指定日记
    """
    success = await diary_service.delete_diary(
        db,
        diary_id,
        current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="日记不存在"
        )

    return {"success": True, "message": "日记已删除"}


@router.get("/date/{target_date}", response_model=list[DiaryResponse], summary="获取指定日期的日记")
async def get_diaries_by_date(
    target_date: date,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取指定日期的所有日记
    """
    diaries = await diary_service.get_diaries_by_date(
        db,
        current_user.id,
        target_date
    )

    return [DiaryResponse.model_validate(d) for d in diaries]


# ==================== 时间轴 ====================

@router.get("/timeline/recent", response_model=list[TimelineEventResponse], summary="获取最近时间轴")
async def get_recent_timeline(
    days: int = Query(7, ge=1, le=30, description="天数"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取最近N天的时间轴事件
    """
    events = await timeline_service.get_recent_events(
        db,
        current_user.id,
        days=days
    )

    return [TimelineEventResponse.model_validate(e) for e in events]


@router.get("/timeline/range", response_model=list[TimelineEventResponse], summary="获取日期范围时间轴")
async def get_timeline_by_range(
    start_date: date = Query(..., description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期"),
    limit: int = Query(100, ge=1, le=500, description="返回数量限制"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取指定日期范围的时间轴事件
    """
    events = await timeline_service.get_timeline(
        db,
        current_user.id,
        start_date=start_date,
        end_date=end_date,
        limit=limit
    )

    return [TimelineEventResponse.model_validate(e) for e in events]


@router.get("/timeline/date/{target_date}", response_model=list[TimelineEventResponse], summary="获取指定日期时间轴")
async def get_timeline_by_date(
    target_date: date,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取指定日期的所有时间轴事件
    """
    events = await timeline_service.get_events_by_date(
        db,
        current_user.id,
        target_date
    )

    return [TimelineEventResponse.model_validate(e) for e in events]
