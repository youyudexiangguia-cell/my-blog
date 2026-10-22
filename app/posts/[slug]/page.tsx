import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/posts';

interface PageProps {
  params: Promise<{ slug: string }>;
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
      <p className="text-sm text-gray-400 mb-8">{post.date}</p>
      <article
        className="prose dark:prose-invert max-w-none leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
      />
    </main>
  );
}