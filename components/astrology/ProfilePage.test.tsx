import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import ProfilePage from '@/pages/profile';

// The page is a thin view over useProfileJob; drive it through the hook's states.
const hookState: Record<string, any> = {};
vi.mock('@/hooks/useProfileJob', () => ({ useProfileJob: () => hookState }));
vi.mock('@/components/astrology/LocationAutocomplete', () => ({ default: () => <input placeholder="Birth place" /> }));

beforeEach(() => {
  for (const k of Object.keys(hookState)) delete hookState[k];
  Object.assign(hookState, { startJob: vi.fn(), starting: false, startError: null, job: null, progress: 0 });
});

test('shows only the form before a chart is requested', () => {
  render(<ProfilePage />);
  expect(screen.getByRole('button', { name: /calculate/i })).toBeDefined();
  expect(screen.queryByTestId('profile-skeleton')).toBeNull();
});

test('shows progress and a skeleton while the job runs', () => {
  Object.assign(hookState, { job: { status: 'running', progress: 50 }, progress: 50 });
  render(<ProfilePage />);
  expect(screen.getByTestId('profile-skeleton')).toBeDefined();
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
});

test('shows the job error when the calculation fails', () => {
  Object.assign(hookState, { job: { status: 'error', error: 'Could not resolve location' } });
  render(<ProfilePage />);
  expect(screen.getAllByText('Could not resolve location').length).toBeGreaterThan(0);
  expect(screen.queryByTestId('profile-skeleton')).toBeNull();
});

test('renders the chart sections when the job completes', () => {
  Object.assign(hookState, {
    job: {
      status: 'complete',
      result: {
        birthInfo: { date: '2000-01-01', time: '12:00', location: 'Delhi', latitude: 28.6, longitude: 77.2, timezone: 'Asia/Kolkata' },
        planetaryPositions: [],
        coreElements: {},
        houses: {},
        divisionalCharts: {},
        vimshottariDasha: [],
      },
    },
  });
  render(<ProfilePage />);
  expect(screen.getByText('Delhi')).toBeDefined();
  expect(screen.queryByTestId('profile-skeleton')).toBeNull();
});
