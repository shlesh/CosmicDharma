import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import apiFetch from '../../util/api';
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
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch(`posts/${id}`)
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(() => {
        toast('Failed to load post');
        setPost(null);
      });
  }, [id]);

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
