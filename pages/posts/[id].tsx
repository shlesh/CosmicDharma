import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import useSWR from 'swr';
import { fetchJson } from '../../util/api';
import { useToast } from '../../components/ToastProvider';
import PageHead from '../../components/PageHead';

interface BlogPost {
  id: number;
  title: string;
  content: string;
}

export default function PostViewPage() {
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query;
  const { data: post, error } = useSWR<BlogPost>(
    id ? `posts/${id}` : null,
    fetchJson
  );

  useEffect(() => {
    if (error) toast('Failed to load post');
  }, [error]);

  if (!post) return <p>Loading...</p>;

  return (
    <>
      <PageHead
        title={post.title}
        description={`${post.content.slice(0, 150)}...`}
        ogTitle={post.title}
        ogDescription={post.content.slice(0, 150)}
      />
      <article>
        <h2>{post.title}</h2>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </>
  );
}
