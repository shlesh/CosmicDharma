import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import LandingPage from './LandingPage';

test('renders hero and navigation links', () => {
  render(<LandingPage />);
  expect(screen.getByText(/cosmic dharma/i)).toBeDefined();
  const login = screen.getByRole('link', { name: /login/i });
  expect(login.getAttribute('href')).toBe('/login');
  const read = screen.getByRole('link', { name: /scroll to read/i });
  expect(read.getAttribute('href')).toBe('#about');
});
