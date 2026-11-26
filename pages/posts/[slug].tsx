import type { GetServerSideProps } from 'next';
import BlogPostDetail from '@/components/blog/BlogPostDetail';

export default function BlogPostPage({ slug }: { slug: string }) {
  return (
    <div className="container py-10 sm:py-14">
      <BlogPostDetail slug={slug} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => ({
  props: { slug: String(params?.slug ?? '') },
});
