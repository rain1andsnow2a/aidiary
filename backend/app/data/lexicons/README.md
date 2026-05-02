# 外部情绪词典目录说明

该目录用于放置映记情绪分析使用的外部词典资源。

核心 VAD 词典已经从 Python 代码迁移到独立 JSON 文件，算法代码只负责加载、校验和融合。

## 默认文件名

1. `vad_zh_core.json`：核心中文 VAD 词典，词条包含 `valence`、`arousal`、`dominance`
2. `ntusd_positive_simplified.txt`：可选 NTUSD 正向词表
3. `ntusd_negative_simplified.txt`：可选 NTUSD 负向词表

## 核心 VAD JSON 格式

```json
{
  "version": "2026.04.29",
  "language": "zh-CN",
  "schema_version": 1,
  "entries": {
    "开心": {
      "valence": 0.9,
      "arousal": 0.7,
      "dominance": 0.7,
      "source": "builtin_core"
    }
  }
}
```

字段范围：

1. `valence`: `-1.0 ~ 1.0`，负面到正面
2. `arousal`: `0.0 ~ 1.0`，低能量到高能量
3. `dominance`: `0.0 ~ 1.0`，低控制感到高控制感

## 支持格式

每行一个词，或 `词<TAB>分数` / `词 空格 分数`，程序会取第一列作为词条。

示例：

```txt
开心
愉快
焦虑
难过
兴奋    0.9
烦躁 0.8
```

## 启用方式

`emotion_feature_service.py` 默认启用外部词典融合。

可通过环境变量控制：

1. `EMOTION_EXT_LEXICON_ENABLED=true|false`
2. `EMOTION_EXT_LEXICON_WEIGHT=0.65`
3. `EMOTION_CORE_LEXICON_PATH=/abs/path/vad_zh_core.json`
4. `EMOTION_EXT_LEXICON_POS_PATH=/abs/path/ntusd_positive_simplified.txt`
5. `EMOTION_EXT_LEXICON_NEG_PATH=/abs/path/ntusd_negative_simplified.txt`
6. `EMOTION_LEXICON_SOURCES=builtin,ntusd,pysenti`

若默认路径找不到词典文件，会自动跳过，不影响服务启动。

## 推荐做法（本地持久化）

建议把词典文件下载到本地并随部署目录持久化，不依赖运行时联网：

```bash
cd backend/scripts
python fetch_ntusd_lexicons.py
```

## 可选：pysenti 词典融合

安装 `pysenti` 后，服务会自动尝试扫描其包内词典文件并融合：

```bash
pip install pysenti
```

若不希望启用 pysenti，可设置：

```env
EMOTION_LEXICON_SOURCES=builtin,ntusd
```
