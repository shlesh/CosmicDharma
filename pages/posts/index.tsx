import React from 'react';
import Head from 'next/head';
import BlogList from '../../components/blog/BlogList';

const BlogPage: React.FC = () => {
  return (
    <div className="page-shell">
      <Head>
        <title>Journal — Cosmic Dharma</title>
        <meta name="description" content="Notes on Vedic astrology, yuga, and practice." />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="font-display text-amber-50 mb-3">Journal</h1>
            <p className="help-text text-lg">
              Notes from under the same sky the charts are cast in.
            </p>
          </header>
          <BlogList showPagination={true} />
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
