import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import BlogPostDetail from '../../components/blog/BlogPostDetail';

interface BlogPostPageProps {
  slug: string;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      <Head>
        <title>Blog Post - Cosmic Dharma</title>
        <meta name="description" content="Read the latest insights on Vedic astrology" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BlogPostDetail slug={slug} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!;

  return {
    props: {
      slug: slug as string,
    },
  };
};

export default BlogPostPage;
