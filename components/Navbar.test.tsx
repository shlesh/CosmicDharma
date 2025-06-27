import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { expect, test, vi, afterEach } from 'vitest';
import Navbar from './Navbar';

let router = { pathname: '/', push: vi.fn() };
vi.mock('next/router', () => ({
  useRouter: () => router
}));

function setToken(token: string | null) {
  if (token) {
    window.localStorage.setItem('token', token);
  } else {
    window.localStorage.removeItem('token');
  }
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

test('shows login link when logged out', () => {
  setToken(null);
  router.pathname = '/';
  render(<Navbar />);
  expect(screen.getByRole('link', { name: /home/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /posts/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /dashboard/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /login/i })).toBeDefined();
  expect(screen.queryByRole('button', { name: /logout/i })).toBeNull();
});

test('shows logout button when logged in', async () => {
  setToken('t');
  router.pathname = '/';
  render(<Navbar />);
  await screen.findByRole('button', { name: /logout/i });
  expect(screen.getByRole('button', { name: /logout/i })).toBeDefined();
});

test('highlights the active page', () => {
  setToken(null);
  router.pathname = '/posts';
  render(<Navbar />);
  const posts = screen.getByRole('link', { name: /posts/i });
  expect(posts.getAttribute('aria-current')).toBe('page');
  const home = screen.getByRole('link', { name: /home/i });
  expect(home.getAttribute('aria-current')).toBeNull();
});
