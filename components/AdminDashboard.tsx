import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import apiFetch, { fetchJson } from '../util/api';
import { useToast } from './ToastProvider';

interface Post {
  id: number;
  title: string;
  content: string;
}

interface User {
  id: number;
  username: string;
}
import dynamic from 'next/dynamic';

const ReactMde = dynamic(() => import('react-mde'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});
import ReactMarkdown from 'react-markdown';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashboard() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const {
    data: posts = [],
    mutate: mutatePosts,
    error: postsError
  } = useSWR<Post[]>(
    token ? ['admin/posts', token] : null,
    ([url, t]) => fetchJson(url, { headers })
  );

  const {
    data: users = [],
    mutate: mutateUsers,
    error: usersError
  } = useSWR<User[]>(
    token ? ['admin/users', token] : null,
    ([url, t]) => fetchJson(url, { headers })
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  });
  const [selectedTab, setSelectedTab] = useState('write');
  const toast = useToast();

  const load = () => {
    mutatePosts();
    mutateUsers();
  };

  useEffect(() => {
    if (postsError) toast('Failed to load posts');
  }, [postsError]);

  useEffect(() => {
    if (usersError) toast('Failed to load users');
  }, [usersError]);

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content });
  };

  const startCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setForm({ title: '', content: '' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleContentChange = val => setForm({ ...form, content: val });

  const handleSave = async () => {
    const url = editingId ? `admin/posts/${editingId}` : 'admin/posts';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiFetch(url, {
      method,
      headers,
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditingId(null);
      setIsCreating(false);
      load();
    } else {
      toast('Save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this post?')) return;
    const res = await apiFetch(`admin/posts/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) load();
    else toast('Delete failed');
  };

  if (!token) return <p>Please login.</p>;

  const data = {
    labels: ['Posts', 'Users'],
    datasets: [
      {
        label: 'Count',
        data: [posts.length, users.length],
        backgroundColor: ['rgba(75,192,192,0.5)', 'rgba(153,102,255,0.5)'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {((posts || []).length > 0 || (users || []).length > 0) && (
        <Bar data={data} options={options} />
      )}
      <h3>Posts</h3>
      {!editingId && !isCreating && (
        <button onClick={startCreate}>New Post</button>
      )}
      <ul>
        {(Array.isArray(posts) ? posts : []).map(p => (
          <li key={p.id}>
            {p.title}{' '}
            <button onClick={() => startEdit(p)}>Edit</button>{' '}
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {(editingId || isCreating) && (
        <div className="mt-5">
          <input name="title" value={form.title} onChange={handleChange} />
          <ReactMde
            value={form.content}
            onChange={handleContentChange}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            generateMarkdownPreview={md => Promise.resolve(<ReactMarkdown>{md}</ReactMarkdown>)}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => {
            setEditingId(null);
            setIsCreating(false);
          }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
