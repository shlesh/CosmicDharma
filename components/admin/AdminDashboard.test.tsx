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
  fetchJsonMock.mockReset();
  fetchJsonMock.mockImplementation(async () => []);
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

test('deleting a post asks for confirmation first', async () => {
  fetchJsonMock.mockImplementation(async (url: string) => (url === 'admin/posts' ? [{ id: 7, title: 'Old news', published: true }] : []));
  renderAdmin();
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Old news' }));
  expect(apiFetchMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm deleting Old news' }));
  await waitFor(() => expect(apiFetchMock).toHaveBeenCalled());
  const [url, init] = apiFetchMock.mock.calls[0];
  expect(url).toBe('admin/posts/7');
  expect(init.method).toBe('DELETE');
});

test('new posts are written in the editor', async () => {
  renderAdmin();
  expect((await screen.findByRole('link', { name: /new post/i })).getAttribute('href')).toBe('/editor');
});
