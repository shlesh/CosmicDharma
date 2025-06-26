import React, { useState, useEffect } from 'react';
import { fetchJson } from '../../util/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('Profile');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;
    fetchJson('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(setUser)
      .catch(() => setUser(null));
  }, [token]);

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
        return <p>Post management coming soon.</p>;
      case 'Admin':
        return <p>Admin tools coming soon.</p>;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <nav style={{ marginBottom: 20 }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ marginRight: 8, fontWeight: tab === t ? 'bold' : 'normal' }}
          >
            {t}
          </button>
        ))}
      </nav>
      {renderTab()}
    </div>
  );
}
