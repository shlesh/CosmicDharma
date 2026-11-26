import React, { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Save } from 'lucide-react';
import '@uiw/react-md-editor/markdown-editor.css';
import { blogApi } from '@/util/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { Field, Input, Textarea, FormError } from '@/components/ui/Field';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/util/cn';

// The editor touches `window` and is heavy: load it in the browser only.
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false, loading: () => <Skeleton className="h-[420px]" /> });

interface BlogEditorProps {
  postId?: number;
  onSave?: (post: any) => void;
  onCancel?: () => void;
}

function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-line/20')}
      >
        <span className={cn('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', checked && 'translate-x-5')} />
      </button>
      <div>
        <span id={`${id}-label`} className="block cursor-pointer text-sm font-medium text-fg" onClick={() => onChange(!checked)}>{label}</span>
        {hint && <span id={`${id}-hint`} className="block text-xs text-subtle">{hint}</span>}
      </div>
    </div>
  );
}

const BlogEditor: React.FC<BlogEditorProps> = ({ postId, onSave, onCancel }) => {
  const router = useRouter();
  const toast = useToast();
  const { theme } = useTheme();
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', published: true, featured: false, tags: '' });
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    blogApi
      .getPostById(postId)
      .then((post) =>
        setForm({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          published: post.published,
          featured: post.featured || false,
          tags: post.tags || '',
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the post'))
      .finally(() => setLoading(false));
  }, [postId]);

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = postId ? await blogApi.updatePost(postId, form) : await blogApi.createPost(form);
      toast(postId ? 'Post updated.' : form.published ? 'Post published.' : 'Draft saved.', 'success');
      if (onSave) onSave(result);
      else router.push(form.published ? `/posts/${result.slug}` : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-24" />
        <Skeleton className="h-[420px]" />
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Card padding="lg" className="space-y-5">
        <Field label="Title" id="post-title">
          {(p) => <Input {...p} required value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="A clear, specific title" />}
        </Field>
        <Field label="Summary" id="post-excerpt" optional hint={`${form.excerpt.length}/300 · shown on the journal page and in link previews`}>
          {(p) => <Textarea {...p} rows={3} maxLength={300} value={form.excerpt} onChange={(e) => update({ excerpt: e.target.value })} />}
        </Field>
        <div className="space-y-1.5">
          <p id="post-content-label" className="text-sm font-medium text-fg/90">Content</p>
          <div data-color-mode={theme} className="overflow-hidden rounded-xl border border-line/15 [&_.w-md-editor]:!bg-surface-2/60 [&_.w-md-editor]:!shadow-none">
            <MDEditor
              value={form.content}
              onChange={(v) => update({ content: v || '' })}
              preview="live"
              height={480}
              textareaProps={{ 'aria-labelledby': 'post-content-label', placeholder: 'Write in Markdown…' }}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <Card className="space-y-5">
          <Switch label="Published" checked={form.published} onChange={(v) => update({ published: v })} hint="Visible in the journal." />
          <Switch label="Featured" checked={form.featured} onChange={(v) => update({ featured: v })} hint="Shown first, larger." />
          <Field label="Topics" id="post-tags" hint="Comma-separated, e.g. yuga, dasha">
            {(p) => <Input {...p} value={form.tags} onChange={(e) => update({ tags: e.target.value })} />}
          </Field>
        </Card>
        <FormError>{error}</FormError>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" loading={saving} disabled={!form.title.trim() || !form.content.trim()}>
            {!saving && <Save className="h-4 w-4" />}
            {postId ? 'Save changes' : form.published ? 'Publish' : 'Save draft'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel || (() => router.back())}>Cancel</Button>
        </div>
      </div>
    </form>
  );
};

export default BlogEditor;
