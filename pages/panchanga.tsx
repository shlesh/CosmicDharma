import { useState } from 'react';
import { fetchJson } from '../util/api';

interface PanchangaData {
  tithi?: { name: string };
  nakshatra?: { nakshatra: string };
  yoga?: { name: string };
  karana?: { name: string };
  vaara?: string;
}

export default function PanchangaPage() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [data, setData] = useState<PanchangaData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetchJson<{ panchanga: PanchangaData }>('/panchanga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, location })
      });
      setData(res.panchanga);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="page-wrapper">
      <h1>Daily Panchanga</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <label>
          Date:
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="glass-input" />
        </label>
        <label>
          Time:
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="glass-input" />
        </label>
        <label>
          Location:
          <input value={location} onChange={e => setLocation(e.target.value)} required className="glass-input" />
        </label>
        <button type="submit" className="glass-button">Fetch</button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {data && (
        <section className="space-y-1">
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
