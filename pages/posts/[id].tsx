import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import apiFetch from '../../util/api';
import { useToast } from '../../components/ToastProvider';

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
    <article>
      <h2>{post.title}</h2>
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </article>
  );
}
