---
title: "Next.js Standalone 模式原理解析与部署优化"
date: "2026-10-16"
summary: "利用 Next.js 独立输出模式大幅削减生产镜像体积，使轻量云主机能以极低内存占用运行 SSR 应用。"
---

## 独立打包优势

默认的 Next.js 部署通常需要完整的 `node_modules`，其中包含大量只在构建阶段使用的依赖。开启 standalone 模式后，编译器会自动进行依赖追踪（Tracing），仅提取生产运行必需的文件与模块。

在 `next.config.ts` 中开启：

```ts
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

### 核心收益

- **体积缩减**：产物从数百兆压缩至数十兆，适合小磁盘云主机和容器镜像。
- **依赖精简**：只保留运行时真正用到的模块，云端不需要重新执行完整的 `npm install`。
- **启动简单**：Next.js 会生成一个最小的 `server.js`，可以直接用 Node 启动。
- **内存**：standalone 不会直接降低运行时内存。Node 进程通常还是几十到一百多 MB，具体取决于 Next.js 版本、页面复杂度和并发量；它主要优化的是磁盘占用和依赖数量。

## 部署时容易漏掉的两件事

### 1. `public` 和 `.next/static` 不会自动复制

`next build` 之后，`.next/standalone` 只包含服务和依赖。静态资源需要手动复制：

```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

如果漏掉这一步，HTML 可能能打开，但 CSS、JS 和图片会全部 404。

### 2. 用 `server.js` 启动，而不是 `next start`

`output: 'standalone'` 下不要用 `npm start`（也就是 `next start`）。Next.js 会提示：

```text
"next start" does not work with "output: standalone" configuration.
Use "node .next/standalone/server.js" instead.
```

正确启动方式：

```bash
PORT=3000 HOSTNAME=127.0.0.1 node .next/standalone/server.js
```

`server.js` 会切换到自身所在目录，因此 `process.cwd()` 是 `.next/standalone`。如果你的代码在运行时读取项目根目录下的文件，要确认这些文件已经被 tracing 带进来，或者手动复制过去。

## 和反向代理配合

生产环境不建议直接把 Node 的 3000 端口暴露到公网。常见做法是：

- Node 监听 `127.0.0.1:3000`；
- Nginx 监听 80/443，反向代理到 `127.0.0.1:3000`；
- 安全组只开放 22、80、443。

这样可以把 TLS、静态资源缓存、请求体限制和基础防护交给 Nginx，Node 只负责页面渲染。

## 小结

standalone 的价值是“把运行所需的东西单独打包出来”，不是让 Node 变成零内存。真正部署时，记得复制 `public` 和 `.next/static`，并用 `node .next/standalone/server.js` 启动。
