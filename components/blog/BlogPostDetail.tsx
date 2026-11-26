import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Clock } from 'lucide-react';
import Seo from '@/components/layout/Seo';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { blogApi, type BlogPost } from '@/util/api';
import { formatDate } from '@/util/astro';
import { splitTags } from './BlogCard';

const readingMinutes = (text: string) => Math.max(1, Math.round(text.trim().split(/\s+/).length / 220));

export default function BlogPostDetail({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    blogApi
      .getPostBySlug(slug)
      .then((data) => { if (!cancelled) setPost(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the post'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const back = (
    <Link href="/posts" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent">
      <ArrowLeft className="h-4 w-4" /> Journal
    </Link>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-4 w-48" />
        <div className="space-y-3 pt-6">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-xl">
        <Seo title="Post not found" noindex />
        <Card>
          <EmptyState title="We couldn’t find that post" description="It may have been moved or unpublished." action={<ButtonLink href="/posts" variant="secondary">Back to the journal</ButtonLink>} />
        </Card>
      </div>
    );
  }

  const tags = splitTags(post.tags);
  const updated = post.updated_at && post.updated_at.slice(0, 10) !== post.created_at?.slice(0, 10);

  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-3xl">
      <Seo title={post.title} description={post.excerpt || undefined} />
      {back}
      <header className="mt-6 border-b border-line/10 pb-8">
        {post.featured && <Badge tone="accent" className="mb-4">Featured</Badge>}
        <h1 className="font-display text-display-lg font-semibold">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-muted">{post.excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-subtle">
          {post.owner && <span>By <span className="text-fg">{post.owner}</span></span>}
          {post.created_at && <time dateTime={post.created_at}>{formatDate(post.created_at, { day: 'numeric', month: 'long', year: 'numeric' })}</time>}
          {updated && <span>Updated {formatDate(post.updated_at!, { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {readingMinutes(post.content)} min read</span>
        </div>
      </header>

      {/* Markdown from the editor. Raw HTML in posts is not rendered, so a post can't inject scripts. */}
      <div className="prose-cd mt-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      {tags.length > 0 && (
        <footer className="mt-12 flex flex-wrap items-center gap-2 border-t border-line/10 pt-6">
          <span className="text-sm text-subtle">Topics:</span>
          {tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </footer>
      )}
      <div className="mt-10">{back}</div>
    </motion.article>
  );
}
