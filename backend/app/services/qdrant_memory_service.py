"""
Qdrant 记忆检索服务（用户历史日记）
"""
from __future__ import annotations

import hashlib
import math
import re
from typing import Dict, List, Sequence

import httpx
from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.diary import Diary


def _tokenize(text: str) -> List[str]:
    text = (text or "").lower()
    en_tokens = re.findall(r"[a-z0-9_]{2,}", text)
    zh_chars = re.findall(r"[\u4e00-\u9fff]", text)
    return en_tokens + zh_chars


def _hash_embedding(text: str, dim: int) -> List[float]:
    vec = [0.0 for _ in range(dim)]
    tokens = _tokenize(text)
    if not tokens:
        return vec
    for tok in tokens:
        h = int(hashlib.md5(tok.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0
    norm = math.sqrt(sum(v * v for v in vec))
    if norm <= 1e-8:
        return vec
    return [v / norm for v in vec]


def _point_id(user_id: int, diary_id: int) -> int:
    return int(user_id) * 1_000_000_000 + int(diary_id)


class QdrantDiaryMemoryService:
    def __init__(self) -> None:
        self.url = (settings.qdrant_url or "").rstrip("/")
        self.api_key = settings.qdrant_api_key or ""
        self.collection = settings.qdrant_collection
        self.dim = int(settings.qdrant_vector_dim or 256)

    @property
    def enabled(self) -> bool:
        return bool(self.url and self.api_key)

    def _headers(self) -> Dict[str, str]:
        return {
            "api-key": self.api_key,
            "Content-Type": "application/json",
        }

    async def _ensure_collection(self) -> None:
        if not self.enabled:
            return
        async with httpx.AsyncClient(timeout=30.0) as client:
            check = await client.get(
                f"{self.url}/collections/{self.collection}",
                headers=self._headers(),
            )
            if check.status_code == 200:
                return
            payload = {
                "vectors": {
                    "size": self.dim,
                    "distance": "Cosine",
                }
            }
            resp = await client.put(
                f"{self.url}/collections/{self.collection}",
                headers=self._headers(),
                json=payload,
            )
            resp.raise_for_status()

    async def _fetch_user_diaries(self, db: AsyncSession, user_id: int, limit: int = 240) -> Sequence[Diary]:
        result = await db.execute(
            select(Diary)
            .where(Diary.user_id == user_id)
            .order_by(desc(Diary.diary_date), desc(Diary.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def sync_user_diaries(self, db: AsyncSession, user_id: int) -> int:
        if not self.enabled:
            return 0
        await self._ensure_collection()
        diaries = await self._fetch_user_diaries(db, user_id=user_id)
        if not diaries:
            return 0

        points = []
        for d in diaries:
            text = f"{d.title or '无标题'}\n{d.content or ''}"
            vector = _hash_embedding(text, self.dim)
            snippet = re.sub(r"\s+", " ", d.content or "").strip()[:300]
            points.append(
                {
                    "id": _point_id(user_id, d.id),
                    "vector": vector,
                    "payload": {
                        "user_id": user_id,
                        "diary_id": d.id,
                        "diary_date": str(d.diary_date),
                        "title": d.title or "无标题",
                        "snippet": snippet,
                        "emotion_tags": d.emotion_tags or [],
                        "importance_score": int(d.importance_score or 5),
                    },
                }
            )

        async with httpx.AsyncClient(timeout=60.0) as client:
            upsert = await client.put(
                f"{self.url}/collections/{self.collection}/points",
                headers=self._headers(),
                json={"points": points},
            )
            upsert.raise_for_status()

        return len(points)

    async def search(self, query: str, user_id: int, top_k: int = 4) -> List[Dict]:
        if not self.enabled:
            return []
        if not (query or "").strip():
            return []
        qvec = _hash_embedding(query, self.dim)
        payload = {
            "vector": qvec,
            "limit": max(1, min(top_k, 8)),
            "with_payload": True,
            "filter": {
                "must": [
                    {"key": "user_id", "match": {"value": user_id}},
                ]
            },
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.url}/collections/{self.collection}/points/search",
                headers=self._headers(),
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        raw = data.get("result") or []
        hits: List[Dict] = []
        for item in raw:
            pl = item.get("payload") or {}
            hits.append(
                {
                    "score": round(float(item.get("score") or 0.0), 4),
                    "diary_id": pl.get("diary_id"),
                    "diary_date": pl.get("diary_date"),
                    "title": pl.get("title"),
                    "snippet": pl.get("snippet"),
                    "emotion_tags": pl.get("emotion_tags") or [],
                    "importance_score": pl.get("importance_score"),
                }
            )
        return hits

    async def retrieve_context(self, db: AsyncSession, user_id: int, query: str, top_k: int = 4) -> List[Dict]:
        """
        先同步用户日记到 Qdrant，再执行检索，确保数据实时可用。
        """
        if not self.enabled:
            return []
        try:
            await self.sync_user_diaries(db, user_id=user_id)
            return await self.search(query=query, user_id=user_id, top_k=top_k)
        except Exception:
            return []


qdrant_diary_memory_service = QdrantDiaryMemoryService()

