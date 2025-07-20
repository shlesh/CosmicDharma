import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string | null;
  slug: string;
  published: boolean;
  featured: boolean;
  tags: string | null;
  created_at: string;
  owner: string;
}

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
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

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Link href={`/posts/${post.slug}`}>
            <h2 className="text-xl font-semibold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors">
              {post.title}
            </h2>
          </Link>
          {post.featured && (
            <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full mt-1">
              Featured
            </span>
          )}
        </div>
      </div>

      {post.excerpt && (
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center space-x-4">
          <span>By {post.owner}</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
      </div>

      {post.tags && (
        <div className="flex flex-wrap gap-2 mb-3">
          {getTags(post.tags).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <Link href={`/posts/${post.slug}`}>
        <span className="inline-flex items-center text-purple-600 hover:text-purple-800 cursor-pointer transition-colors">
          Read more →
        </span>
      </Link>
    </Card>
  );
};

export default BlogCard;
