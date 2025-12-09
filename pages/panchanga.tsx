import { useState } from 'react';
import { panchangaApi, PanchangaResponse } from '@/util/api';

export default function PanchangaPage() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [data, setData] = useState<PanchangaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true); setData(null);
    try {
      const res = await panchangaApi.compute({ date, time, location });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Panchanga');
    } finally { setLoading(false); }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daily Panchanga</h1>
      <form className="grid gap-3 max-w-xl" onSubmit={onSubmit}>
        <input className="border rounded p-2" placeholder="YYYY-MM-DD" value={date} onChange={e=>setDate(e.target.value)} />
        <input className="border rounded p-2" placeholder="HH:MM" value={time} onChange={e=>setTime(e.target.value)} />
        <input className="border rounded p-2" placeholder="City, Country" value={location} onChange={e=>setLocation(e.target.value)} />
        <button className="bg-indigo-600 text-white rounded px-4 py-2" disabled={loading}>{loading? 'Loading…':'Get Panchanga'}</button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}
      {data && (
        <section className="space-y-1 mt-6">
          <p><strong>Vaara:</strong> {data.vaara}</p>
          <p><strong>Tithi:</strong> {data.tithi?.name}</p>
          <p><strong>Nakshatra:</strong> {data.nakshatra?.nakshatra}</p>
          <p><strong>Yoga:</strong> {data.yoga?.name}</p>
          <p><strong>Karana:</strong> {data.karana?.name}</p>
        </section>
      )}
    </main>
  );
}