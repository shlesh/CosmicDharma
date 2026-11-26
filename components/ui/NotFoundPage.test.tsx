import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import NotFoundPage from '@/pages/404';

test('renders a not-found heading and a link home', () => {
  render(<NotFoundPage />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/empty/i);
  const link = screen.getByRole('link', { name: /return home/i });
  expect(link.getAttribute('href')).toBe('/');
});
