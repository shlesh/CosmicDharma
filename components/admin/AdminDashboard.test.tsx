import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { beforeEach, expect, test, vi } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { apiFetch, fetchJson } from '@/util/api';
import ToastProvider from '@/components/ui/ToastProvider';

vi.mock('@/util/api', () => ({
  fetchJson: vi.fn(async () => []),
  apiFetch: vi.fn(async () => ({})),
}));

// The rich editor and Chart.js need browser APIs jsdom lacks; stand-ins are enough.
vi.mock('@uiw/react-md-editor', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v?: string) => void }) => (
    <textarea aria-label="Content" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));
vi.mock('@uiw/react-md-editor/markdown-editor.css', () => ({}));
vi.mock('react-chartjs-2', () => ({ Bar: () => null }));

const fetchJsonMock = fetchJson as unknown as ReturnType<typeof vi.fn>;
const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

function renderAdmin() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ToastProvider>
        <AdminDashboard />
      </ToastProvider>
    </SWRConfig>
  );
}

beforeEach(() => {
  fetchJsonMock.mockClear();
  apiFetchMock.mockClear();
  localStorage.setItem('token', 't');
});

test('loads posts and users for the admin', async () => {
  renderAdmin();
  expect(await screen.findByRole('heading', { name: 'Admin Dashboard' })).toBeDefined();
  await waitFor(() => {
    const urls = fetchJsonMock.mock.calls.map((c) => c[0]);
    expect(urls).toEqual(expect.arrayContaining(['admin/posts', 'admin/users']));
  });
});

test('an admin grants donor status from the users list', async () => {
  fetchJsonMock.mockImplementation(async (url: string) =>
    url === 'admin/users'
      ? [{ username: 'fan', email: 'f@example.com', is_admin: false, is_donor: false }]
      : []
  );
  renderAdmin();
  fireEvent.click(await screen.findByRole('button', { name: 'Make donor' }));

  await waitFor(() => expect(apiFetchMock).toHaveBeenCalled());
  const [url, init] = apiFetchMock.mock.calls[0];
  expect(url).toBe('admin/users/fan/donor');
  expect(init.method).toBe('PATCH');
  expect(JSON.parse(init.body)).toEqual({ is_donor: true });
  fetchJsonMock.mockImplementation(async () => []);
});

test('creates a new post through POST /posts (there is no POST /admin/posts)', async () => {
  renderAdmin();
  fireEvent.click(await screen.findByRole('button', { name: 'New Post' }));
  fireEvent.change(screen.getByPlaceholderText('Post title...'), { target: { value: 'New' } });
  // The editor is lazy-loaded (next/dynamic), so wait for it to appear.
  fireEvent.change(await screen.findByLabelText('Content'), { target: { value: 'Body' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(apiFetchMock).toHaveBeenCalled());
  const [url, init] = apiFetchMock.mock.calls[0];
  expect(url).toBe('posts');
  expect(init.method).toBe('POST');
  expect(JSON.parse(init.body)).toMatchObject({ title: 'New', content: 'Body' });
});
