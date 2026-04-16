"""
辅导员/心理老师每周分析摘要服务
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, timedelta
from typing import Iterable

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import (
    CounselorBinding,
    CounselorWeeklyDigestLog,
    User,
    UserRole,
)
from app.models.diary import Diary
from app.services.email_service import email_service

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


def _build_scope_filter(bindings: Iterable[CounselorBinding]):
    clauses = []
    for binding in bindings:
        if binding.scope_type == "department":
            clauses.append(User.department == binding.scope_name)
        elif binding.scope_type == "class":
            clauses.append(User.class_name == binding.scope_name)
    return or_(*clauses) if clauses else None


async def _collect_digest_payload(
    db: AsyncSession,
    counselor: User,
    week_start: date,
    week_end: date,
) -> dict | None:
    bindings_result = await db.execute(
        select(CounselorBinding).where(CounselorBinding.user_id == counselor.id)
    )
    bindings = list(bindings_result.scalars().all())
    scope_filter = _build_scope_filter(bindings)

    if scope_filter is None:
        return None

    students_result = await db.execute(
        select(User).where(
            and_(
                User.role == UserRole.student.value,
                User.is_active == True,
                scope_filter,
            )
        )
    )
    students = list(students_result.scalars().all())
    if not students:
        return {
            "bindings": [f"{binding.scope_type}:{binding.scope_name}" for binding in bindings],
            "student_count": 0,
            "active_student_count": 0,
            "diary_count": 0,
            "top_emotions": [],
            "focus_students": [],
        }

    student_ids = [student.id for student in students]
    diaries_result = await db.execute(
        select(Diary).where(
            and_(
                Diary.user_id.in_(student_ids),
                Diary.diary_date >= week_start,
                Diary.diary_date <= week_end,
            )
        )
    )
    diaries = list(diaries_result.scalars().all())

    emotion_counter: Counter[str] = Counter()
    diaries_by_user: dict[int, list[Diary]] = defaultdict(list)
    for diary in diaries:
        diaries_by_user[diary.user_id].append(diary)
        for emotion in diary.emotion_tags or []:
            if emotion:
                emotion_counter[emotion] += 1

    active_student_ids = set(diaries_by_user.keys())
    focus_students = []
    for student in students:
        student_diaries = diaries_by_user.get(student.id, [])
        if not student_diaries:
            continue

        negative_hits = 0
        high_importance_hits = 0
        for diary in student_diaries:
            tags = set(diary.emotion_tags or [])
            if tags & NEGATIVE_EMOTIONS:
                negative_hits += 1
            if (diary.importance_score or 0) >= 8:
                high_importance_hits += 1

        attention_score = negative_hits * 2 + high_importance_hits + len(student_diaries)
        if attention_score <= 0:
            continue

        dominant = Counter(
            emotion
            for diary in student_diaries
            for emotion in (diary.emotion_tags or [])
            if emotion
        ).most_common(1)
        focus_students.append(
            {
                "name": _mask_name(student),
                "department": student.department,
                "class_name": student.class_name,
                "diary_count": len(student_diaries),
                "negative_hits": negative_hits,
                "high_importance_hits": high_importance_hits,
                "dominant_emotion": dominant[0][0] if dominant else "未标注",
                "attention_score": attention_score,
            }
        )

    focus_students.sort(key=lambda item: item["attention_score"], reverse=True)

    return {
        "bindings": [f"{binding.scope_type}:{binding.scope_name}" for binding in bindings],
        "student_count": len(students),
        "active_student_count": len(active_student_ids),
        "diary_count": len(diaries),
        "top_emotions": emotion_counter.most_common(5),
        "focus_students": focus_students[:5],
    }


def _render_digest_email(counselor: User, payload: dict, week_start: date, week_end: date) -> tuple[str, str]:
    title = f"【印记】每周学生情绪分析摘要｜{week_start.isoformat()} ~ {week_end.isoformat()}"
    scope_line = "、".join(payload["bindings"]) if payload["bindings"] else "未配置绑定范围"
    top_emotions = (
        "、".join(f"{name}({count})" for name, count in payload["top_emotions"])
        if payload["top_emotions"]
        else "暂无情绪标签数据"
    )

    focus_lines = []
    for item in payload["focus_students"]:
        focus_lines.append(
            f"- {item['name']}｜{item.get('department') or '-'} / {item.get('class_name') or '-'}｜"
            f"记录 {item['diary_count']} 篇，负向情绪 {item['negative_hits']} 次，"
            f"高重要性 {item['high_importance_hits']} 次，主情绪：{item['dominant_emotion']}"
        )

    if not focus_lines:
        focus_lines.append("- 本周暂无需要额外关注的学生")

    body = (
        f"{counselor.username or '老师'}，您好：\n\n"
        f"以下是您绑定范围内学生的每周情绪分析摘要（{week_start.isoformat()} ~ {week_end.isoformat()}）。\n\n"
        f"管理范围：{scope_line}\n"
        f"覆盖学生数：{payload['student_count']}\n"
        f"本周有记录学生数：{payload['active_student_count']}\n"
        f"本周日记总数：{payload['diary_count']}\n"
        f"高频情绪：{top_emotions}\n\n"
        "重点关注名单（仅展示脱敏后的统计特征，不含原始日记内容）：\n"
        f"{chr(10).join(focus_lines)}\n\n"
        "说明：\n"
        "- 该摘要仅基于绑定范围内学生近 7 天的日记情绪标签、重要性评分与活跃度自动生成。\n"
        "- 邮件不包含学生原始日记正文，便于辅导员/心理老师先做整体研判，再进入系统查看趋势与分析结果。\n\n"
        "印记团队"
    )
    return title, body


async def send_weekly_counselor_digests(db: AsyncSession, today: date | None = None) -> int:
    """向辅导员/心理老师发送每周摘要，返回成功发送数量。"""
    today = today or date.today()
    week_end = today - timedelta(days=1)
    week_start = week_end - timedelta(days=6)

    users_result = await db.execute(
        select(User).where(
            and_(
                User.is_active == True,
                User.role.in_([UserRole.counselor.value, UserRole.psychologist.value]),
            )
        )
    )
    counselors = list(users_result.scalars().all())
    if not counselors:
        return 0

    sent_count = 0
    for counselor in counselors:
        existing_result = await db.execute(
            select(CounselorWeeklyDigestLog).where(
                and_(
                    CounselorWeeklyDigestLog.user_id == counselor.id,
                    CounselorWeeklyDigestLog.week_start == week_start,
                )
            )
        )
        if existing_result.scalar_one_or_none():
            continue

        payload = await _collect_digest_payload(db, counselor, week_start, week_end)
        if payload is None:
            continue

        subject, body = _render_digest_email(counselor, payload, week_start, week_end)
        success = await email_service.send_plain_email(counselor.email, subject, body)
        if not success:
            continue

        db.add(
            CounselorWeeklyDigestLog(
                user_id=counselor.id,
                week_start=week_start,
                summary=payload,
            )
        )
        sent_count += 1

    if sent_count:
        await db.commit()
    return sent_count
