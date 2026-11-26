import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import RegisterPage from '@/pages/register';
import { apiFetch } from '@/util/api';
import ToastProvider from '@/components/ui/ToastProvider';

const push = vi.fn();
vi.mock('next/router', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/util/api', () => ({ apiFetch: vi.fn() }));

const fetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

function renderAndFill(password: string, confirm: string) {
  render(
    <ToastProvider>
      <RegisterPage />
    </ToastProvider>
  );
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'u' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'u@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: confirm } });
  fireEvent.submit(screen.getByLabelText('Username').closest('form')!);
}

beforeEach(() => {
  fetchMock.mockReset();
  push.mockReset();
  localStorage.clear();
});

test('registers, stores the token and continues to the profile page', async () => {
  fetchMock.mockResolvedValue({ access_token: 'new' });
  renderAndFill('secret1', 'secret1');

  await waitFor(() => expect(push).toHaveBeenCalledWith('/profile'));
  const [path, init] = fetchMock.mock.calls[0];
  expect(path).toBe('/register');
  expect(JSON.parse(init.body)).toMatchObject({ username: 'u', email: 'u@example.com', password: 'secret1' });
  expect(localStorage.getItem('token')).toBe('new');
});

test('refuses mismatched passwords without calling the API', async () => {
  renderAndFill('secret1', 'secret2');
  expect((await screen.findByRole('alert')).textContent).toBe('Passwords do not match');
  expect(fetchMock).not.toHaveBeenCalled();
});
