// components/blog/BlogCard.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

interface BlogCardProps {
  id: number;
  title: string;
  excerpt?: string;
  author?: string;
  date?: string;
  category?: string;
  readTime?: string;
  featured?: boolean;
}

export default function BlogCard({ 
  id, 
  title, 
  excerpt, 
  author, 
  date, 
  category, 
  readTime,
  featured = false 
}: BlogCardProps) {
  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="col-span-full"
      >
        <Link href={`/posts/${id}`}>
          <Card variant="cosmic" hover className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {category && (
                    <span className="px-3 py-1 text-xs font-medium bg-purple-600/20 text-purple-600 dark:text-purple-400 rounded-full">
                      {category}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">Featured</span>
                </div>
                
                <h2 className="text-3xl font-bold mb-4 group-hover:text-purple-600 transition-colors">
                  {title}
                </h2>
                
                {excerpt && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                    {excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {author && <span>By {author}</span>}
                  {date && <span>{date}</span>}
                  {readTime && <span>{readTime} read</span>}
                </div>
              </div>
              
              <div className="relative h-64 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/posts/${id}`}>
        <Card variant="glass" hover className="h-full group">
          <div className="relative h-48 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-xl mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          {category && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-600/10 text-purple-600 dark:text-purple-400 rounded-full mb-3">
              {category}
            </span>
          )}

          <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
            {title}
          </h3>

          {excerpt && (
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {author && <span>{author}</span>}
            {date && <span>{date}</span>}
            {readTime && <span>{readTime}</span>}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
