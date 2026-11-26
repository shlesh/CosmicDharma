import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SWRConfig } from 'swr';
import { beforeEach, expect, test, vi } from 'vitest';
import DashboardPage from '@/pages/dashboard/index';
import ToastProvider from '@/components/ui/ToastProvider';
import { AuthProvider } from '@/hooks/useAuth';

let currentUser: Record<string, unknown> = {};

vi.mock('@/util/api', () => ({
  getCurrentUser: vi.fn(async () => currentUser),
  // Route by URL so the test doesn't depend on fetch order.
  fetchJson: vi.fn(async () => []),
  apiFetch: vi.fn(async () => ({})),
}));

function renderDashboard() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <ToastProvider>
            <DashboardPage />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SWRConfig>,
  );
}

beforeEach(() => {
  localStorage.clear();
  currentUser = { username: 'u', email: 'u@example.com', is_admin: false, is_donor: false };
});

test('asks visitors without a token to sign in', async () => {
  renderDashboard();
  expect(await screen.findByText('Sign in to see your dashboard')).toBeDefined();
  expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login?next=/dashboard');
});

test('greets a signed-in user and offers to cast a chart when none is saved', async () => {
  localStorage.setItem('token', 't');
  renderDashboard();
  expect(await screen.findByRole('heading', { name: /, u$/ })).toBeDefined();
  expect(screen.getByText('No chart yet')).toBeDefined();
  expect(screen.queryByRole('tab', { name: 'Admin' })).toBeNull();
});

test('shows the saved chart with its running dasha', async () => {
  localStorage.setItem('token', 't');
  const y = new Date().getFullYear();
  localStorage.setItem('cosmic_dharma_chart', JSON.stringify({
    savedAt: new Date().toISOString(),
    meta: { name: 'Asha', location: 'Delhi' },
    result: {
      birthInfo: { date: '2000-01-01', time: '12:00', ascendant_sign: 'Cancer', lagna_sign: 4 },
      planetaryPositions: [{ name: 'Moon', sign: 'Capricorn', degree: 3 }],
      vimshottariDasha: [{ lord: 'Venus', start: `${y - 2}-01-01`, end: `${y + 10}-01-01`, sub: [] }],
    },
  }));
  renderDashboard();
  expect(await screen.findByRole('heading', { name: 'Asha’s chart' })).toBeDefined();
  expect(screen.getByText('Venus mahadasha')).toBeDefined();
});

test('admins get an admin tab with the admin tools', async () => {
  localStorage.setItem('token', 't');
  currentUser = { ...currentUser, is_admin: true };
  renderDashboard();
  fireEvent.click(await screen.findByRole('tab', { name: 'Admin' }));
  expect(await screen.findByRole('heading', { name: 'Admin Dashboard' })).toBeDefined();
});
