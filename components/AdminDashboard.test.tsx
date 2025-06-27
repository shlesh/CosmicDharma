import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import AdminDashboard from './AdminDashboard';
import apiFetch, { fetchJson } from '../util/api';

vi.mock('../util/api', () => ({
  default: vi.fn(),
  fetchJson: vi.fn()
}));

// Chart.js requires canvas which isn't available in jsdom
HTMLCanvasElement.prototype.getContext = vi.fn();

test('renders admin dashboard heading', async () => {
  const fetchJsonMock = fetchJson as any;
  fetchJsonMock.mockResolvedValueOnce([]);
  fetchJsonMock.mockResolvedValueOnce([]);
  window.localStorage.setItem('token', 't');
  render(<AdminDashboard />);
  expect(await screen.findByText(/admin dashboard/i)).toBeDefined();
});

test('creates a new post', async () => {
  const fetchJsonMock = fetchJson as any;
  const fetchMock = apiFetch as any;
  fetchJsonMock.mockResolvedValueOnce([]); // posts
  fetchJsonMock.mockResolvedValueOnce([]); // users
  fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1, title: 'New', content: 'C' }) }); // create
  fetchJsonMock.mockResolvedValueOnce([{ id: 1, title: 'New', content: 'C' }]); // posts after create
  fetchJsonMock.mockResolvedValueOnce([]); // users after create

  window.localStorage.setItem('token', 't');
  render(<AdminDashboard />);
  await screen.findAllByText(/posts/i);
  fireEvent.click(screen.getAllByText('New Post')[0]);
  await screen.findByText('Save');
  const input = document.querySelector('input[name="title"]') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'New' } });
  fireEvent.click(screen.getByText('Save'));
  await screen.findAllByText(/admin dashboard/i);
  expect(fetchMock).toHaveBeenCalledWith('admin/posts', expect.any(Object));
});
