import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ProfilePage from './profile';
import { fetchJson } from '../util/api';

vi.mock('../util/api', () => ({
  fetchJson: vi.fn(),
}));

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText(/Shailesh Tiwari/i), {
    target: { value: 'John' },
  });
  fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
    target: { value: '2000-01-01' },
  });
  fireEvent.change(screen.getByLabelText(/Time of Birth/i), {
    target: { value: '12:00' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Renukoot, India/i), {
    target: { value: 'Delhi' },
  });
};

test('shows skeleton while loading profile', async () => {
  (fetchJson as unknown as vi.Mock).mockResolvedValueOnce({ job_id: '1' });
  render(<ProfilePage />);
  fillForm();
  fireEvent.submit(screen.getByRole('button', { name: /submit/i }));
  expect(await screen.findByTestId('profile-skeleton')).toBeDefined();
});
