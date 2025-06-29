import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import DashboardPage from '../pages/dashboard/index';

import { fetchJson } from '../util/api';
vi.mock('../util/api', () => ({
  fetchJson: vi.fn()
}));

function setupToken(token) {
  if (token) {
    window.localStorage.setItem('token', token);
  } else {
    window.localStorage.removeItem('token');
  }
}

test('prompts to login when no token', () => {
  fetchJson.mockReset();
  setupToken(null);
  render(<DashboardPage />);
  expect(screen.getByText(/please login/i)).toBeDefined();
});

test('shows dashboard after loading user', async () => {
  fetchJson.mockReset();
  setupToken('t');
  fetchJson.mockResolvedValue({ username: 'u', is_admin: true, is_donor: true });
  render(<DashboardPage />);
  await screen.findAllByText('Dashboard');
  expect(screen.getByText('Admin')).toBeDefined();
  expect(screen.getByText('Posts')).toBeDefined();
});

test('renders post list for donors', async () => {
  fetchJson.mockReset();
  setupToken('t');
  fetchJson
    .mockResolvedValueOnce({ username: 'u', is_donor: true })
    .mockResolvedValueOnce([{ id: 1, title: 'Hello' }]);
  render(<DashboardPage />);
  await screen.findAllByText('Dashboard');
  fireEvent.click(screen.getAllByText('Posts')[0]);
  await screen.findByText(/cosmic insights/i);
});

test('renders admin dashboard for admins', async () => {
  fetchJson.mockReset();
  setupToken('t');
  fetchJson
    .mockResolvedValueOnce({ username: 'u', is_admin: true })
    .mockResolvedValueOnce([]) // posts fetch will not be used
    .mockResolvedValueOnce([]) // admin posts
    .mockResolvedValueOnce([]); // admin users
  render(<DashboardPage />);
  await screen.findAllByText('Dashboard');
  fireEvent.click(screen.getAllByText('Admin')[0]);
  await screen.findByText(/admin dashboard/i);
});
