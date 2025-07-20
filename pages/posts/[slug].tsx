// pages/posts/[slug].tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import BlogPostDetail from '../../components/blog/BlogPostDetail';

interface BlogPostPageProps {
  slug: string;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug }) => {
  return <BlogPostDetail slug={slug} />;
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
