import React, { useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetchJson } from '../util/api';
import { useToast } from './ToastProvider';

export interface BlogPost {
  id: number;
  title: string;
}

export interface PostListProps {
  posts?: BlogPost[];
}

export default function PostList({ posts: initialPosts }: PostListProps = {}) {
  const toast = useToast();
  const { data, error } = useSWR<BlogPost[]>(
    initialPosts ? null : 'posts',
    fetchJson
  );

  useEffect(() => {
    if (error) toast('Failed to load posts');
  }, [error]);

  const posts = initialPosts ?? data ?? [];

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
