import React from 'react';
import Head from 'next/head';
import BlogList from '../../components/blog/BlogList';
import { Card } from '../../components/ui/Card';

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      <Head>
        <title>Blog - Cosmic Dharma</title>
        <meta name="description" content="Explore Vedic astrology insights and wisdom" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cosmic Dharma Blog
            </h1>
            <p className="text-xl text-gray-600">
              Insights into Vedic astrology, spiritual wisdom, and cosmic understanding
            </p>
          </header>

          <BlogList showPagination={true} />
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
