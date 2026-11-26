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

test('renders the varga table and opens a chart below', async () => {
  render(<DivisionalCharts charts={charts} vargottama={["Sun"]} />);
  expect(screen.getByText(/Divisional charts/i)).toBeDefined();
  expect(screen.getByText('D9')).toBeDefined();
  await userEvent.click(screen.getByText('D10'));
  expect(screen.getByText(/D10 ·/)).toBeDefined();
});
