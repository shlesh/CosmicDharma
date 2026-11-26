import React from "react";
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import CoreElements from './CoreElements';

const sample = { Fire: 40, Earth: 30, Air: 20, Water: 10 };

test('renders elemental percentages', () => {
  render(<CoreElements elements={sample} />);
  // Each element renders as a row: name in one span, "40%" in the next.
  const row = screen.getByText('Fire').parentElement!;
  expect(row.textContent).toBe('Fire40%');
  expect(screen.getByText('Water').parentElement!.textContent).toBe('Water10%');
});
