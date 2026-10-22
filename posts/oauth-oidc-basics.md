---
title: "OAuth 2.0 与 OpenID Connect 认证机制快速梳理"
date: "2026-10-23"
summary: "解析授权码模式（Authorization Code Flow）、Access Token 与 ID Token 的核心职责区别。"
---

## 授权 vs 身份认证

- **OAuth 2.0**：核心解决**授权（Authorization）**问题，即“第三方应用能对我的资源做什么”。
- **OIDC**：在 OAuth 2.0 基础上扩展的**身份认证（Authentication）**协议，用于回答“当前用户是谁”。

### Nonce 参数防护

在 OIDC 流程中，客户端向授权服务器发起请求时携带 `nonce`，授权服务器签发的 ID Token 中会原样携带该哈希值，用于抵御重放攻击。