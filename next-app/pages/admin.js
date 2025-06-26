import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const load = () => {
    fetch('/admin/posts', { headers })
      .then(res => res.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const startEdit = post => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleContentChange = val => setForm({ ...form, content: val });

  const handleSave = async () => {
    const res = await fetch(`/admin/posts/${editingId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setEditingId(null);
      load();
    } else {
      alert('Save failed');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this post?')) return;
    const res = await fetch(`/admin/posts/${id}`, {
      method: 'DELETE',
      headers
    });
    if (res.ok) load();
    else alert('Delete failed');
  };

  if (!token) return <p>Please login.</p>;

  return (
    <div>
      <h2>Admin Posts</h2>
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
        <div style={{ marginTop: 20 }}>
          <input name="title" value={form.title} onChange={handleChange} />
          <ReactQuill value={form.content} onChange={handleContentChange} />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
