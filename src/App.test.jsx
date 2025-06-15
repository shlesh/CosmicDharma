import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /complete vedic astrological profile/i });
  expect(heading).toBeDefined();
});
