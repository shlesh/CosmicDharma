import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import PlanetTable from './PlanetTable';

const sample = [
  { name: 'Sun', sign: 'Aries', degree: 10.5, nakshatra_index: 1, pada: 2 },
  { name: 'Saturn', sign: 'Capricorn', degree: 5.75, retrograde: true },
];

test('lists each planet with sign, degree, nakshatra and house', () => {
  render(<PlanetTable planets={sample} lagnaSign={4} vargottama={['Sun']} />);
  expect(screen.getByRole('heading', { name: /planetary positions/i })).toBeDefined();
  const table = screen.getByRole('table');
  const sun = within(table).getByText('Sun').closest('tr')!;
  expect(sun.textContent).toContain('Aries');
  expect(sun.textContent).toContain('10°30′'); // degrees and minutes, not 10.50
  expect(sun.textContent).toContain('Bharani · 2');
  expect(sun.textContent).toContain('10'); // Aries is the 10th house from a Cancer ascendant
  expect(sun.textContent).toContain('Vargottama');
  expect(within(table).getByText('Saturn').closest('tr')!.textContent).toContain('Retrograde');
});
