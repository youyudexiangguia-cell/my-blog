---
title: "OAuth 2.0 与 OpenID Connect 认证机制快速梳理"
date: "2026-10-23"
summary: "解析授权码模式（Authorization Code Flow）、Access Token 与 ID Token 的核心职责区别。"
---

## 授权 vs 身份认证

- **OAuth 2.0**：核心解决**授权（Authorization）**问题，即“第三方应用能对我的资源做什么”。
- **OIDC**：在 OAuth 2.0 基础上扩展的**身份认证（Authentication）**协议，用于回答“当前用户是谁”。

OAuth 2.0 只负责颁发 Access Token，并不规定“用户身份”如何表达；OIDC 在 OAuth 2.0 之上增加了 ID Token，用标准化的方式返回用户身份信息。

## 授权码模式

最常见的 Web 应用流程是 Authorization Code Flow：

1. 客户端把用户重定向到授权服务器；
2. 用户在授权服务器登录并同意授权；
3. 授权服务器把用户带回客户端，并在 URL 中附带一次性 `code`；
4. 客户端在后端用 `code` 换取 Access Token（以及 OIDC 的 ID Token）；
5. 客户端用 Access Token 调用资源服务器。

授权码只在前端 URL 中出现一次，真正的令牌交换在服务端完成，避免把 Access Token 暴露在浏览器地址栏。

## ID Token 与 Access Token

- **Access Token**：给资源服务器看的，用来判断“这个请求能访问什么”。它可以是 JWT，也可以是随机字符串，客户端不应解析其内容。
- **ID Token**：给客户端看的，是一个 JWT，包含 `sub`、`iss`、`aud`、`exp` 等身份声明，用来确认“当前用户是谁”。

ID Token 不是用来调用 API 的；Access Token 也不应该被当作身份凭证直接信任。

## Nonce 参数防护

在 OIDC 流程中，客户端向授权服务器发起请求时携带 `nonce`，授权服务器签发的 ID Token 中会原样带回这个值。客户端校验返回值是否与本次请求发起时保存的 `nonce` 一致，用于防止 ID Token 重放，并把令牌绑定到当前登录请求。

`nonce` 通常是随机生成的不透明字符串，不一定是哈希值。它和 OAuth 的 `state` 作用不同：

- **state**：防止 CSRF，把授权请求和回调绑定起来；
- **nonce**：防止 ID Token 重放，把身份令牌和本次认证请求绑定起来。

## PKCE 补充

对于公共客户端（如 SPA、移动端），还应使用 PKCE（Proof Key for Code Exchange）：客户端生成 `code_verifier`，把它的哈希作为 `code_challenge` 发给授权服务器，换取令牌时再提交原始值。这样即使授权码被截获，攻击者没有 `code_verifier` 也无法完成兑换。

## 小结

OAuth 2.0 解决“能做什么”，OIDC 解决“你是谁”。实际接入时，重点检查 `state`、`nonce`、`redirect_uri` 白名单和 PKCE 是否配置正确，而不是只关注令牌长什么样。
