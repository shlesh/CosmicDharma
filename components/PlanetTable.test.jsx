import React from "react";
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import PlanetTable from './PlanetTable';

const sample = [
  { name: 'Sun', sign: 'Aries', degree: 10.5 },
  { name: 'Moon', sign: 'Taurus', degree: 5.75 },
];

test('renders planetary positions heading and first planet', () => {
  render(<PlanetTable planets={sample} />);
  expect(screen.getByText(/planetary positions/i)).toBeDefined();
  expect(screen.getByText(/Sun/i)).toBeDefined();
});
