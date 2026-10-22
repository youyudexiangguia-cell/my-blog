---
title: "Linux 2C2G 服务器配置 Swap 虚拟内存指南"
date: "2026-10-15"
summary: "解决入门级云服务器在运行构建任务或编译时因内存不足被 OOM-killer 强制中断的问题。"
---

## 为什么要配置 Swap

在只有 2GB 物理内存的实例上运行 Node.js 打包或后台服务时，瞬时内存飙升极易导致系统崩溃。通过配置 2GB~4GB 的 Swap 分区作为缓冲池，可以有效防止进程被内核直接杀死。

Swap 只是兜底，不是物理内存的替代品。它位于磁盘上，读写速度远低于内存；如果系统长期频繁换页，性能会明显下降。对 2C2G 的入门服务器来说，Swap 的主要价值是扛过 `npm install`、`next build` 这类短时峰值。

## 常用配置步骤

1. 创建 2G 交换文件：

```bash
sudo fallocate -l 2G /swapfile
```

如果文件系统不支持 `fallocate`（例如部分 btrfs 配置），改用：

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
```

2. 设置权限并格式化：

```bash
sudo chmod 600 /swapfile
sudo mkswap /swapfile
```

3. 启用 Swap：

```bash
sudo swapon /swapfile
```

4. 写入 `/etc/fstab`，让重启后自动挂载：

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

执行前先检查 `/etc/fstab` 是否已经有 `/swapfile` 这一行，避免重复添加。

5. 验证：

```bash
swapon --show
free -h
```

`swapon --show` 能看到 `/swapfile`，`free -h` 的 `Swap` 一行不再是 0，就说明生效了。

## 可选：调整 swappiness

`vm.swappiness` 控制内核使用 Swap 的倾向，取值范围是 0~100。服务器上可以适当调低，优先使用物理内存：

```bash
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swap.conf
sudo sysctl --system
```

不要把它设成 0，否则在内存紧张时内核可能更倾向于直接触发 OOM，而不是使用 Swap。

## 常见问题

- `swapon` 报权限错误：确认 `/swapfile` 的权限是 `600`。
- 重启后 Swap 消失：说明只执行了 `swapon`，没有写入 `/etc/fstab`。
- `fallocate` 失败：换用 `dd` 创建。
- 磁盘空间不足：Swap 文件会占用同样大小的磁盘空间，创建前先用 `df -h` 检查。
- 云服务器系统盘较小：可以把 Swap 放在数据盘，但要注意数据盘 IO 性能。

## 小结

配置 Swap 的关键不是“创建文件”这一步，而是**启用后写入 `/etc/fstab` 并验证**。只执行 `swapon` 的话，重启后一切都会回到原点。
