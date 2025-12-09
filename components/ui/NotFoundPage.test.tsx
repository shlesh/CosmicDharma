import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import NotFoundPage from '../pages/404';

test('renders friendly not found message', () => {
  render(<NotFoundPage />);
  expect(screen.getByText(/page not found/i)).toBeDefined();
  const link = screen.getByRole('link', { name: /go back home/i });
  expect(link.getAttribute('href')).toBe('/');
});
