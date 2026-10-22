# 个人博客

一个基于 Next.js 16 App Router 和本地 Markdown 的轻量博客，部署方式是 `standalone` + Node + Nginx。

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
npm run build
```

## 环境变量

站点 URL 用于 `metadataBase`、`sitemap.xml`、`robots.txt` 和 RSS。构建时读取：

```bash
NEXT_PUBLIC_SITE_URL=https://blog.example.com npm run build
```

本地不设置时会回退到 `http://localhost:3000`。生产环境必须在构建时传入真实域名，否则 sitemap/RSS 里会写 localhost。

## 写文章

在 `posts/` 下新建 Markdown 文件，文件名使用小写 kebab-case，例如 `my-first-post.md`。

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

- `date` 请加引号。不加引号时 YAML 可能把它解析成 `Date` 对象，渲染时会出问题。
- 代码围栏要闭合，避免后续内容被吞进代码块。
- 文件名只允许小写字母、数字、连字符和下划线，路由会按文件名生成 `/posts/<slug>`。

## 构建与启动（standalone）

```bash
npm ci
npm run build
```

复制 standalone 不会自动带上的静态资源：

```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

启动：

```bash
PORT=3000 HOSTNAME=127.0.0.1 NODE_ENV=production \
  node .next/standalone/server.js
```

不要用 `npm start`（`next start`）来运行 standalone 产物，Next.js 会明确提示改用 `server.js`。

### systemd 示例

```ini
[Unit]
Description=my-blog
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/my-blog/.next/standalone
ExecStart=/usr/bin/node server.js
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
Environment=NODE_ENV=production
User=www-data
Group=www-data
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

修改后：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now my-blog
sudo systemctl status my-blog
```

## Nginx 反向代理

Node 只监听 `127.0.0.1:3000`，由 Nginx 对外提供 80/443：

```nginx
server {
    listen 80;
    server_name blog.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

建议同时配置：

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- HTTPS 开启后再加 `Strict-Transport-Security`
- 安全组只开放 22、80、443，不要暴露 3000

## 2C2G 服务器注意事项

- 运行阶段 Node 通常几十到一百多 MB，2GB 内存足够。
- `npm ci` 和 `next build` 的瞬时内存更高，建议准备 2G Swap 兜底，或本地构建后上传产物。
- 不要在服务器上跑 `npm run dev`。
- 首次部署前先确认 `.next/standalone/posts` 是否存在。Next.js 的 tracing 通常会带上它，但如果以后改成运行时从外部目录读取文章，需要额外配置 `outputFileTracingIncludes`。

## 目录结构

```text
app/                页面、布局、metadata 路由
  posts/[slug]/     文章详情页
  sitemap.ts        sitemap.xml
  robots.ts         robots.txt
  rss.xml/route.ts  RSS
lib/
  posts.ts          Markdown 读取、解析、消毒
  site.ts           站点配置
posts/              Markdown 文章
public/             静态资源
```
