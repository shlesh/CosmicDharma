import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import LoginPage from '../pages/login';
import apiFetch from '../util/api';

vi.mock('../util/api', () => ({
  default: vi.fn()
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

test('submits credentials via apiFetch', async () => {
  const fetchMock = apiFetch as any;
  fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ access_token: 't' }) });
  render(<LoginPage />);
  fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'u' } });
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'p' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  expect(apiFetch).toHaveBeenCalledWith('login', expect.any(Object));
});
