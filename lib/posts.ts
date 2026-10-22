import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const postsDirectory = path.join(process.cwd(), 'posts');
const slugPattern = /^[a-z0-9][a-z0-9_-]*$/;

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'hr',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'del',
    'blockquote',
    'ul',
    'ol',
    'li',
    'a',
    'code',
    'pre',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'img',
    'figure',
    'figcaption',
    'span',
    'div',
    'sup',
    'sub',
    'kbd',
    'mark',
    'input',
    'details',
    'summary',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    code: ['class'],
    pre: ['class'],
    th: ['align', 'colspan', 'rowspan'],
    td: ['align', 'colspan', 'rowspan'],
    span: ['class'],
    div: ['class'],
    input: ['type', 'checked', 'disabled'],
    '*': ['id'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
    }),
  },
};

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  contentHtml?: string;
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return '';
}

function normalizeText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function getPostPath(slug: string): string | null {
  if (!slugPattern.test(slug)) {
    return null;
  }

  const fullPath = path.resolve(postsDirectory, `${slug}.md`);
  const relativePath = path.relative(postsDirectory, fullPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return fullPath;
}

function parsePostFile(fullPath: string) {
  return matter(fs.readFileSync(fullPath, 'utf8'));
}

// 获取所有文章列表（用于首页展示）
export function getAllPosts(): PostData[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const posts: PostData[] = [];

  for (const fileName of fs.readdirSync(postsDirectory)) {
    if (!fileName.endsWith('.md')) continue;

    const slug = fileName.slice(0, -3);
    if (!slugPattern.test(slug)) continue;

    const { data } = parsePostFile(path.join(postsDirectory, fileName));

    posts.push({
      slug,
      title: normalizeText(data.title, slug),
      date: normalizeDate(data.date),
      summary: normalizeText(data.summary, ''),
    });
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

// 获取指定文章内容并转为经过消毒的 HTML
export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const fullPath = getPostPath(slug);
  if (!fullPath || !fs.existsSync(fullPath)) return null;

  const { data, content } = parsePostFile(fullPath);
  const contentHtml = sanitizeHtml(await marked.parse(content), sanitizeOptions);

  return {
    slug,
    title: normalizeText(data.title, slug),
    date: normalizeDate(data.date),
    summary: normalizeText(data.summary, ''),
    contentHtml,
  };
}
