"""
把历史上写入 diaries 表的心灯/休息行迁移到 heart_light_checkins。

识别规则：
  - title 以 '今日心灯：' 开头 → 心灯签到
  - title == '今天不想写' 或 emotion_tags 含 'rest' → 休息签到

流程（分用户、单事务）：
  1) 扫描 diaries，解析 emotion / energy / event / one_line_text
  2) 写入 heart_light_checkins（user_id + checkin_date 唯一，冲突跳过）
  3) 删除已迁移的 diary 行（级联删除 ai_analyses；timeline_events.diary_id 会 SET NULL）

用法：
  python -m scripts.migrate_heart_light_diaries --dry-run
  python -m scripts.migrate_heart_light_diaries
"""
import argparse
import asyncio
import re
from collections import defaultdict
from typing import Optional

from sqlalchemy import delete, select

from app.db import async_session_maker, init_db, set_rls_service_context
from app.models.diary import Diary, HeartLightCheckin


PLANET_LABEL_TO_KEY = {
    "开心": "happy",
    "平静": "calm",
    "一般": "neutral",
    "低落": "sad",
    "焦虑": "anxious",
    "烦躁": "angry",
    "疲惫": "exhausted",
}


ENERGY_RE = re.compile(r"能量：(\d)")
EVENT_RE = re.compile(r"事件：([^\n。；]+)")
TITLE_PREFIX = "今日心灯："
REST_TITLE = "今天不想写"


def _parse_emotion(title: Optional[str], tags: Optional[list]) -> Optional[str]:
    if tags:
        for tag in tags:
            key = (tag or "").strip().lower()
            if key and key != "rest":
                return key
    if title and title.startswith(TITLE_PREFIX):
        label = title[len(TITLE_PREFIX):].strip()
        return PLANET_LABEL_TO_KEY.get(label, label.lower() or None)
    return None


def _parse_energy(content: Optional[str]) -> int:
    if not content:
        return 3
    m = ENERGY_RE.search(content)
    if not m:
        return 3
    try:
        val = int(m.group(1))
        if 1 <= val <= 5:
            return val
    except ValueError:
        pass
    return 3


def _parse_event(content: Optional[str]) -> Optional[str]:
    if not content:
        return None
    m = EVENT_RE.search(content)
    if not m:
        return None
    return m.group(1).strip() or None


def _extract_one_line(content: Optional[str]) -> Optional[str]:
    """尝试从正文末尾提取一句话心情；现阶段保守返回 None（迁移不伪造数据）。"""
    return None


async def _migrate_one_user(db, user_id: int, dry_run: bool) -> dict:
    q = await db.execute(
        select(Diary)
        .where(Diary.user_id == user_id)
        .order_by(Diary.diary_date.asc(), Diary.id.asc())
    )
    diaries = list(q.scalars().all())

    targets = []
    for d in diaries:
        title = (d.title or "").strip()
        tags = d.emotion_tags or []
        is_rest = title == REST_TITLE or "rest" in [(t or "").strip().lower() for t in tags]
        is_heart_light = title.startswith(TITLE_PREFIX)
        if not (is_rest or is_heart_light):
            continue
        targets.append((d, is_rest))

    inserted = 0
    skipped_existing = 0
    deleted = 0

    existing_q = await db.execute(
        select(HeartLightCheckin.checkin_date).where(HeartLightCheckin.user_id == user_id)
    )
    existing_dates = {row[0] for row in existing_q.all()}

    ids_to_delete: list[int] = []
    planned_dates: set = set()

    for d, is_rest in targets:
        if d.diary_date is None:
            continue
        if d.diary_date in existing_dates or d.diary_date in planned_dates:
            skipped_existing += 1
            ids_to_delete.append(d.id)
            continue

        if is_rest:
            emotion = "rest"
            energy = 3
            event = "rest"
            one_line_text = None
        else:
            emotion = _parse_emotion(d.title, d.emotion_tags) or "neutral"
            energy = _parse_energy(d.content)
            event = _parse_event(d.content)
            one_line_text = _extract_one_line(d.content)

        if not dry_run:
            db.add(
                HeartLightCheckin(
                    user_id=user_id,
                    checkin_date=d.diary_date,
                    emotion=emotion,
                    energy=energy,
                    event=event,
                    one_line_text=one_line_text,
                    is_rest=is_rest,
                    awarded_points=0,
                )
            )

        inserted += 1
        planned_dates.add(d.diary_date)
        ids_to_delete.append(d.id)

    if ids_to_delete and not dry_run:
        await db.execute(delete(Diary).where(Diary.id.in_(ids_to_delete)))
        deleted = len(ids_to_delete)
        await db.commit()
    elif dry_run:
        deleted = len(ids_to_delete)

    return {
        "user_id": user_id,
        "inserted": inserted,
        "skipped_existing": skipped_existing,
        "deleted": deleted,
    }


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="只扫描不写入")
    args = parser.parse_args()

    await init_db()

    async with async_session_maker() as db:
        await set_rls_service_context(db)
        q = await db.execute(
            select(Diary.user_id).distinct()
        )
        user_ids = [row[0] for row in q.all() if row[0] is not None]

    print(f"[migrate] users with diaries: {len(user_ids)} | dry_run={args.dry_run}")

    totals = defaultdict(int)
    for uid in user_ids:
        async with async_session_maker() as db:
            await set_rls_service_context(db)
            stats = await _migrate_one_user(db, uid, args.dry_run)
        totals["inserted"] += stats["inserted"]
        totals["skipped_existing"] += stats["skipped_existing"]
        totals["deleted"] += stats["deleted"]
        print(
            f"  user={stats['user_id']} inserted={stats['inserted']} "
            f"skipped={stats['skipped_existing']} deleted={stats['deleted']}"
        )

    print(
        f"[migrate] done. inserted={totals['inserted']} "
        f"skipped={totals['skipped_existing']} deleted={totals['deleted']}"
    )


if __name__ == "__main__":
    asyncio.run(main())
