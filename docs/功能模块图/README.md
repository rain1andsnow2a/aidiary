# 映记功能模块图（按角色拆分）

本目录用于答辩、论文和产品说明文档，按系统角色拆分功能模块，避免把 TOC 与 TOB 能力混在一张图里。

## 文件说明

| 角色 | 可编辑源文件 | SVG 预览 | 说明 |
| --- | --- | --- | --- |
| 学生用户 | `student_module.drawio` | `student_module.svg` | 面向普通用户/学生的日记创作、AI 洞察、成长中心、社区与 OpenClaw 接入。 |
| 辅导员 | `counselor_module.drawio` | `counselor_module.svg` | 面向辅导员的认证申请、负责范围绑定、脱敏看板与周度关怀流程。 |
| 心理老师 | `psychologist_module.drawio` | `psychologist_module.svg` | 面向心理老师的重点风险识别、趋势观察、专业支持与隐私边界。 |
| 管理员 | `admin_module.drawio` | `admin_module.svg` | 面向管理员的系统概览、用户角色治理、认证审核、社区治理与运营安全。 |

## 编辑方式

- `.drawio` 文件可直接用 draw.io / diagrams.net 打开继续编辑。
- `.spec.yaml` 是生成图的结构化源文件，适合后续批量修改。
- `.arch.json` 是 drawio 工具生成的结构侧写，主要用于追踪节点和连接关系。

## 设计原则

- 一个角色一张图，答辩讲解时可以按用户故事展开。
- 每张图都按“角色入口 -> 核心能力 -> 数据/AI能力 -> 安全边界或输出”组织。
- 学生用户图偏 TOC，辅导员/心理老师/管理员图偏 TOB 2.0。
