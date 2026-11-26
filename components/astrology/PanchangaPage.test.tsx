import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import PanchangaPage from '@/pages/panchanga';
import { panchangaApi } from '@/util/api';

vi.mock('@/util/api', () => ({ panchangaApi: { compute: vi.fn(async () => ({ panchanga: {} })) } }));
vi.mock('@/components/astrology/LocationAutocomplete', () => ({
  default: ({ value, onChange, onSelect }: any) => (
    <>
      <input placeholder="Place" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => onSelect({ label: 'Varanasi, India', lat: 25.3176, lon: 82.9739 })}>
        pick Varanasi
      </button>
    </>
  ),
}));

const compute = panchangaApi.compute as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  compute.mockClear();
  localStorage.clear();
});

test('sends the picked place coordinates with the request', async () => {
  render(<PanchangaPage />);
  fireEvent.click(screen.getByRole('button', { name: 'pick Varanasi' }));
  fireEvent.click(screen.getByRole('button', { name: /show panchanga/i }));
  await waitFor(() => expect(compute).toHaveBeenCalled());
  expect(compute.mock.calls[0][0]).toMatchObject({ location: 'Varanasi, India', lat: 25.3176, lon: 82.9739 });
});

test('sends only the label when the place was typed, not picked', async () => {
  render(<PanchangaPage />);
  fireEvent.click(screen.getByRole('button', { name: 'pick Varanasi' }));
  fireEvent.change(screen.getByPlaceholderText('Place'), { target: { value: 'Varanasi, Uttar Pradesh' } });
  fireEvent.click(screen.getByRole('button', { name: /show panchanga/i }));
  await waitFor(() => expect(compute).toHaveBeenCalled());
  const body = compute.mock.calls[0][0];
  expect(body.location).toBe('Varanasi, Uttar Pradesh');
  expect(body).not.toHaveProperty('lat');
});

test('remembers the place and shows today straight away on the next visit', async () => {
  localStorage.setItem('cd-panchanga-place', JSON.stringify({ label: 'Ujjain, India', lat: 23.18, lon: 75.79 }));
  render(<PanchangaPage />);
  await waitFor(() => expect(compute).toHaveBeenCalled());
  expect(compute.mock.calls[0][0]).toMatchObject({ location: 'Ujjain, India', lat: 23.18, lon: 75.79 });
});

test('asks for a place instead of sending an empty request', async () => {
  render(<PanchangaPage />);
  fireEvent.click(screen.getByRole('button', { name: /show panchanga/i }));
  expect((await screen.findByRole('alert')).textContent).toMatch(/enter a place/i);
  expect(compute).not.toHaveBeenCalled();
});
