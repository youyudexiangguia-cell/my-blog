---
title: "Linux 2C2G 服务器配置 Swap 虚拟内存指南"
date: "2026-10-15"
summary: "解决入门级云服务器在运行构建任务或编译时因内存不足被 OOM-killer 强制中断的问题。"
---

## 为什么要配置 Swap

在只有 2GB 物理内存的实例上运行 Node.js 打包或后台服务时，瞬时内存飙升极易导致系统崩溃。通过配置 2GB~4GB 的 Swap 分区作为缓冲池，可以有效防止进程被内核直接杀死。

### 常用配置步骤

1. 创建交换文件：
   `sudo fallocate -l 2G /swapfile`
2. 设置权限并格式化：
   `sudo chmod 600 /swapfile && sudo mkswap /swapfile`
3. 挂载并写入自启配置：
   `sudo swapon /swapfile`