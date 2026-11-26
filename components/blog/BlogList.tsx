import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, X } from 'lucide-react';
import { blogApi, type BlogPostMeta } from '@/util/api';
import BlogCard from './BlogCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { controlClass } from '@/components/ui/Field';
import { useDebouncedValue } from '@/hooks/useGeocode';
import { cn } from '@/util/cn';

interface BlogListProps {
  featuredOnly?: boolean;
  limit?: number;
  showPagination?: boolean;
}

export default function BlogList({ featuredOnly = false, limit = 12, showPagination = true }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [reload, setReload] = useState(0);
  const query = useDebouncedValue(search.trim(), 350);

  useEffect(() => { setPage(0); }, [query, selected]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const qs = new URLSearchParams({ skip: String(page * limit), limit: String(limit), published_only: 'true', featured_only: String(featuredOnly) });
        if (query) qs.set('search', query);
        if (selected.length) qs.set('tags', selected.join(','));
        const data = await blogApi.getPosts(qs.toString());
        if (cancelled) return;
        setPosts((prev) => (page === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load posts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, query, selected, featuredOnly, limit, reload]);

  useEffect(() => {
    blogApi.getTags().then((d) => setTags(d.tags || [])).catch(() => setTags([]));
  }, []);

  const toggleTag = (tag: string) => setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  const filtering = !!query || selected.length > 0;
  const [lead, ...rest] = posts;
  const showLead = !filtering && page === 0 && lead?.featured;

  return (
    <div className="space-y-8">
      {!featuredOnly && (
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search the journal"
              placeholder="Search the journal"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(controlClass, 'h-12 rounded-full pl-11 pr-11')}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-subtle hover:text-fg" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
              {tags.map((tag) => {
                const on = selected.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={on}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                      on ? 'border-accent bg-accent/15 text-accent' : 'border-line/15 text-muted hover:border-line/30 hover:text-fg',
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {error ? (
        <Card>
          <EmptyState title="The journal didn’t load" description={error} action={<Button onClick={() => { setPage(0); setReload((n) => n + 1); }}>Try again</Button>} />
        </Card>
      ) : loading && posts.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-5 w-5" />}
            title={filtering ? 'Nothing matches' : 'No posts yet'}
            description={filtering ? 'Try a different word or clear the filters.' : 'The first essays are on their way.'}
            action={filtering ? <Button variant="secondary" onClick={() => { setSearch(''); setSelected([]); }}>Clear filters</Button> : undefined}
          />
        </Card>
      ) : (
        <>
          {showLead && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <BlogCard post={lead} featured />
            </motion.div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {(showLead ? rest : posts).map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % limit) * 0.04 }}>
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {showPagination && hasMore && posts.length > 0 && (
        <div className="text-center">
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)} loading={loading}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
