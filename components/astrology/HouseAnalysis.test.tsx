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
  expect(screen.getByText(/houses/i)).toBeDefined();
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
    />
  );
  expect(screen.getByText(/House 1/)).toBeDefined();
  expect(screen.getByText(/Tanu/)).toBeDefined();
  expect(screen.getByText(/Taurus/)).toBeDefined();
  expect(screen.getByText(/lord Venus/)).toBeDefined();
  expect(screen.getByText(/Mercury: witty face/)).toBeDefined();
  expect(screen.queryByText(/House 1Taurus/)).toBeNull();
});
