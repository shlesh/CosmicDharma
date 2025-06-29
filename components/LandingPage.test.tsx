import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import LandingPage from './LandingPage';

test('renders hero and navigation links', () => {
  render(<LandingPage />);
  expect(screen.getByRole('heading', { name: /cosmic dharma/i })).toBeDefined();
  const chart = screen.getByRole('link', { name: /get your chart/i });
  expect(chart.getAttribute('href')).toBe('/profile');
  const blog = screen.getByRole('link', { name: /explore blog/i });
  expect(blog.getAttribute('href')).toBe('/posts');
});
