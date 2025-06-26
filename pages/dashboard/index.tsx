import React, { useState, useEffect } from 'react';
import { fetchJson } from '../../util/api';
import PostList, { BlogPost } from '../../components/PostList';
import AdminDashboard from '../../components/AdminDashboard';

interface DashboardUser {
  is_admin?: boolean;
  is_donor?: boolean;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tab, setTab] = useState<string>('Profile');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;
    fetchJson('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(setUser)
      .catch(() => setUser(null));
  }, [token]);

  useEffect(() => {
    if (!token || !user?.is_donor) return;
    fetchJson<BlogPost[]>('posts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [token, user]);

  if (!token) return <p>Please login.</p>;
  if (!user) return <p>Loading...</p>;

  const tabs = ['Profile'];
  if (user.is_donor) tabs.push('Posts');
  if (user.is_admin) tabs.push('Admin');

  const renderTab = () => {
    switch (tab) {
      case 'Profile':
        return <p>Your profile details will appear here.</p>;
      case 'Posts':
        return <PostList posts={posts} />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <nav className="mb-5">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`mr-2 ${tab === t ? 'font-bold' : ''}`}
          >
            {t}
          </button>
        ))}
      </nav>
      {renderTab()}
    </div>
  );
}
