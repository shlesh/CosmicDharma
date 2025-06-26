import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import LoginPage from '../pages/login';
import apiFetch from '../util/api';
import ToastProvider from './ToastProvider';

vi.mock('../util/api', () => ({
  default: vi.fn()
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

test('submits credentials via apiFetch', async () => {
  const fetchMock = apiFetch as any;
  fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ access_token: 't' }) });
  render(
    <ToastProvider>
      <LoginPage />
    </ToastProvider>
  );
  fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'u' } });
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'p' } });
  fireEvent.click(screen.getAllByRole('button', { name: /login/i })[0]);
  expect(apiFetch).toHaveBeenCalledWith('login', expect.any(Object));
});

test('shows error toast on failed login', async () => {
  const fetchMock = apiFetch as any;
  fetchMock.mockResolvedValue({ ok: false });
  render(
    <ToastProvider>
      <LoginPage />
    </ToastProvider>
  );
  fireEvent.change(screen.getAllByPlaceholderText(/username/i)[0], { target: { value: 'u' } });
  fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], { target: { value: 'p' } });
  fireEvent.click(screen.getAllByRole('button', { name: /login/i })[0]);
  await screen.findByText(/login failed/i);
});
