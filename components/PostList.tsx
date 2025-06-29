// components/PostList.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { fetchJson } from '../util/api';
import { useToast } from './ToastProvider';
import BlogCard from './blog/BlogCard';
import Button from './ui/Button';
import Card from './ui/Card';

export interface BlogPost {
  id: number;
  title: string;
  content?: string;
  created_at?: string;
  owner?: string;
}

export interface PostListProps {
  posts?: BlogPost[];
}

const categories = ['All', 'Vedic Astrology', 'Spirituality', 'Predictions', 'Tutorials'];

export default function PostList({ posts: initialPosts }: PostListProps = {}) {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, error } = useSWR<BlogPost[]>(
    initialPosts ? null : 'posts',
    fetchJson
  );

  useEffect(() => {
    if (error) toast('Failed to load posts');
  }, [error]);

  const posts = initialPosts ?? data ?? [];

  // Process posts for display
  const processedPosts = posts.map((post, index) => ({
    ...post,
    excerpt: post.content?.substring(0, 150) + '...',
    category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
    readTime: `${Math.ceil((post.content?.length || 500) / 200)} min`,
    date: post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) : 'Recent',
    featured: index === 0
  }));

  // Filter posts
  const filteredPosts = processedPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4">Cosmic Insights</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore articles on Vedic astrology, spiritual wisdom, and cosmic guidance
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <Card variant="glass" padding="sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 rounded-xl font-medium transition-all duration-300
                    ${selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search and Create */}
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 
                           bg-white dark:bg-gray-900 
                           focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <Link href="/editor">
                <Button variant="cosmic" size="sm">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Post
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <BlogCard
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              author={post.owner}
              date={post.date}
              category={post.category}
              readTime={post.readTime}
              featured={post.featured}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No posts found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery ? `No posts matching "${searchQuery}"` : 'Start by creating your first post!'}
          </p>
          <Link href="/editor">
            <Button variant="primary">Create Post</Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}