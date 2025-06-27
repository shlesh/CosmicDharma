import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetchJson } from '../../util/api';
import PostList, { BlogPost } from '../../components/PostList';
import AdminDashboard from '../../components/AdminDashboard';
import { useToast } from '../../components/ToastProvider';

interface DashboardUser {
  is_admin?: boolean;
  is_donor?: boolean;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const [tab, setTab] = useState<string>('Profile');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const toast = useToast();

  const {
    data: user,
    error: userError
  } = useSWR<DashboardUser>(
    token ? ['/users/me', token] : null,
    ([url, t]) => fetchJson(url, { headers: { Authorization: `Bearer ${t}` } })
  );

  const {
    data: posts,
    error: postsError
  } = useSWR<BlogPost[]>(
    token && user?.is_donor ? ['posts', token] : null,
    ([url, t]) => fetchJson(url, { headers: { Authorization: `Bearer ${t}` } })
  );

  useEffect(() => {
    if (userError) toast('Failed to load user');
  }, [userError]);

  useEffect(() => {
    if (postsError) toast('Failed to load posts');
  }, [postsError]);

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
        return <PostList posts={posts ?? []} />;
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
