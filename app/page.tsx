import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">个人博客</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-gray-200 pb-4">
            <Link href={`/posts/${post.slug}`} className="text-xl font-semibold hover:text-blue-600 transition">
              {post.title}
            </Link>
            <p className="text-sm text-gray-400 mt-1">{post.date}</p>
            <p className="text-gray-600 mt-2">{post.summary}</p>
          </article>
        ))}
      </div>
    </main>
  );
}