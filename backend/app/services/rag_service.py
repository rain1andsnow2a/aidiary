"""
轻量RAG检索服务（无额外依赖）
对用户历史日记做切片与BM25风格检索，供综合分析使用。
"""
from __future__ import annotations

import math
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from typing import Dict, List, Sequence


@dataclass
class DiaryChunk:
    diary_id: int
    diary_date: str
    title: str
    text: str
    token_freq: Counter
    length: int


def _tokenize(text: str) -> List[str]:
    text = (text or "").lower()
    en_tokens = re.findall(r"[a-z0-9_]{2,}", text)
    zh_chars = re.findall(r"[\u4e00-\u9fff]", text)
    return en_tokens + zh_chars


def _split_into_chunks(content: str, max_len: int = 260, overlap: int = 40) -> List[str]:
    content = (content or "").strip()
    if not content:
        return []

    segments = re.split(r"[\n。！？!?；;]+", content)
    segments = [s.strip() for s in segments if s.strip()]
    chunks: List[str] = []

    current = ""
    for seg in segments:
        if len(current) + len(seg) + 1 <= max_len:
            current = f"{current} {seg}".strip()
            continue
        if current:
            chunks.append(current)
            current = current[-overlap:] + " " + seg if overlap > 0 else seg
            current = current.strip()
        else:
            chunks.append(seg[:max_len])
            current = seg[max_len - overlap:] if len(seg) > max_len else ""

    if current:
        chunks.append(current.strip())
    return chunks


class DiaryRAGService:
    def build_chunks(self, diaries: Sequence[Dict]) -> List[DiaryChunk]:
        chunks: List[DiaryChunk] = []
        for d in diaries:
            diary_id = int(d["id"])
            diary_date = str(d["diary_date"])
            title = d.get("title") or "无标题"
            content = d.get("content") or ""
            for chunk_text in _split_into_chunks(content):
                tokens = _tokenize(f"{title} {chunk_text}")
                if not tokens:
                    continue
                chunks.append(
                    DiaryChunk(
                        diary_id=diary_id,
                        diary_date=diary_date,
                        title=title,
                        text=chunk_text,
                        token_freq=Counter(tokens),
                        length=len(tokens),
                    )
                )
        return chunks

    def retrieve(self, chunks: Sequence[DiaryChunk], query: str, top_k: int = 8) -> List[Dict]:
        if not chunks:
            return []

        query_tokens = _tokenize(query)
        if not query_tokens:
            return []

        N = len(chunks)
        avgdl = sum(c.length for c in chunks) / max(N, 1)
        df = defaultdict(int)
        for c in chunks:
            for t in set(c.token_freq.keys()):
                df[t] += 1

        k1 = 1.5
        b = 0.75
        scored = []
        for c in chunks:
            score = 0.0
            for t in query_tokens:
                if t not in c.token_freq:
                    continue
                idf = math.log(1 + (N - df[t] + 0.5) / (df[t] + 0.5))
                tf = c.token_freq[t]
                denom = tf + k1 * (1 - b + b * (c.length / max(avgdl, 1e-6)))
                score += idf * (tf * (k1 + 1) / max(denom, 1e-6))
            if score > 0:
                scored.append((score, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        result: List[Dict] = []
        for score, c in scored[:top_k]:
            result.append(
                {
                    "diary_id": c.diary_id,
                    "diary_date": c.diary_date,
                    "title": c.title,
                    "snippet": c.text[:240],
                    "score": round(float(score), 4),
                }
            )
        return result


diary_rag_service = DiaryRAGService()
