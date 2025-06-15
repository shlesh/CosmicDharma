import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import DashaTable from './DashaTable';

const dasha = [
  { lord: 'Sun', start: '2020', end: '2021' },
  { lord: 'Moon', start: '2021', end: '2022' },
];
const analysis = [
  { description: 'Sun period' },
  { description: 'Moon period' },
];

test('shows description column when analysis provided', () => {
  render(<DashaTable dasha={dasha} analysis={analysis} />);
  expect(screen.getByText(/sun period/i)).toBeDefined();
});
