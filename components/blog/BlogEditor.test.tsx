import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import BlogEditor from './BlogEditor';
import { blogApi } from '@/util/api';

vi.mock('@/util/api', () => ({
  blogApi: {
    createPost: vi.fn(async (p: any) => ({ ...p, id: 1, slug: 'new' })),
    updatePost: vi.fn(),
    getPostById: vi.fn(),
  },
}));
// The real Markdown editor needs browser APIs jsdom lacks; a textarea stands in.
vi.mock('next/dynamic', () => ({
  default: () => ({ value, onChange, textareaProps }: any) => (
    <textarea aria-label="Content" value={value} onChange={(e) => onChange(e.target.value)} {...textareaProps} />
  ),
}));
vi.mock('@uiw/react-md-editor/markdown-editor.css', () => ({}));

test('creates a post through POST /posts (there is no POST /admin/posts)', async () => {
  const onSave = vi.fn();
  render(<BlogEditor onSave={onSave} />);
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New' } });
  fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Body' } });
  fireEvent.click(screen.getByRole('switch', { name: 'Featured' }));
  fireEvent.click(screen.getByRole('button', { name: /publish/i }));
  await waitFor(() => expect(onSave).toHaveBeenCalled());
  expect((blogApi.createPost as any).mock.calls[0][0]).toMatchObject({ title: 'New', content: 'Body', published: true, featured: true });
});

test('cannot be saved without a title and content', () => {
  render(<BlogEditor onSave={vi.fn()} />);
  expect((screen.getByRole('button', { name: /publish/i }) as HTMLButtonElement).disabled).toBe(true);
});
