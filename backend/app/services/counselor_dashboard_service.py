"""
辅导员/心理老师专用看板聚合服务
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, timedelta

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import set_rls_service_context
from app.models.database import CounselorBinding, CounselorWeeklyDigestLog, User
from app.models.diary import Diary
from app.schemas.counselor import (
    BindingResponse,
    CounselorDashboardMetric,
    CounselorDashboardResponse,
    CounselorEmotionStat,
    CounselorFocusStudent,
    CounselorTrendPoint,
    CounselorWeeklyDigestPreview,
)

NEGATIVE_EMOTIONS = {
    "焦虑", "担忧", "失落", "难过", "疲惫", "崩溃", "愤怒", "委屈", "困惑", "纠结", "紧张",
}


def _mask_name(user: User) -> str:
    label = (user.username or user.email.split("@")[0] or f"用户{user.id}").strip()
    if len(label) <= 1:
        return label
    if len(label) == 2:
        return f"{label[0]}*"
    return f"{label[0]}{'*' * (len(label) - 2)}{label[-1]}"


def _scope_filter(bindings: list[CounselorBinding]):
    clauses = []
    for binding in bindings:
        if binding.scope_type == "department":
            clauses.append(User.department == binding.scope_name)
        elif binding.scope_type == "class":
            clauses.append(User.class_name == binding.scope_name)
    return or_(*clauses) if clauses else None


async def build_counselor_dashboard(
    db: AsyncSession,
    counselor: User,
    window_days: int = 14,
) -> CounselorDashboardResponse:
    await set_rls_service_context(db)

    today = date.today()
    start_date = today - timedelta(days=max(window_days - 1, 0))

    bindings_result = await db.execute(
        select(CounselorBinding)
        .where(CounselorBinding.user_id == counselor.id)
        .order_by(CounselorBinding.scope_type, CounselorBinding.scope_name)
    )
    bindings = list(bindings_result.scalars().all())
    scope_filter = _scope_filter(bindings)

    if scope_filter is None:
        return CounselorDashboardResponse(
            bindings=[],
            metrics=[
                CounselorDashboardMetric(label="绑定学生", value=0, detail="请先在管理员后台维护班级或院系归属"),
                CounselorDashboardMetric(label="近14天活跃", value=0, detail="暂无数据"),
                CounselorDashboardMetric(label="近14天记录", value=0, detail="暂无数据"),
                CounselorDashboardMetric(label="重点关注", value=0, detail="暂无数据"),
            ],
            trend=[],
            emotion_distribution=[],
            focus_students=[],
            weekly_digest=None,
        )

    students_result = await db.execute(
        select(User).where(and_(User.is_active == True, User.role == "student", scope_filter))
    )
    students = list(students_result.scalars().all())
    student_ids = [student.id for student in students]

    diaries: list[Diary] = []
    if student_ids:
        diaries_result = await db.execute(
            select(Diary).where(
                and_(
                    Diary.user_id.in_(student_ids),
                    Diary.diary_date >= start_date,
                    Diary.diary_date <= today,
                )
            )
        )
        diaries = list(diaries_result.scalars().all())

    diaries_by_user: dict[int, list[Diary]] = defaultdict(list)
    trend_bucket: dict[date, list[Diary]] = defaultdict(list)
    emotion_counter: Counter[str] = Counter()

    for diary in diaries:
        diaries_by_user[diary.user_id].append(diary)
        trend_bucket[diary.diary_date].append(diary)
        for emotion in diary.emotion_tags or []:
            if emotion:
                emotion_counter[emotion] += 1

    active_students = len(diaries_by_user)
    metrics = [
        CounselorDashboardMetric(label="绑定学生", value=len(students), detail="仅统计你负责的班级/院系"),
        CounselorDashboardMetric(label=f"近{window_days}天活跃", value=active_students, detail="至少有 1 篇记录"),
        CounselorDashboardMetric(label=f"近{window_days}天记录", value=len(diaries), detail="不含原始正文，仅作统计"),
    ]

    focus_students: list[CounselorFocusStudent] = []
    for student in students:
        student_diaries = diaries_by_user.get(student.id, [])
        if not student_diaries:
            continue

        negative_hits = sum(1 for diary in student_diaries if set(diary.emotion_tags or []) & NEGATIVE_EMOTIONS)
        high_importance_hits = sum(1 for diary in student_diaries if (diary.importance_score or 0) >= 8)
        dominant = Counter(
            emotion
            for diary in student_diaries
            for emotion in (diary.emotion_tags or [])
            if emotion
        ).most_common(1)

        score = negative_hits * 2 + high_importance_hits + len(student_diaries)
        if negative_hits >= 2 or high_importance_hits >= 2:
            risk_level = "较高"
        elif negative_hits >= 1 or high_importance_hits >= 1:
            risk_level = "中等"
        else:
            risk_level = "平稳"

        focus_students.append(
            CounselorFocusStudent(
                masked_name=_mask_name(student),
                department=student.department,
                class_name=student.class_name,
                diary_count=len(student_diaries),
                dominant_emotion=dominant[0][0] if dominant else "未标注",
                risk_level=risk_level,
                note=(
                    f"近 {window_days} 天记录 {len(student_diaries)} 篇，"
                    f"负向情绪 {negative_hits} 次，高重要性 {high_importance_hits} 次。"
                ),
                last_diary_date=max(student_diaries, key=lambda diary: diary.diary_date).diary_date.isoformat(),
            )
        )

    focus_students.sort(
        key=lambda item: (
            {"较高": 2, "中等": 1, "平稳": 0}[item.risk_level],
            item.diary_count,
        ),
        reverse=True,
    )
    metrics.append(
        CounselorDashboardMetric(
            label="重点关注",
            value=len([item for item in focus_students if item.risk_level != "平稳"]),
            detail="按负向情绪频次与重要性综合排序",
        )
    )

    trend: list[CounselorTrendPoint] = []
    cursor = start_date
    while cursor <= today:
        day_diaries = trend_bucket.get(cursor, [])
        trend.append(
            CounselorTrendPoint(
                date=cursor.isoformat(),
                diary_count=len(day_diaries),
                active_students=len({diary.user_id for diary in day_diaries}),
                avg_importance=round(
                    sum((diary.importance_score or 0) for diary in day_diaries) / len(day_diaries), 2
                ) if day_diaries else 0.0,
            )
        )
        cursor += timedelta(days=1)

    total_emotions = sum(emotion_counter.values())
    emotion_distribution = [
        CounselorEmotionStat(
            emotion=emotion,
            count=count,
            ratio=round(count / total_emotions, 4) if total_emotions else 0,
        )
        for emotion, count in emotion_counter.most_common(8)
    ]

    digest_result = await db.execute(
        select(CounselorWeeklyDigestLog)
        .where(CounselorWeeklyDigestLog.user_id == counselor.id)
        .order_by(CounselorWeeklyDigestLog.sent_at.desc())
        .limit(1)
    )
    latest_digest = digest_result.scalar_one_or_none()

    return CounselorDashboardResponse(
        bindings=[BindingResponse.model_validate(binding) for binding in bindings],
        metrics=metrics,
        trend=trend,
        emotion_distribution=emotion_distribution,
        focus_students=focus_students[:8],
        weekly_digest=(
            CounselorWeeklyDigestPreview(
                week_start=latest_digest.week_start.isoformat(),
                sent_at=latest_digest.sent_at.isoformat() if latest_digest.sent_at else None,
                summary=latest_digest.summary,
            )
            if latest_digest
            else None
        ),
    )
