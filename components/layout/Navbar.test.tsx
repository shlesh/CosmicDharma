import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { expect, test, vi, afterEach, beforeAll } from 'vitest';
import Navbar from './Navbar';
import ThemeProvider from './ThemeProvider';

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

beforeAll(() => {
  (window as any).matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

function renderNav() {
  render(
    <ThemeProvider>
      <Navbar />
    </ThemeProvider>
  );
}

test('shows login link when logged out', () => {
  setToken(null);
  router.pathname = '/';
  renderNav();
  expect(screen.getByRole('link', { name: /home/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /posts/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /dashboard/i })).toBeDefined();
  expect(screen.getByRole('link', { name: /login/i })).toBeDefined();
  expect(screen.queryByRole('button', { name: /logout/i })).toBeNull();
});

test('shows logout button when logged in', async () => {
  setToken('t');
  router.pathname = '/';
  renderNav();
  await screen.findByRole('button', { name: /logout/i });
  expect(screen.getByRole('button', { name: /logout/i })).toBeDefined();
});

test('highlights the active page', () => {
  setToken(null);
  router.pathname = '/posts';
  renderNav();
  const posts = screen.getByRole('link', { name: /posts/i });
  expect(posts.getAttribute('aria-current')).toBe('page');
  const home = screen.getByRole('link', { name: /home/i });
  expect(home.getAttribute('aria-current')).toBeNull();
});

test('shows theme toggle button', () => {
  setToken(null);
  router.pathname = '/';
  renderNav();
  expect(screen.getByRole('button', { name: /toggle theme/i })).toBeDefined();
});

test('toggle theme button', () => {
  setToken(null);
  router.pathname = '/';
  renderNav();
  const button = screen.getByRole('button', { name: /toggle theme/i });
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  fireEvent.click(button);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});
