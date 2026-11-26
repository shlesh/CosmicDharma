import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import HouseAnalysis from './HouseAnalysis';

const sample = {
  1: 'Self expression',
  2: ['Finance', 'Values'],
};

test('renders house analysis heading and first entry', () => {
  render(<HouseAnalysis houses={sample} />);
  expect(screen.getByRole('heading', { name: 'Houses' })).toBeDefined();
  expect(screen.getByText(/House 1: Self expression/)).toBeDefined();
});

test('renders structured bhava cards without smashing sign into the title', () => {
  render(
    <HouseAnalysis
      houses={{
        houses: {
          1: {
            sign: 'Taurus',
            lord: 'Venus',
            bhava: 'Tanu',
            topic: 'Body',
            occupants: ['Mercury', 'Saturn'],
            notes: ['Mercury: witty face', 'Saturn: delayed youth'],
            summary: 'Taurus (ruled by Venus). Contains: Mercury, Saturn.',
          },
        },
      }}
      points={{ 1: 31 }}
    />
  );
  expect(screen.getByRole('heading', { level: 4 }).textContent).toMatch(/^House 1/);
  expect(screen.getAllByText(/Tanu/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Taurus/).length).toBeGreaterThan(0);
  expect(screen.getByText(/lord Venus/)).toBeDefined();
  expect(screen.getByText(/Mercury: witty face/)).toBeDefined();
  expect(screen.getByText('31 pts')).toBeDefined();
  expect(screen.queryByText(/House 1Taurus/)).toBeNull();
});
