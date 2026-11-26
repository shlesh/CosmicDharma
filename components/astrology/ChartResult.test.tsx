import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';
import ChartResult from './ChartResult';

const thisYear = new Date().getFullYear();
const result: any = {
  birthInfo: { date: '2000-01-01', time: '12:00', latitude: 28.61, longitude: 77.21, timezone: 'Asia/Kolkata', ascendant_sign: 'Cancer', lagna_sign: 4, lagna_degree: 14.96 },
  planetaryPositions: [
    { name: 'Moon', sign: 'Capricorn', degree: 3, nakshatra_index: 20, pada: 2 },
    { name: 'Sun', sign: 'Sagittarius', degree: 16.5 },
  ],
  nakshatra: { nakshatra: 'Uttara Ashadha', pada: 2, deity: 'Vishvadevas' },
  vimshottariDasha: [
    { lord: 'Sun', start: '2000-01-01', end: `${thisYear - 1}-01-01`, sub: [] },
    { lord: 'Moon', start: `${thisYear - 1}-01-01`, end: `${thisYear + 9}-01-01`, sub: [{ lord: 'Mars', start: `${thisYear - 1}-01-01`, end: `${thisYear + 1}-01-01` }] },
  ],
  houses: { houses: { 1: { sign: 'Cancer', lord: 'Moon', bhava: 'Tanu', occupants: [], notes: [] } } },
};

test('summarises the chart: place, ascendant, Moon and the running dasha', () => {
  render(<ChartResult result={result} meta={{ name: 'Asha', location: 'Delhi' }} />);
  expect(screen.getByRole('heading', { name: 'Asha’s chart' })).toBeDefined();
  expect(screen.getByText('Delhi')).toBeDefined();
  expect(screen.getAllByText('Cancer').length).toBeGreaterThan(0);
  expect(screen.getByText('Uttara Ashadha, pada 2')).toBeDefined();
  // The current period is found by date, not by taking the first entry.
  expect(screen.getByText('Moon · Mars')).toBeDefined();
});

test('tabs switch sections and the chart style toggle swaps layouts', () => {
  render(<ChartResult result={result} />);
  expect(screen.getByRole('img', { name: 'North Indian birth chart' })).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'South Indian' }));
  expect(screen.getByRole('img', { name: 'South Indian birth chart' })).toBeDefined();

  fireEvent.click(screen.getByRole('tab', { name: /dasha/i }));
  expect(screen.getByRole('tab', { name: /dasha/i }).getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('heading', { name: 'Vimshottari dasha' })).toBeDefined();
});

test('ashtakavarga points (keyed by sign in the API) are shown by house', async () => {
  const { savByHouse } = await import('./StrengthSection');
  // Cancer ascendant: house 1 is Cancer (sign 4), house 10 is Aries (sign 1).
  const bySign = { 1: 30, 2: 29, 3: 24, 4: 23, 5: 27, 6: 27, 7: 26, 8: 35, 9: 30, 10: 26, 11: 28, 12: 32 };
  const byHouse = savByHouse(bySign, 4);
  expect(byHouse['1']).toBe(23);
  expect(byHouse['10']).toBe(30);
  expect(savByHouse(bySign, null)['1']).toBe(30); // no ascendant: left by sign
});
