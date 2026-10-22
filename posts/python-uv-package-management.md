---
title: "Python 包管理新选择：从 Conda 到 uv 的实践体验"
date: "2026-10-19"
summary: "基于 Rust 构建的 uv 工具在虚拟环境管理与依赖解析速度上的表现体验。"
---

## 性能表现

在传统 Python 项目中，`pip` 和 `conda` 的依赖解析常因庞大的元数据遍历而耗时较长。

### 常用工作流

```bash
# 创建虚拟环境
uv venv

# 快速安装依赖
uv pip install -r requirements.txt