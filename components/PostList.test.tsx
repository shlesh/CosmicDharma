import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import PostList from './PostList';
import apiFetch from '../util/api';
import ToastProvider from './ToastProvider';

vi.mock('../util/api', () => ({
  default: vi.fn()
}));

test('shows error toast when fetch fails', async () => {
  (apiFetch as any).mockRejectedValue(new Error('fail'));
  render(
    <ToastProvider>
      <PostList />
    </ToastProvider>
  );
  await screen.findByText(/failed to load posts/i);
});
