import { getAllPosts } from '@/lib/posts';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return character;
    }
  });
}

function toRfc822(value: string): string {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? '' : date.toUTCString();
}

export function GET() {
  const posts = getAllPosts();
  const latest = posts[0]?.date ?? '';
  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/posts/${post.slug}`;
      const pubDate = toRfc822(post.date);

      return [
        '<item>',
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        pubDate ? `<pubDate>${pubDate}</pubDate>` : '',
        `<description>${escapeXml(post.summary)}</description>`,
        '</item>',
      ].join('');
    })
    .join('');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    `<title>${escapeXml(siteConfig.name)}</title>`,
    `<link>${siteConfig.url}</link>`,
    `<description>${escapeXml(siteConfig.description)}</description>`,
    '<language>zh-CN</language>',
    latest ? `<lastBuildDate>${toRfc822(latest)}</lastBuildDate>` : '',
    items,
    '</channel>',
    '</rss>',
  ].join('');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
