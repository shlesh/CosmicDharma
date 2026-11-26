import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import LoginPage from '@/pages/login';
import { apiFetch } from '@/util/api';
import ToastProvider from '@/components/ui/ToastProvider';

vi.mock('@/util/api', () => ({ apiFetch: vi.fn() }));

const push = vi.fn();
vi.mock('next/router', () => ({ useRouter: () => ({ push }) }));

const fetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

function renderLogin() {
  render(
    <ToastProvider>
      <LoginPage />
    </ToastProvider>
  );
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'u' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'p' } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

beforeEach(() => {
  fetchMock.mockReset();
  push.mockReset();
  localStorage.clear();
});

test('posts form-encoded credentials, stores the token and goes to the dashboard', async () => {
  fetchMock.mockResolvedValue({ access_token: 't0k' });
  renderLogin();

  await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
  const [path, init] = fetchMock.mock.calls[0];
  expect(path).toBe('/login');
  expect(init.method).toBe('POST');
  expect(String(init.body)).toBe('username=u&password=p');
  expect(localStorage.getItem('token')).toBe('t0k');
});

test('shows the server error and stays on the page when login fails', async () => {
  fetchMock.mockRejectedValue(new Error('Incorrect username or password'));
  renderLogin();

  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toBe('Incorrect username or password');
  expect(push).not.toHaveBeenCalled();
  expect(localStorage.getItem('token')).toBeNull();
});
