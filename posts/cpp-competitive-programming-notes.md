---
title: "C++ 算法竞赛常用技巧与性能优化"
date: "2026-10-17"
summary: "整理快速 I/O 模板、常用 STL 容器常数分析以及在算法竞赛中避免 TLE 的实用细节。"
---

## 快速 I/O 解绑

标准 C++ 的输入输出流默认与 C 语言 stdio 缓冲区同步：

```cpp
std::ios::sync_with_stdio(false);
std::cin.tie(nullptr);