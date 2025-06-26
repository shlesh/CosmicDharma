import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PostViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/posts/${id}`)
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(() => setPost(null));
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
    </article>
  );
}
