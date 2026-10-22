import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">个人博客</h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">
          暂无文章，请先在 <code>posts</code> 目录添加 Markdown 文件。
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-gray-200 pb-4">
              <Link
                href={`/posts/${post.slug}`}
                prefetch={false}
                className="text-xl font-semibold hover:text-blue-600 transition"
              >
                {post.title}
              </Link>
              <time dateTime={post.date} className="block text-sm text-gray-500 mt-1">
                {post.date}
              </time>
              {post.summary ? (
                <p className="text-gray-600 mt-2">{post.summary}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
