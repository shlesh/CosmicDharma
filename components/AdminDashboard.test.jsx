import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import AdminDashboard from './AdminDashboard';

test('renders admin dashboard heading', () => {
  window.localStorage.setItem('token', 't');
  render(<AdminDashboard />);
  expect(screen.getByText(/admin dashboard/i)).toBeDefined();
});
