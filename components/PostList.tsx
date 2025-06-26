import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiFetch from '../util/api';
import { useToast } from './ToastProvider';

export interface BlogPost {
  id: number;
  title: string;
}

export interface PostListProps {
  posts?: BlogPost[];
}

export default function PostList({ posts: initialPosts }: PostListProps = {}) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts ?? []);
  const toast = useToast();

  useEffect(() => {
    if (initialPosts) return;
    apiFetch('posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => toast('Failed to load posts'));
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
