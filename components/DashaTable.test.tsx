import React from "react";
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import DashaTable from './DashaTable';

const sample = [
  { lord: 'Sun', start: '2020-01-01', end: '2021-01-01' },
  { lord: 'Moon', start: '2021-01-01', end: '2022-01-01' },
];

test('renders mahadasha heading and first row', () => {
  render(<DashaTable dasha={sample} />);
  expect(screen.getByText(/vimshottari mahādasha/i)).toBeDefined();
  expect(screen.getByText(/Sun/i)).toBeDefined();
});
