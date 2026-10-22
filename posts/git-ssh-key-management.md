---
title: "多平台 Git SSH 密钥配置与权限隔离方案"
date: "2026-10-21"
summary: "在单台开发机上通过 ~/.ssh/config 优雅管理 GitHub 与 Gitee 多个不同代码托管平台的 SSH 认证。"
---

## 配置 ~/.ssh/config

通过别名机制可清晰隔离不同托管平台的私钥文件：

```text
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github

Host gitee.com
    HostName gitee.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gitee