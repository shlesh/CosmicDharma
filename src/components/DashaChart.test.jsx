import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import DashaChart from './DashaChart';

const sample = [
  { lord: 'Sun', start: '2020-01-01', end: '2021-01-01' },
  { lord: 'Moon', start: '2021-01-01', end: '2022-01-01' },
];

test('renders dasha chart heading', () => {
  render(<DashaChart dasha={sample} />);
  expect(screen.getByText(/dasha timeline/i)).toBeDefined();
});
