"""
下载 NTUSD 简体词典到本地目录，供 emotion_feature_service 融合使用。

Usage:
    python fetch_ntusd_lexicons.py
"""
from __future__ import annotations

from pathlib import Path
import urllib.request


POS_URL = (
    "https://raw.githubusercontent.com/ppzhenghua/SentimentAnalysisDictionary/main/"
    "%E5%8F%B0%E6%B9%BE%E5%A4%A7%E5%AD%A6NTUSD%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%E6%83%85%E6%84%9F%E8%AF%8D%E5%85%B8/"
    "NTUSD_positive_simplified.txt"
)
NEG_URL = (
    "https://raw.githubusercontent.com/ppzhenghua/SentimentAnalysisDictionary/main/"
    "%E5%8F%B0%E6%B9%BE%E5%A4%A7%E5%AD%A6NTUSD%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%E6%83%85%E6%84%9F%E8%AF%8D%E5%85%B8/"
    "NTUSD_negative_simplified.txt"
)


def main() -> None:
    root = Path(__file__).resolve().parents[1] / "app" / "data" / "lexicons"
    root.mkdir(parents=True, exist_ok=True)

    pos_file = root / "ntusd_positive_simplified.txt"
    neg_file = root / "ntusd_negative_simplified.txt"

    urllib.request.urlretrieve(POS_URL, pos_file)
    urllib.request.urlretrieve(NEG_URL, neg_file)

    print(f"Downloaded: {pos_file}")
    print(f"Downloaded: {neg_file}")


if __name__ == "__main__":
    main()

