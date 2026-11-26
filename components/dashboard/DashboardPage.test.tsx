import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SWRConfig } from 'swr';
import { beforeEach, expect, test, vi } from 'vitest';
import DashboardPage from '@/pages/dashboard/index';
import ToastProvider from '@/components/ui/ToastProvider';

let currentUser: Record<string, unknown> = {};

vi.mock('@/util/api', () => ({
  // Route by URL so the test doesn't depend on fetch order.
  fetchJson: vi.fn(async (url: string) => (url === '/users/me' ? currentUser : [])),
  apiFetch: vi.fn(async () => ({})),
  blogApi: { getPosts: vi.fn(async () => []) },
  profileApi: { startJob: vi.fn(), jobStatus: vi.fn() },
}));

function renderDashboard() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <QueryClientProvider client={qc}>
        <ToastProvider>
          <DashboardPage />
        </ToastProvider>
      </QueryClientProvider>
    </SWRConfig>
  );
}

beforeEach(() => {
  localStorage.clear();
  currentUser = { username: 'u' };
});

test('asks visitors without a token to log in', () => {
  renderDashboard();
  expect(screen.getByText(/please login/i)).toBeDefined();
});

test('a regular user sees only the profile tab and the birth form', async () => {
  localStorage.setItem('token', 't');
  renderDashboard();
  expect(await screen.findByText('Discover Your Cosmic Blueprint')).toBeDefined();
  expect(screen.getByRole('button', { name: 'Profile' })).toBeDefined();
  expect(screen.queryByRole('button', { name: 'Posts' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Admin' })).toBeNull();
});

test('donors get a posts tab', async () => {
  currentUser = { username: 'u', is_donor: true };
  localStorage.setItem('token', 't');
  renderDashboard();
  expect(await screen.findByRole('button', { name: 'Posts' })).toBeDefined();
  expect(screen.queryByRole('button', { name: 'Admin' })).toBeNull();
});

test('admins can open the admin dashboard', async () => {
  currentUser = { username: 'u', is_admin: true };
  localStorage.setItem('token', 't');
  renderDashboard();
  fireEvent.click(await screen.findByRole('button', { name: 'Admin' }));
  expect(await screen.findByRole('heading', { name: 'Admin Dashboard' })).toBeDefined();
});
