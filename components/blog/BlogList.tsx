import React, { useState, useEffect } from 'react';
import { blogApi } from '../../util/api';
import BlogCard from './BlogCard';
import { Button } from '../ui/Button';
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

interface BlogListProps {
  featuredOnly?: boolean;
  limit?: number;
  showPagination?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({ 
  featuredOnly = false, 
  limit = 10, 
  showPagination = true 
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
    loadTags();
  }, [page, searchTerm, selectedTags, featuredOnly]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {
        skip: page * limit,
        limit,
        search: searchTerm || undefined,
        tags: selectedTags.join(',') || undefined,
        published_only: true,
        featured_only: featuredOnly,
      };

      const data = await blogApi.getPosts(params);
      
      if (page === 0) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const data = await blogApi.getTags();
      setAvailableTags(data.tags || []);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    loadPosts();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setPage(0);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => { setError(null); loadPosts(); }}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {!featuredOnly && (
        <Card className="p-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button type="submit">Search</Button>
            </div>
          </form>

          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-100 border-purple-300 text-purple-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No posts found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load More */}
      {showPagination && hasMore && posts.length > 0 && (
        <div className="text-center">
          <Button 
            onClick={loadMore} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : 'Load More Posts'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
