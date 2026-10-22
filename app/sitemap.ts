import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';
import { siteConfig } from '@/lib/site';

function toDate(value: string): Date | undefined {
  if (!value) return undefined;

  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPostDate = toDate(posts[0]?.date ?? '');

  return [
    {
      url: siteConfig.url,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/posts/${post.slug}`,
      lastModified: toDate(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
