---
title: "Python 包管理新选择：从 Conda 到 uv 的实践体验"
date: "2026-10-19"
summary: "基于 Rust 构建的 uv 工具在虚拟环境管理与依赖解析速度上的表现体验。"
---

## 性能表现

在传统 Python 项目中，`pip` 和 `conda` 的依赖解析常因庞大的元数据遍历而耗时较长。`uv` 使用 Rust 实现解析器和安装器，并利用全局缓存与硬链接，首次安装和重复创建环境的速度通常明显更快。

它并不是“另一个 Conda”，而是一个更快的 pip / virtualenv 替代品。纯 Python 包用 uv 很合适；依赖 CUDA、系统库或非 Python 二进制的环境，Conda 仍然更稳。

## 安装

Linux / macOS：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Windows 可以用 PowerShell 安装脚本，或者通过包管理器安装。安装完成后确认：

```bash
uv --version
```

## 项目初始化

```bash
uv init my-project
cd my-project
```

`uv init` 会生成 `pyproject.toml` 和基础目录结构。添加依赖：

```bash
uv add requests
uv add --dev pytest ruff
```

运行代码：

```bash
uv run python main.py
```

`uv run` 会自动使用项目环境，不需要先手动激活 `.venv`。

## 兼容 pip 的工作流

如果手里已经有 `requirements.txt`，可以继续用熟悉的命令：

```bash
uv venv
uv pip install -r requirements.txt
```

创建虚拟环境后，激活方式仍然是：

```bash
source .venv/bin/activate
```

## 锁定与同步

`uv` 会把解析结果写入 `uv.lock`。这个文件应该提交到 Git，保证团队成员和 CI 使用完全一致的依赖版本：

```bash
uv lock
uv sync --frozen
```

- `uv lock`：重新解析并更新锁文件。
- `uv sync`：按锁文件同步环境。
- `uv sync --frozen`：严格使用现有锁文件，不重新解析，适合 CI。

## 固定 Python 版本

```bash
uv python install 3.12
uv python pin 3.12
```

这会在项目里写入 `.python-version`，后续 `uv sync` 会使用对应解释器。服务器和本地保持一致，能减少“我这里能跑”的问题。

## 常用工具

```bash
uv run pytest
uv run ruff check .
uvx ruff format .
```

`uvx` 可以在临时环境里运行命令行工具，不需要把它安装到项目依赖中。

## 和 Conda 怎么选

- **uv**：纯 Python 包、Web 后端、脚本工具、CI 环境，追求速度和可复现性。
- **Conda**：科学计算、CUDA、需要安装非 Python 二进制依赖的场景。
- 两者可以在同一台机器共存，但不要同时管理同一个环境。

## CI 示例

GitHub Actions 中可以使用官方 action：

```yaml
- uses: astral-sh/setup-uv@v5
- run: uv sync --frozen
- run: uv run pytest
```

## 小结

`uv` 最大的价值是把“创建环境、解析依赖、安装、锁定、运行”收敛成一套很快的流程。对于新项目，我会优先用 `pyproject.toml + uv.lock`；对于依赖复杂系统库的老项目，继续用 Conda 更省心。
