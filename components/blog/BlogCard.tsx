import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { BlogPostMeta } from '@/util/api';
import { formatDate } from '@/util/astro';
import { cn } from '@/util/cn';

export const splitTags = (tags?: string | null) => (tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []);

export default function BlogCard({ post, featured = false }: { post: BlogPostMeta; featured?: boolean }) {
  const tags = splitTags(post.tags);
  return (
    <article
      className={cn(
        'panel group relative flex h-full flex-col p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lift',
        featured && 'sm:p-8',
      )}
    >
      {featured && <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />}
      <div className="flex flex-wrap items-center gap-2 text-xs text-subtle">
        {post.featured && <Badge tone="accent">Featured</Badge>}
        {post.created_at && <time dateTime={post.created_at}>{formatDate(post.created_at, { day: 'numeric', month: 'long', year: 'numeric' })}</time>}
        {post.owner && <span>· {post.owner}</span>}
      </div>
      <h2 className={cn('mt-3 font-display font-semibold leading-tight text-fg', featured ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
        <Link href={`/posts/${post.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {post.title}
        </Link>
      </h2>
      {post.excerpt && (
        <p className={cn('mt-3 text-muted', featured ? 'line-clamp-4 text-base' : 'line-clamp-3 text-sm')}>{post.excerpt}</p>
      )}
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
      </div>
    </article>
  );
}
