import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ProfileForm from './ProfileForm';

// The real autocomplete hits a geocoding API; a plain input is enough here.
vi.mock('./LocationAutocomplete', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input placeholder="Birth place" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  ),
}));

test('submits the birth details once every field is valid', async () => {
  const onSubmit = vi.fn();
  render(<ProfileForm onSubmit={onSubmit} />);

  const submit = screen.getByRole('button', { name: /calculate/i });
  expect((submit as HTMLButtonElement).disabled).toBe(true);

  fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Test' } });
  fireEvent.change(screen.getByPlaceholderText('YYYY-MM-DD'), { target: { value: '2000-01-01' } });
  fireEvent.change(screen.getByPlaceholderText('HH:MM'), { target: { value: '12:00' } });
  fireEvent.change(screen.getByPlaceholderText('Birth place'), { target: { value: 'Delhi' } });

  await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(submit);

  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onSubmit.mock.calls[0][0]).toMatchObject({
    name: 'Test',
    birthDate: '2000-01-01',
    birthTime: '12:00',
    location: 'Delhi',
  });
});

test('shows a format error for a malformed date', async () => {
  render(<ProfileForm onSubmit={vi.fn()} />);
  fireEvent.change(screen.getByPlaceholderText('YYYY-MM-DD'), { target: { value: '01/01/2000' } });
  expect(await screen.findByText('Use YYYY-MM-DD')).toBeDefined();
});
