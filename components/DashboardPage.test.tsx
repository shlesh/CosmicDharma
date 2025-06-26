import React from 'react';
import { render, screen } from '@testing-library/react';
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
  setupToken(null);
  render(<DashboardPage />);
  expect(screen.getByText(/please login/i)).toBeDefined();
});

test('shows dashboard after loading user', async () => {
  setupToken('t');
  fetchJson.mockResolvedValue({ username: 'u', is_admin: true, is_donor: true });
  render(<DashboardPage />);
  await screen.findByText('Dashboard');
  expect(screen.getByText('Admin')).toBeDefined();
  expect(screen.getByText('Posts')).toBeDefined();
});
