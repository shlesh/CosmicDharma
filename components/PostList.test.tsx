import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import PostList from './PostList';
import { fetchJson } from '../util/api';
import ToastProvider from './ToastProvider';

vi.mock('../util/api', () => ({
  fetchJson: vi.fn()
}));

test('shows error toast when fetch fails', async () => {
  (fetchJson as any).mockRejectedValue(new Error('fail'));
  render(
    <ToastProvider>
      <PostList />
    </ToastProvider>
  );
  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toMatch(/failed to load posts/i);
});
