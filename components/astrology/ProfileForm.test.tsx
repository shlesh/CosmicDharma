import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ProfileForm from './ProfileForm';

// The real autocomplete hits a geocoding API; a plain input is enough here.
vi.mock('./LocationAutocomplete', () => ({
  default: ({ value, onChange, onSelect, id }: any) => (
    <>
      <input id={id} placeholder="Birth place" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => onSelect({ label: 'Springfield, Illinois', lat: 39.78, lon: -89.65 })}>
        pick Springfield
      </button>
    </>
  ),
}));

function fillDateTime(date = '2000-01-01', time = '12:00') {
  fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: date } });
  fireEvent.change(screen.getByLabelText('Time of birth'), { target: { value: time } });
}
const submit = () => fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

test('sends the coordinates of the picked place', async () => {
  const onSubmit = vi.fn();
  render(<ProfileForm onSubmit={onSubmit} />);
  fillDateTime();
  fireEvent.click(screen.getByRole('button', { name: 'pick Springfield' }));
  submit();
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  expect(onSubmit.mock.calls[0][0]).toMatchObject({ location: 'Springfield, Illinois', lat: 39.78, lon: -89.65 });
});

test('drops the picked coordinates once the place text is edited', async () => {
  const onSubmit = vi.fn();
  render(<ProfileForm onSubmit={onSubmit} />);
  fillDateTime();
  fireEvent.click(screen.getByRole('button', { name: 'pick Springfield' }));
  fireEvent.change(screen.getByPlaceholderText('Birth place'), { target: { value: 'Springfield, Oregon' } });
  submit();
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  const payload = onSubmit.mock.calls[0][0];
  expect(payload.location).toBe('Springfield, Oregon');
  expect(payload.lat).toBeUndefined();
  expect(payload.lon).toBeUndefined();
});

test('submits the birth details, leaving the default options to the API', async () => {
  const onSubmit = vi.fn();
  render(<ProfileForm onSubmit={onSubmit} />);
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Test' } });
  fillDateTime();
  fireEvent.change(screen.getByPlaceholderText('Birth place'), { target: { value: 'Delhi' } });
  submit();
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  const payload = onSubmit.mock.calls[0][0];
  expect(payload).toMatchObject({ name: 'Test', birthDate: '2000-01-01', birthTime: '12:00', location: 'Delhi' });
  expect(payload).not.toHaveProperty('ayanamsa');
  expect(payload).not.toHaveProperty('houseSystem');
});

test('sends a non-default ayanamsa from the advanced options', async () => {
  const onSubmit = vi.fn();
  render(<ProfileForm onSubmit={onSubmit} />);
  fillDateTime();
  fireEvent.change(screen.getByPlaceholderText('Birth place'), { target: { value: 'Delhi' } });
  fireEvent.click(screen.getByRole('button', { name: /advanced options/i }));
  fireEvent.change(await screen.findByLabelText('Ayanamsa'), { target: { value: 'lahiri' } });
  submit();
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  expect(onSubmit.mock.calls[0][0].ayanamsa).toBe('lahiri');
});

test('does not submit an incomplete form, and says what is missing', async () => {
  const onSubmit = vi.fn();
  render(<ProfileForm onSubmit={onSubmit} />);
  submit();
  expect(await screen.findByText('Enter your date of birth')).toBeDefined();
  expect(screen.getByText('Enter your time of birth')).toBeDefined();
  expect(screen.getByText('Enter your place of birth')).toBeDefined();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('refuses a birth date in the future', async () => {
  render(<ProfileForm onSubmit={vi.fn()} />);
  fillDateTime(`${new Date().getFullYear() + 1}-01-01`);
  fireEvent.change(screen.getByPlaceholderText('Birth place'), { target: { value: 'Delhi' } });
  submit();
  expect(await screen.findByText('The date can’t be in the future')).toBeDefined();
});

test('every field is reachable by its label (screen readers)', () => {
  render(<ProfileForm onSubmit={vi.fn()} />);
  for (const label of [/^Name/, 'Date of birth', 'Time of birth', /^Place of birth/]) {
    expect(screen.getByLabelText(label).tagName).toBe('INPUT');
  }
});

test('a field error is announced on the field itself', async () => {
  render(<ProfileForm onSubmit={vi.fn()} />);
  submit();
  await screen.findByText('Enter your date of birth');
  const date = screen.getByLabelText('Date of birth');
  expect(date.getAttribute('aria-invalid')).toBe('true');
  const describedBy = date.getAttribute('aria-describedby')!.split(' ');
  expect(describedBy.map((id) => document.getElementById(id)?.textContent).join(' ')).toContain('Enter your date of birth');
});
