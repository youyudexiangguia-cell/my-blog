---
title: "多平台 Git SSH 密钥配置与权限隔离方案"
date: "2026-10-21"
summary: "在单台开发机上通过 ~/.ssh/config 优雅管理 GitHub 与 Gitee 多个不同代码托管平台的 SSH 认证。"
---

## 配置 ~/.ssh/config

通过别名机制可以清晰隔离不同托管平台的私钥文件：

```text
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
    IdentitiesOnly yes

Host gitee.com
    HostName gitee.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gitee
    IdentitiesOnly yes
```

`IdentitiesOnly yes` 很重要：它让 SSH 只使用配置里指定的私钥，避免 agent 里的其他密钥被依次尝试，减少认证失败和触发风控的概率。

## 生成密钥

为每个平台生成独立的 ed25519 密钥：

```bash
ssh-keygen -t ed25519 -C "github@example.com" -f ~/.ssh/id_ed25519_github
ssh-keygen -t ed25519 -C "gitee@example.com" -f ~/.ssh/id_ed25519_gitee
```

建议设置一个有意义的注释，方便以后在平台上识别。私钥不要发给任何人，也不要提交到仓库。

设置权限：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519_github ~/.ssh/id_ed25519_gitee
chmod 644 ~/.ssh/id_ed25519_github.pub ~/.ssh/id_ed25519_gitee.pub
```

## 添加公钥

查看公钥内容：

```bash
cat ~/.ssh/id_ed25519_github.pub
```

把输出分别添加到 GitHub 的 **Settings → SSH and GPG keys** 和 Gitee 的 **设置 → SSH 公钥**。只需要上传 `.pub` 结尾的公钥。

## 测试连接

```bash
ssh -T git@github.com
ssh -T git@gitee.com
```

GitHub 返回类似：

```text
Hi your-name! You've successfully authenticated, but GitHub does not provide shell access.
```

Gitee 返回欢迎信息即表示成功。第一次连接会提示确认主机指纹，核对后输入 `yes`。

## 多账号场景

如果同一平台有工作账号和个人账号，可以用不同的 Host 别名：

```text
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github_work
    IdentitiesOnly yes

Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github_personal
    IdentitiesOnly yes
```

克隆时把 `github.com` 换成别名：

```bash
git clone git@github-work:company/project.git
```

已有仓库可以修改 remote：

```bash
git remote set-url origin git@github-personal:your-name/blog.git
```

## 为单个仓库设置提交身份

SSH 密钥只负责认证，提交记录里的作者信息由 Git 配置决定。可以在仓库内单独设置：

```bash
git config user.name "your-name"
git config user.email "you@example.com"
```

不要不加 `--global` 就随手设置全局身份，否则工作仓库和个人仓库的提交记录容易混在一起。

## 排查思路

- `ssh -vT git@github.com` 查看详细握手过程。
- `ssh-add -l` 查看 agent 里已加载的密钥。
- 权限过宽时 SSH 会拒绝使用私钥，检查 `~/.ssh` 和私钥是否为 `700` / `600`。
- 确认 remote 地址是 SSH 形式，而不是 HTTPS 形式。
- 公司网络限制 22 端口时，可以为 GitHub 配置 `ssh.github.com:443` 的备用入口。

## 小结

核心原则是：**一个平台一把密钥，一个 Host 一段配置，仓库内单独设置提交身份**。这样既方便排查，也避免不同账号之间互相干扰。
