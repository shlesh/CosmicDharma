import { useState, useEffect } from 'react';
import ProfileForm from '../components/ProfileForm';
import BasicInfo from '../components/BasicInfo';
import ProfileSummary from '../components/ProfileSummary';
import CoreElements from '../components/CoreElements';
import PlanetTable from '../components/PlanetTable';
import HouseAnalysis from '../components/HouseAnalysis';
import DashaTable from '../components/DashaTable';
import DashaChart from '../components/DashaChart';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function HomePage() {
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [jobId, setJobId] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/profile/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.birthDate,
          time: form.birthTime,
          location: form.location,
        }),
      });
      const data = await res.json();
      if (res.ok && data.job_id) {
        setJobId(data.job_id);
      } else {
        setError(data.detail || 'Server error');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    const id = setInterval(async () => {
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
    return () => clearInterval(id);
  }, [jobId, form]);

  return (
    <main className="page-wrapper">
      <h1>Next.js Prototype</h1>
      <ProfileForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={loading} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {profile && (
        <section>
          <BasicInfo birth={{ ...profile.birthInfo, ...form }} />
          <ProfileSummary analysis={profile.analysis} />
          <CoreElements analysis={profile.analysis} elements={profile.coreElements} />
          <PlanetTable planets={profile.planetaryPositions} />
          <HouseAnalysis houses={profile.analysis?.houses || profile.houses} />
          <DashaTable dasha={profile.vimshottariDasha} />
          <DashaChart dasha={profile.vimshottariDasha} analysis={profile.analysis?.vimshottariDasha} />
        </section>
      )}
    </main>
  );
}
