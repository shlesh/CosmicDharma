import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import HouseAnalysis from './HouseAnalysis';

const sample = {
  1: 'Self expression',
  2: ['Finance', 'Values'],
};

test('renders house analysis heading and first entry', () => {
  render(<HouseAnalysis houses={sample} />);
  expect(screen.getByText(/house analysis/i)).toBeDefined();
  expect(
    screen.getByText((content, node) => node.textContent === 'House 1: Self expression')
  ).toBeDefined();
});
