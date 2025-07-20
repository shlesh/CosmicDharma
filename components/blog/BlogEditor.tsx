import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { blogApi } from '../../util/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

interface BlogEditorProps {
  postId?: number;
  onSave?: (post: any) => void;
  onCancel?: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ postId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    published: true,
    featured: false,
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const post = await blogApi.getPostById(postId!);
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        published: post.published,
        featured: post.featured,
        tags: post.tags || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      let result;
      if (postId) {
        result = await blogApi.updatePost(postId, formData);
      } else {
        result = await blogApi.createPost(formData);
      }
      
      if (onSave) {
        onSave(result);
      } else {
        router.push(`/posts/${result.slug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter post title..."
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Brief description of the post..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <MDEditor
            value={formData.content}
            onChange={(val) => setFormData(prev => ({ ...prev, content: val || '' }))}
            preview="edit"
            hideToolbar={false}
            height={400}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Comma-separated tags (e.g., vedic astrology, spirituality)"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Published</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving || !formData.title.trim() || !formData.content.trim()}
          >
            {saving ? 'Saving...' : (postId ? 'Update Post' : 'Create Post')}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.push('/posts'))}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BlogEditor;
