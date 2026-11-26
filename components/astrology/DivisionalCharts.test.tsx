import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import DivisionalCharts from './DivisionalCharts';

const charts = {
  D1: { Sun: 1, Moon: 2 },
  D9: { Sun: 1, Moon: 5 },
  D10: { Sun: 10, Moon: 4 },
};

test('opens the navamsha first and switches charts from the chips', async () => {
  render(<DivisionalCharts charts={charts} vargottama={['Sun']} />);
  expect(screen.getByRole('heading', { name: /divisional charts/i })).toBeDefined();
  expect(screen.getByRole('button', { name: 'D9' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByText(/Vargottama:/)).toBeDefined();

  await userEvent.click(screen.getByRole('button', { name: 'D10' }));
  expect(await screen.findByRole('heading', { name: /D10 · Dashamsha/ })).toBeDefined();
  expect(screen.getByRole('button', { name: 'D10' }).getAttribute('aria-pressed')).toBe('true');
});
