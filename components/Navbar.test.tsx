import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Navbar from './Navbar';

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

function setToken(token: string | null) {
  if (token) {
    window.localStorage.setItem('token', token);
  } else {
    window.localStorage.removeItem('token');
  }
}

test('shows login link when logged out', () => {
  setToken(null);
  render(<Navbar />);
  expect(screen.getByRole('link', { name: /home/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /posts/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /dashboard/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /login/i })).toBeDefined();
  expect(screen.queryByRole('button', { name: /logout/i })).toBeNull();
});

test('shows logout button when logged in', async () => {
  setToken('t');
  render(<Navbar />);
  await screen.findByRole('button', { name: /logout/i });
  expect(screen.getByRole('button', { name: /logout/i })).toBeDefined();
});
