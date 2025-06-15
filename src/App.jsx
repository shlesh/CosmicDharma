import React, { useState, useEffect } from 'react';
import './App.css';
import ProfileForm from './components/ProfileForm';
import BasicInfo from './components/BasicInfo';
import ProfileSummary from './components/ProfileSummary';
import PlanetTable from './components/PlanetTable';
import DashaTable from './components/DashaTable';
import HouseAnalysis from './components/HouseAnalysis';

function App() {
  // Load & persist form state in localStorage
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [location, setLocation] = useState('');

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
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const form = { name, birthDate, birthTime, location };

  const handleChange = (e) => {
    const { name: field, value } = e.target;
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'birthDate':
        setBirthDate(value);
        break;
      case 'birthTime':
        setBirthTime(value);
        break;
      case 'location':
        setLocation(value);
        break;
      default:
        break;
    }
  };

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
        setProfile({ ...payload, request: form });
      }
    } catch (err) {
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-container">
      <h1>🕉️ Complete Vedic Astrological Profile</h1>

      <ProfileForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {error && (
        <div style={{ color: 'red', whiteSpace: 'pre-wrap', marginTop: 20 }}>
          <strong>Error:</strong>
          <pre>{error}</pre>
        </div>
      )}

      {profile && (
        <section style={{ marginTop: 20 }}>
          <h2>Profile for {name}</h2>
          <BasicInfo
            birth={{
              ...profile.birthInfo,
              date: birthDate,
              time: birthTime,
              location,
            }}
          />
          <ProfileSummary analysis={profile.analysis} />
          <PlanetTable planets={profile.planetaryPositions} />
          <HouseAnalysis houses={profile.houses} />
          <DashaTable dasha={profile.vimshottariDasha} />
        </section>
      )}
    </div>
  );
}

export default App;
