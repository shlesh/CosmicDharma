import React, { useState, useEffect } from 'react';
import useFormFields from './hooks/useFormFields';
import './App.css';
import ProfileForm from './components/ProfileForm';
import BasicInfo from './components/BasicInfo';
import ProfileSummary from './components/ProfileSummary';
import CoreElements from './components/CoreElements';
import PlanetTable from './components/PlanetTable';
import DashaTable from './components/DashaTable';
import DashaChart from './components/DashaChart';
import HouseAnalysis from './components/HouseAnalysis';
import { generatePdf } from './pdf';

function App() {
  // Load & persist form state in localStorage
  const [form, handleChange, setForm] = useFormFields({
    name: '',
    birthDate: '',
    birthTime: '',
    location: '',
  });

  useEffect(() => {
    // On mount, load saved values
    try {
      const saved = JSON.parse(localStorage.getItem('vedicForm') || '{}');
      if (Object.keys(saved).length) {
        setForm(prev => ({ ...prev, ...saved }));
      }
    } catch {
      // ignore
    }
  }, [setForm]);

  useEffect(() => {
    // Load ads after mount
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Adsense error', err);
    }
  }, []);

  useEffect(() => {
    // Persist form values
    localStorage.setItem('vedicForm', JSON.stringify(form));
  }, [form]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [jobId, setJobId] = useState(null);

  const { name, birthDate, birthTime, location } = form;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting profile', { birthDate, birthTime, location });
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/profile/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: birthDate, time: birthTime, location }),
      });

      console.log('Response status', res.status);

      const text = await res.text();
      let payload;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        payload = text;
      }

      console.log('Response payload', payload);

      if (!res.ok) {
        console.error('Server returned error', res.status, payload);
        if (
          payload &&
          typeof payload === 'object' &&
          Array.isArray(payload.detail)
        ) {
          setError(
            payload.detail
              .map(err => `${err.loc.join('.')}: ${err.msg}`)
              .join('\n')
          );
        } else if (payload && typeof payload === 'object' && payload.detail) {
          setError(payload.detail);
        } else if (typeof payload === 'string') {
          setError(payload || res.statusText);
        } else if (
          payload &&
          typeof payload === 'object' &&
          Object.keys(payload).length === 0
        ) {
          setError(res.statusText || 'Unknown error');
        } else {
          setError(JSON.stringify(payload, null, 2));
        }
        setProfile(null);
      } else {
        if (payload && typeof payload === 'object' && payload.job_id) {
          setJobId(payload.job_id);
        } else {
          console.error('Invalid server response', payload);
          setError('Invalid server response');
        }
      }
    } catch (err) {
      console.error('Request failed', err);
      setError(err.message);
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`);
        const data = await res.json();
        if (data.status === 'complete') {
          setProfile({ ...data.result, request: form });
          setJobId(null);
          setLoading(false);
        } else if (data.status === 'error') {
          setError(data.error || 'Job failed');
          setJobId(null);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setJobId(null);
        setLoading(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [jobId, API_BASE, form]);

  return (
    <div className="page-wrapper">
      <aside className="ad-slot left-ad">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-8703960708388611"
          data-ad-slot="LEFT_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </aside>

      <div className="glass-container">
        <h1>🕉️ Complete Vedic Astrological Profile</h1>
        <p className="help-text">Enter your birth information below to reveal detailed astrological insights.</p>

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
          <CoreElements
            analysis={profile.analysis}
            elements={profile.coreElements}
          />
          <PlanetTable planets={profile.planetaryPositions} />
          <HouseAnalysis houses={profile.analysis?.houses || profile.houses} />
          <DashaTable dasha={profile.vimshottariDasha} />
          <DashaChart
            dasha={profile.vimshottariDasha}
            analysis={profile.analysis && profile.analysis.vimshottariDasha}
          />
          <button
            type="button"
            onClick={() => {
              const doc = generatePdf(profile);
              doc.save('natal-chart.pdf');
            }}
            className="glass-button"
          >
            Download PDF
          </button>
        </section>
      )}
      </div>

      <aside className="ad-slot right-ad">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-8703960708388611"
          data-ad-slot="RIGHT_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </aside>
    </div>
  );
}

export default App;
