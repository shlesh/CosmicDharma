import { useState } from 'react';
import ReactMde from 'react-mde';
import 'react-mde/lib/styles/css/react-mde-all.css';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import apiFetch from '../util/api';
import { useToast } from '../components/ToastProvider';

interface EditorForm {
  title: string;
  content: string;
}

export default function PostEditorPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<EditorForm>({ title: '', content: '' });
  const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleContentChange = (value: string) => setForm({ ...form, content: value });

  const handleSubmit = async (e: React.FormEvent) => {
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
      toast('Save failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold">New Post</h2>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="border rounded p-2"
      />
      <ReactMde
        value={form.content}
        onChange={handleContentChange}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={md => Promise.resolve(<ReactMarkdown>{md}</ReactMarkdown>)}
      />
      <button type="submit" className="rounded bg-blue-600 p-2 text-white">
        Save
      </button>
    </form>
  );
}
