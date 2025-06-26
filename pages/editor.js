import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useRouter } from 'next/router';
import apiFetch from '../util/api';

export default function PostEditorPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', content: '' });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleContentChange = value => setForm({ ...form, content: value });

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await apiFetch('posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/posts/${data.id}`);
    } else {
      alert('Save failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2>New Post</h2>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
      <ReactQuill value={form.content} onChange={handleContentChange} />
      <button type="submit">Save</button>
    </form>
  );
}
