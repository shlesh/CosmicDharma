import type { ProfileResult } from './api';
import type { ChartMeta } from '@/components/astrology/ChartResult';

// The last chart is kept in this browser so it survives a reload and shows on the dashboard.
const KEY = 'cosmic_dharma_chart';
const LEGACY_KEY = 'cosmic_dharma_profile'; // older builds stored the bare result here

export interface SavedChart {
  result: ProfileResult;
  meta?: ChartMeta;
  savedAt: string;
}

export function loadChart(): SavedChart | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as SavedChart;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return { result: JSON.parse(legacy), savedAt: new Date().toISOString() };
  } catch { /* corrupt or unavailable storage */ }
  return null;
}

export function saveChart(result: ProfileResult, meta?: ChartMeta) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ result, meta, savedAt: new Date().toISOString() }));
    localStorage.removeItem(LEGACY_KEY);
  } catch { /* quota or private mode: the chart still shows, it just isn't kept */ }
}

export function clearChart() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch { /* ignore */ }
}
