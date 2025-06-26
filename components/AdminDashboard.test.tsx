import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import AdminDashboard from './AdminDashboard';
import apiFetch from '../util/api';

vi.mock('../util/api', () => ({
  default: vi.fn()
}));

// Chart.js requires canvas which isn't available in jsdom
HTMLCanvasElement.prototype.getContext = vi.fn();

test('renders admin dashboard heading', async () => {
  const fetchMock = apiFetch as any;
  fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
  fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
  window.localStorage.setItem('token', 't');
  render(<AdminDashboard />);
  expect(await screen.findByText(/admin dashboard/i)).toBeDefined();
});

test('creates a new post', async () => {
  const fetchMock = apiFetch as any;
  fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // posts
  fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // users
  fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1, title: 'New', content: 'C' }) }); // create
  fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 1, title: 'New', content: 'C' }]) }); // posts after create
  fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // users after create

  window.localStorage.setItem('token', 't');
  render(<AdminDashboard />);
  await screen.findAllByText(/posts/i);
  fireEvent.click(screen.getAllByText('New Post')[0]);
  await screen.findByText('Save');
  const input = document.querySelector('input[name="title"]') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'New' } });
  fireEvent.click(screen.getByText('Save'));
  await screen.findByText('New');
});
