import { useState } from 'react';
import { panchangaApi, PanchangaResponse } from '@/util/api';
import LocationAutocomplete from '@/components/astrology/LocationAutocomplete';
import type { PlaceSuggestion } from '@/util/geocode';
import PanchangaPanel from '@/components/astrology/PanchangaPanel';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function unwrapPanchanga(res: PanchangaResponse | { panchanga?: PanchangaResponse }): PanchangaResponse {
  if (res && typeof res === 'object' && 'panchanga' in res && res.panchanga) {
    return res.panchanga;
  }
  return res as PanchangaResponse;
}

function normalizeTime(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value;
}

export default function PanchangaPage() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
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
        time: normalizeTime(time),
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
      <h1 className="text-3xl font-bold mb-6">Daily Panchanga</h1>
      <Card className="max-w-xl p-4 md:p-6">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <input
            className="border rounded p-2 bg-transparent"
            placeholder="YYYY-MM-DD"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            className="border rounded p-2 bg-transparent"
            placeholder="HH:MM"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <LocationAutocomplete
            value={location}
            onChange={(v: string) => setLocation(v)}
            onSelect={(it: PlaceSuggestion) => setLocation(it.label)}
          />
          <Button type="submit" disabled={loading || !date || !time || location.trim().length < 3}>
            {loading ? 'Loading…' : 'Get Panchanga'}
          </Button>
        </form>
      </Card>

      {error && <p className="text-red-600 mt-4">{error}</p>}
      {data && (
        <div className="max-w-xl mt-6">
          <PanchangaPanel panchanga={data} />
        </div>
      )}
    </main>
  );
}
