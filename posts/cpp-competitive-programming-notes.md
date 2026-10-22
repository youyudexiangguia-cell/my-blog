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
```

第一行关闭 C/C++ 缓冲区同步，第二行解除 `cin` 与 `cout` 的绑定。关闭同步后不要再混用 `scanf` / `printf`，否则输入顺序可能错乱。

一个常用的竞赛模板：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;

    long long sum = 0;
    for (int i = 0; i < n; ++i) {
        int x;
        std::cin >> x;
        sum += x;
    }

    std::cout << sum << '\n';
    return 0;
}
```

输出时优先使用 `'\n'` 而不是 `std::endl`。`endl` 每次都会刷新缓冲区，在大量输出时会明显变慢。

## 常用 STL 容器的复杂度

| 容器 | 常见操作复杂度 | 适用场景 |
|---|---|---|
| `vector` | 随机访问 O(1)，尾部插入均摊 O(1)，中间插入 O(n) | 最常用的动态数组 |
| `deque` | 两端插入/删除 O(1)，随机访问 O(1) | 需要双端队列 |
| `list` | 已知位置插入/删除 O(1)，随机访问 O(n) | 频繁在中间增删 |
| `set` / `map` | 查找、插入、删除 O(log n) | 需要有序且去重 |
| `unordered_set` / `unordered_map` | 平均 O(1)，最坏 O(n) | 只做哈希查找 |
| `priority_queue` | `push` / `pop` O(log n)，`top` O(1) | 堆、Dijkstra |
| `stack` / `queue` | `push` / `pop` O(1) | 栈、BFS |

`unordered_map` 在竞赛中可能被特殊数据卡到 O(n)，如果对最坏复杂度敏感，优先用 `map`，或者给哈希加随机盐。

## 避免 TLE 的实用细节

- 用 `'\n'` 代替 `std::endl`。
- 已知规模时先 `reserve`，减少 `vector` 反复扩容：

```cpp
std::vector<int> a;
a.reserve(n);
```

- 大对象传参用 `const T&`，避免拷贝。
- 多次查询用前缀和、二分或离散化，不要在内层循环里重复扫描。
- 二分查找直接用 `std::lower_bound` / `std::upper_bound`，不要手写错误边界。
- 输出量很大时可以先拼接到 `std::string`，再一次性输出：

```cpp
std::string output;
output.reserve(n * 12);

for (int x : ans) {
    output += std::to_string(x);
    output.push_back('\n');
}

std::cout << output;
```

- 递归深度可能很大时，改写成迭代或手动扩大栈空间，避免栈溢出。
- 如果关闭了 `sync_with_stdio`，就不要再用 C 风格输入输出。

## 小结

竞赛代码的优化顺序通常是：先保证复杂度正确，再减少常数。快速 I/O、`reserve`、避免 `endl` 和减少不必要的容器操作，往往比微小的语法技巧更有效。
