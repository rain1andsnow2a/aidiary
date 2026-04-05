# 外部情绪词典目录说明

该目录用于放置可选的外部情绪词典（如 NTUSD 简体词典）。

## 默认文件名

1. `ntusd_positive_simplified.txt`
2. `ntusd_negative_simplified.txt`

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
3. `EMOTION_EXT_LEXICON_POS_PATH=/abs/path/ntusd_positive_simplified.txt`
4. `EMOTION_EXT_LEXICON_NEG_PATH=/abs/path/ntusd_negative_simplified.txt`
5. `EMOTION_LEXICON_SOURCES=builtin,ntusd,pysenti`

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
