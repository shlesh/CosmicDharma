import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import CoreElements from './CoreElements';

const sample = { Fire: 40, Earth: 30, Air: 20, Water: 10 };

test('renders elemental percentages', () => {
  render(<CoreElements elements={sample} />);
  const item = screen.getByText(
    (_, node) => node.textContent === 'Fire: 40%'
  );
  expect(item).toBeDefined();
});
