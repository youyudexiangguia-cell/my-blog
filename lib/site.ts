const FALLBACK_SITE_URL = 'http://localhost:3000';

function normalizeSiteUrl(value: string | undefined): string {
  const candidate = value?.trim() || FALLBACK_SITE_URL;

  try {
    return new URL(candidate).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const siteConfig = {
  name: '个人博客',
  description: '记录编程、Linux 与云服务器部署的学习笔记。',
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: 'zh_CN',
};
