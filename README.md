# 个人博客

一个基于 Next.js 16 App Router 和本地 Markdown 的纯静态博客。`next build` 生成 `out/`，不需要 Node 运行时，直接交给 Nginx 或任意静态文件服务器托管。

> 当前还没有域名，也没有开放公网端口。本地开发使用 `http://localhost:3000`，构建产物里的站点 URL 默认也会回退到 `http://localhost:3000`。

## 环境要求

- Node.js >= 20.9（推荐 22 LTS，仓库里有 `.nvmrc`）
- npm

```bash
nvm use
npm ci
```

## 本地开发

```bash
npm run dev
```

打开 <http://localhost:3000>。

常用检查：

```bash
npm run lint
npm run typecheck
```

## 环境变量

站点 URL 用于 `metadataBase`、`sitemap.xml`、`robots.txt` 和 RSS。它是**构建时**变量：

```bash
NEXT_PUBLIC_SITE_URL=https://blog.example.com npm run build
```

不设置时会回退到 `http://localhost:3000`。等有了域名再设置即可，现在本地不需要创建 `.env`。

## 写文章

在 `posts/` 下新建 Markdown 文件，文件名使用小写字母、数字、连字符或下划线，例如 `my-first-post.md`。

```md
---
title: "文章标题"
date: "2026-10-23"
summary: "一句话摘要，用于首页、SEO 和 RSS。"
---

## 小标题

正文……
```

约定：

- `date` 请加引号。不加引号时 YAML 可能把它解析成 `Date` 对象。
- 代码围栏要闭合，避免后续内容被吞进代码块。
- 文件名会直接作为 `/posts/<slug>` 的 slug。
- 修改或新增文章后需要重新构建；静态导出没有运行时读取 Markdown 的能力。

## 构建与本地预览

```bash
npm run build
```

产物在 `out/`：

```bash
out/
├── index.html
├── 404.html
├── posts/
│   ├── first-post.html
│   └── ...
├── sitemap.xml
├── robots.txt
└── rss.xml
```

本地预览：

```bash
npm run start
```

它等价于 `npx serve@latest out`，默认打开 `http://localhost:3000`。不启动也不影响代码本身。

静态导出的限制：

- 不支持 `cookies()`、`headers()`、Server Actions、ISR、运行时 API；
- 动态路由必须通过 `generateStaticParams` 在构建期列出来；
- 新增文章后要重新 `build` 并重新上传 `out/`。

## 部署到 Nginx

把 `out/` 上传到服务器，例如 `/var/www/blog`：

```nginx
server {
    listen 80;
    server_name blog.example.com;

    root /var/www/blog;
    index index.html;

    location / {
        # 先匹配 .html，避免命中 Next 导出的 RSC 目录
        try_files $uri.html $uri $uri/ =404;
    }

    location /_next/static/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
```

有域名和 HTTPS 后再补：

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security`（只在 HTTPS 下加）
- 安全组只开放 22、80、443

## 2C2G 服务器注意事项

- 静态导出后不需要 Node 进程，2C2G 只跑 Nginx 非常轻。
- `npm ci` 和 `next build` 的瞬时内存比运行时高，建议准备 2G Swap 兜底，或在本地构建后上传 `out/`。
- 不要在服务器上跑 `npm run dev`。
- 现在没有开放端口，也不需要启动任何服务；等部署时再配置 Nginx 和防火墙。

## 目录结构

```text
app/                页面、布局、metadata 路由
  posts/[slug]/     文章详情页（构建期生成所有 slug）
  sitemap.ts        sitemap.xml
  robots.ts         robots.txt
  rss.xml/route.ts  RSS（force-static）
lib/
  posts.ts          Markdown 读取、解析、消毒、日期归一化
  site.ts           站点配置
posts/              Markdown 文章
public/             静态资源
out/                构建产物（git 忽略）
```
