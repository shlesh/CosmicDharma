import React, { useEffect, useState } from 'react';
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
import ReactMde from 'react-mde';
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
import apiFetch from '../util/api';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ title: string; content: string }>({ title: '', content: '' });
  const [selectedTab, setSelectedTab] = useState('write');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const toast = useToast();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const load = () => {
    if (!token) return;
    apiFetch('admin/posts', { headers })
      .then(res => res.json())
      .then(setPosts)
      .catch(() => toast('Failed to load posts'));
    apiFetch('admin/users', { headers })
      .then(res => res.json())
      .then(setUsers)
      .catch(() => toast('Failed to load users'));
  };

  useEffect(() => {
    load();
  }, [token]);

  const startEdit = post => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleContentChange = val => setForm({ ...form, content: val });

  const handleSave = async () => {
    const res = await apiFetch(`admin/posts/${editingId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditingId(null);
      load();
    } else {
      toast('Save failed');
    }
  };

  const handleDelete = async id => {
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
      {(posts.length > 0 || users.length > 0) && <Bar data={data} options={options} />}
      <h3>Posts</h3>
      <ul>
        {posts.map(p => (
          <li key={p.id}>
            {p.title}{' '}
            <button onClick={() => startEdit(p)}>Edit</button>{' '}
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {editingId && (
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
          <button onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
