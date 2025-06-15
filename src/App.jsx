import React, { useState, useEffect } from 'react';

function App() {
  // Load & persist form state in localStorage
  const [name, setName]           = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [location, setLocation]   = useState('');

  useEffect(() => {
    // On mount, load saved values
    try {
      const saved = JSON.parse(localStorage.getItem('vedicForm') || '{}');
      if (saved.name) setName(saved.name);
      if (saved.birthDate) setBirthDate(saved.birthDate);
      if (saved.birthTime) setBirthTime(saved.birthTime);
      if (saved.location) setLocation(saved.location);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Persist form values
    const toSave = { name, birthDate, birthTime, location };
    localStorage.setItem('vedicForm', JSON.stringify(toSave));
  }, [name, birthDate, birthTime, location]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [profile, setProfile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: birthDate, time: birthTime, location }),
      });
      const payload = await res.json();

      if (!res.ok) {
        if (Array.isArray(payload.detail)) {
          setError(
            payload.detail
              .map(err => `${err.loc.join('.')}: ${err.msg}`)
              .join('\n')
          );
        } else {
          setError(payload.detail || JSON.stringify(payload, null, 2));
        }
        setProfile(null);
      } else {
        setProfile(payload);
      }
    } catch (err) {
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>Complete Vedic Astrological Profile</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </label>

        <label>
          Date of Birth:
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            required
          />
        </label>

        <label>
          Time of Birth:
          <input
            type="time"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            placeholder="HH:MM"
            required
          />
        </label>

        <label>
          Place of Birth:
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g., Renukoot, India"
            required
          />
        </label>

        <button type="submit" disabled={loading || !name}>
          {loading ? 'Calculating…' : 'Submit'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', whiteSpace: 'pre-wrap', marginTop: 20 }}>
          <strong>Error:</strong>
          <pre>{error}</pre>
        </div>
      )}

      {profile && (
        <section style={{ marginTop: 20 }}>
          <h2>Profile for {name}</h2>
          <pre style={{ background: '#f5f5f5', padding: 10 }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

export default App;
