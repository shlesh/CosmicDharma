import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import BasicInfo from './BasicInfo';

const sample = {
  date: '2000-01-01',
  time: '12:00',
  location: 'Delhi',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'IST',
};

test('renders birth details heading and location', () => {
  render(<BasicInfo birth={sample} />);
  expect(screen.getByText(/birth details/i)).toBeDefined();
  expect(screen.getByText(/Delhi/i)).toBeDefined();
});
