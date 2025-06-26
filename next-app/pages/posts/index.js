import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PostListPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  return (
    <div>
      <h2>Blog Posts</h2>
      <Link href="/editor">New Post</Link>
      <ul>
        {posts.map(p => (
          <li key={p.id}>
            <Link href={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
