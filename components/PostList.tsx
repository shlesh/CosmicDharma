import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiFetch from '../util/api';

export interface BlogPost {
  id: number;
  title: string;
}

export interface PostListProps {
  posts?: BlogPost[];
}

export default function PostList({ posts: initialPosts }: PostListProps = {}) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts ?? []);

  useEffect(() => {
    if (initialPosts) return;
    apiFetch('posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  }, [initialPosts]);

  return (
    <div>
      <h2>Blog Posts</h2>
      <Link href="/editor">New Post</Link>
      <ul>
        {(Array.isArray(posts) ? posts : []).map(p => (
          <li key={p.id}>
            <Link href={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
