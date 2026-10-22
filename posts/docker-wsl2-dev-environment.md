---
title: "WSL 2 环境下 Docker 与 VS Code 的开发配合"
date: "2026-10-22"
summary: "利用 WSL 2 Linux 子系统搭建轻量隔离的容器化运行时，提升本地工程化体验。"
---

## 架构优势

在 Windows 环境下启用 WSL 2 后，Docker 引擎可直接运行在精简的 Linux 内核上，相较于传统 Hyper-V 虚拟机开销更小。

### 实践要点

- 代码仓库置于 WSL 根目录（`/home/...`），避免跨盘访问 Windows 文件系统导致的 I/O 衰减。
- 利用端口映射可直接在宿主机浏览器调试容器内部暴露的服务。