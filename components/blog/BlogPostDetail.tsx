import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { blogApi } from '../../util/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

import { BlogPost } from '../../util/api';

interface BlogPostDetailProps {
  slug: string;
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ slug }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getPostBySlug(slug);
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTags = (tagsString: string | null) => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error || !post) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">
          {error || 'Post not found'}
        </p>
        <Button onClick={() => router.push('/posts')}>
          ← Back to Posts
        </Button>
      </Card>
    );
  }

  return (
    <article>
      <Card className="p-8">
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push('/posts')}
            className="mb-4"
          >
            ← Back to Posts
          </Button>

          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span>By {post.owner}</span>
              <span>Published {post.created_at ? formatDate(post.created_at) : 'Date unknown'}</span>
              {post.updated_at !== post.created_at && (
                <span>Updated {post.updated_at ? formatDate(post.updated_at) : ''}</span>
              )}
              {post.featured && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Featured
                </span>
              )}
            </div>

            {post.tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {getTags(post.tags).map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        </div>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Card>
    </article>
  );
};

export default BlogPostDetail;
