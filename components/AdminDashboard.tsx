import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import apiFetch, { fetchJson } from '../util/api';
import { useToast } from './ToastProvider';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin, linkPlugin, linkDialogPlugin, imagePlugin, tablePlugin, codeBlockPlugin, codeMirrorPlugin, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, CreateLink, InsertImage, InsertTable, InsertThematicBreak, ListsToggle } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface Post {
  id: number;
  title: string;
  content: string;
}

interface User {
  id: number;
  username: string;
}

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleContentChange = (markdown: string) => 
    setForm({ ...form, content: markdown });

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
      toast('Post saved successfully!');
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
    if (res.ok) {
      load();
      toast('Post deleted successfully!');
    } else {
      toast('Delete failed');
    }
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
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      {((posts || []).length > 0 || (users || []).length > 0) && (
        <div className="mb-8 bg-white p-4 rounded-lg shadow">
          <Bar data={data} options={options} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Posts</h3>
            {!editingId && !isCreating && (
              <button 
                onClick={startCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                New Post
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(Array.isArray(posts) ? posts : []).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">{p.title}</span>
                <div className="space-x-2">
                  <button 
                    onClick={() => startEdit(p)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Users</h3>
          <div className="space-y-2">
            {(Array.isArray(users) ? users : []).map(u => (
              <div key={u.id} className="p-2 border rounded">
                {u.username}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {(editingId || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Post' : 'Create Post'}
            </h3>
            
            <div className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Post title..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="border rounded-lg">
                <MDXEditor
                  markdown={form.content}
                  onChange={handleContentChange}
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                    codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
                    codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text' } }),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <BoldItalicUnderlineToggles />
                          <CreateLink />
                          <InsertImage />
                          <InsertTable />
                          <InsertThematicBreak />
                          <ListsToggle />
                        </>
                      )
                    })
                  ]}
                  className="min-h-[300px]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingId(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
