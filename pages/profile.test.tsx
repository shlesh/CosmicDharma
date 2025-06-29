import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ProfilePage from './profile';
import { fetchJson } from '../util/api';

vi.mock('../util/api', () => ({
  fetchJson: vi.fn(),
}));

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText(/John Doe/i), {
    target: { value: 'John' },
  });
  fireEvent.click(screen.getByRole('button', { name: /next/i }));
  fireEvent.change(screen.getAllByLabelText(/Date of Birth/i)[0], {
    target: { value: '2000-01-01' },
  });
  fireEvent.change(screen.getAllByLabelText(/Time of Birth/i)[0], {
    target: { value: '12:00' },
  });
  fireEvent.click(screen.getByRole('button', { name: /next/i }));
  fireEvent.change(screen.getByPlaceholderText(/New York, USA/i), {
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
