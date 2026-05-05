"""
每日定时任务服务
- 每天 0:00 自动检查当天有更新的日记
- 对未分析的日记调用大模型进行时间轴事件精炼
- 更新成长中心数据
- 每周一次向辅导员/心理老师推送绑定范围内的分析摘要
"""
import asyncio
from datetime import datetime, date, timedelta, time as dtime

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import async_session_maker, set_rls_service_context
from app.models.database import User
from app.models.diary import Diary, TimelineEvent
from app.core.config import settings
from app.core.logging import logger


async def _analyze_user_diaries_for_date(
    db: AsyncSession,
    user_id: int,
    target_date: date,
) -> int:
    """
    对指定用户在 target_date 当天新增/修改且尚未被AI精炼的日记，
    逐篇调用 refine_event_from_diary_with_ai 进行分析。
    返回处理的日记数。
    """
    from app.services.diary_service import timeline_service

    # 查找该用户当天创建或更新的日记
    result = await db.execute(
        select(Diary).where(
            and_(
                Diary.user_id == user_id,
                Diary.diary_date == target_date,
            )
        )
    )
    diaries = list(result.scalars().all())
    if not diaries:
        return 0

    processed = 0
    for diary in diaries:
        # 检查是否已经有 AI 精炼过的时间轴事件
        ev_result = await db.execute(
            select(TimelineEvent).where(
                and_(
                    TimelineEvent.user_id == user_id,
                    TimelineEvent.diary_id == diary.id,
                )
            ).limit(1)
        )
        existing_event = ev_result.scalar_one_or_none()

        # 如果已有 AI 精炼结果，跳过
        if existing_event:
            source = (existing_event.related_entities or {}).get("source", "")
            if source == "ai_analysis":
                continue

        try:
            await timeline_service.refine_event_from_diary_with_ai(
                db=db,
                user_id=user_id,
                diary_id=diary.id,
            )
            processed += 1
            logger.info(
                "scheduler refine ok user={uid} diary={did}",
                uid=user_id,
                did=diary.id,
            )
        except Exception as e:
            logger.error(
                "scheduler refine error user={uid} diary={did} err={err}",
                uid=user_id,
                did=diary.id,
                err=str(e),
            )

    return processed


async def run_daily_analysis():
    """
    扫描所有用户，对昨天和今天有日记记录的用户执行规则提取 + AI精炼。
    覆盖两天是因为：保存日记时不再即时处理，需要在午夜把当天的日记也一并分析。
    """
    today = date.today()
    yesterday = today - timedelta(days=1)
    target_dates = [yesterday, today]
    logger.info(
        "scheduler daily_analysis begin target_dates={start}..{end}",
        start=yesterday,
        end=today,
    )

    async with async_session_maker() as db:
        await set_rls_service_context(db)
        # 找出这两天有日记的所有用户
        user_result = await db.execute(
            select(Diary.user_id).where(
                Diary.diary_date.in_(target_dates)
            ).distinct()
        )
        user_ids = [row[0] for row in user_result.all()]

        if not user_ids:
            logger.info("scheduler daily_analysis skip (no diaries in window)")
            return

        total = 0
        for uid in user_ids:
            for td in target_dates:
                count = await _analyze_user_diaries_for_date(db, uid, td)
                total += count

        logger.info(
            "scheduler daily_analysis done users={u} processed={p}",
            u=len(user_ids),
            p=total,
        )


async def run_growth_analysis_for_range(
    *,
    start_date: date,
    end_date: date,
    user_id: int | None = None,
) -> dict:
    """
    手动执行一段时间内的成长分析，供脚本或本地调试调用。

    逻辑与午夜定时任务一致：
    - 仅处理指定日期范围内存在日记的用户/日期
    - 对每篇日记补齐/刷新时间轴事件，并尝试 AI 精炼
    """
    if start_date > end_date:
        raise ValueError("start_date 不能晚于 end_date")

    target_dates = []
    current = start_date
    while current <= end_date:
        target_dates.append(current)
        current += timedelta(days=1)

    logger.info(
        "scheduler manual_growth_analysis begin start={s} end={e} user={u}",
        s=start_date,
        e=end_date,
        u=user_id,
    )

    async with async_session_maker() as db:
        await set_rls_service_context(db)
        user_query = select(Diary.user_id).where(Diary.diary_date.in_(target_dates))
        if user_id is not None:
            user_query = user_query.where(Diary.user_id == user_id)

        user_result = await db.execute(user_query.distinct())
        user_ids = [row[0] for row in user_result.all()]

        if not user_ids:
            logger.info("scheduler manual_growth_analysis skip (no diaries)")
            return {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "user_ids": [],
                "processed_diaries": 0,
                "target_dates": [d.isoformat() for d in target_dates],
            }

        total = 0
        for uid in user_ids:
            for td in target_dates:
                count = await _analyze_user_diaries_for_date(db, uid, td)
                total += count

        logger.info(
            "scheduler manual_growth_analysis done users={u} processed={p}",
            u=len(user_ids),
            p=total,
        )
        return {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "user_ids": user_ids,
            "processed_diaries": total,
            "target_dates": [d.isoformat() for d in target_dates],
        }


async def run_weekly_counselor_digest():
    """每周向辅导员/心理老师发送摘要邮件。"""
    today = date.today()
    if today.weekday() != settings.counselor_digest_weekday:
        return

    logger.info("scheduler weekly_digest begin today={d}", d=today)
    async with async_session_maker() as db:
        await set_rls_service_context(db)
        from app.services.counselor_digest_service import send_weekly_counselor_digests

        sent_count = await send_weekly_counselor_digests(db=db, today=today)
        logger.info("scheduler weekly_digest done sent={n}", n=sent_count)


def _seconds_until_midnight() -> float:
    """计算距离下一个午夜 (00:00) 的秒数"""
    now = datetime.now()
    tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return (tomorrow - now).total_seconds()


async def scheduler_loop():
    """
    无限循环调度器：每天 0:00 执行 run_daily_analysis。
    首次启动时等待到下一个午夜。
    """
    while True:
        wait = _seconds_until_midnight()
        logger.info("scheduler next run in {h:.1f}h", h=wait / 3600)
        await asyncio.sleep(wait)

        try:
            await run_daily_analysis()
            await run_weekly_counselor_digest()
        except Exception as e:
            logger.opt(exception=e).error("scheduler task failed")

        # 任务执行完后，额外等 60 秒避免在同一分钟内重复触发
        await asyncio.sleep(60)
