import { useState } from 'react';
import ReactMde from 'react-mde';
import 'react-mde/lib/styles/css/react-mde-all.css';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import apiFetch from '../util/api';

export default function PostEditorPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', content: '' });
  const [selectedTab, setSelectedTab] = useState('write');
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
      <ReactMde
        value={form.content}
        onChange={handleContentChange}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={md => Promise.resolve(<ReactMarkdown>{md}</ReactMarkdown>)}
      />
      <button type="submit">Save</button>
    </form>
  );
}
