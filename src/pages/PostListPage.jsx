import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
      <Link to="/editor">New Post</Link>
      <ul>
        {posts.map(p => (
          <li key={p.id}>
            <Link to={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
