import { useState } from 'react';
import { panchangaApi, PanchangaResponse } from '@/util/api';
import LocationAutocomplete from '@/components/astrology/LocationAutocomplete';
import type { PlaceSuggestion } from '@/util/geocode';
import PanchangaPanel from '@/components/astrology/PanchangaPanel';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function unwrapPanchanga(res: PanchangaResponse | { panchanga?: PanchangaResponse }): PanchangaResponse {
  const nested = res && typeof res === 'object' && 'panchanga' in res ? res.panchanga : undefined;
  const top = res as PanchangaResponse;
  return {
    ...top,
    ...(nested || {}),
  };
}

function toApiTime(value: string): string {
  if (!value) return '12:00';
  const parts = value.split(':');
  const hh = (parts[0] || '12').padStart(2, '0');
  const mm = (parts[1] || '00').padStart(2, '0');
  return `${hh}:${mm}`;
}

function localToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function localNowTime(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function PanchangaPage() {
  const [date, setDate] = useState(localToday);
  const [time, setTime] = useState(localNowTime);
  const [location, setLocation] = useState('');
  const [data, setData] = useState<PanchangaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const res = await panchangaApi.compute({
        date,
        time: toApiTime(time),
        location,
      });
      setData(unwrapPanchanga(res as PanchangaResponse));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Panchanga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Daily Panchanga</h1>
      <p className="help-text mb-6 max-w-xl">
        Five-limb calendar for a chosen date, time and place in the Yukteswar / Revati frame.
        This is weather for the day, not a natal reading.
      </p>
      <Card className="max-w-xl p-4 md:p-6">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="text-sm font-medium">Date
            <input
              type="date"
              className="border rounded p-2 bg-transparent w-full mt-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium">Time
            <input
              type="time"
              className="border rounded p-2 bg-transparent w-full mt-1"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium">Place
            <div className="mt-1">
              <LocationAutocomplete
                value={location}
                onChange={(v: string) => setLocation(v)}
                onSelect={(it: PlaceSuggestion) => setLocation(it.label)}
              />
            </div>
          </label>
          <Button type="submit" disabled={loading || !date || !time || location.trim().length < 3}>
            {loading ? 'Loading…' : 'Get Panchanga'}
          </Button>
        </form>
      </Card>

      {error && <p className="text-red-600 mt-4">{error}</p>}
      {data && (
        <div className="max-w-xl mt-6">
          <PanchangaPanel panchanga={data} context="daily" />
        </div>
      )}
    </main>
  );
}
