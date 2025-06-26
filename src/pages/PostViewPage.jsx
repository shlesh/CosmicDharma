import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PostViewPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
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
