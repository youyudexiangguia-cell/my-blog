import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { siteConfig } from '@/lib/site';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const description = post.summary || siteConfig.description;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/posts/${post.slug}`,
      ...(post.date ? { publishedTime: post.date } : {}),
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-blue-500 hover:underline mb-6 inline-block">
        ← 返回首页
      </Link>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <time dateTime={post.date} className="block text-sm text-gray-500 mb-8">
        {post.date}
      </time>
      <article
        className="article"
        dangerouslySetInnerHTML={{ __html: post.contentHtml ?? '' }}
      />
    </main>
  );
}
