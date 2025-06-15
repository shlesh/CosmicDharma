// src/App.jsx
import { useState } from 'react';
import ProfileForm from './components/ProfileForm';
import BasicInfo from './components/BasicInfo';
import ProfileSummary from './components/ProfileSummary';
import PlanetTable from './components/PlanetTable';
import DashaTable from './components/DashaTable';
import HouseAnalysis from './components/HouseAnalysis';

export default function App() {
  const [form, setForm] = useState({
    name: "Shailesh Tiwari",
    dob:  "2001-06-23",
    tob:  "04:26",
    pob:  "Renukoot, Sonebhadra",
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch('/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Server error');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Complete Vedic Astrological Profile</h1>
      <ProfileForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={loading} />
      {error && <p className="text-red-600">Error: {error}</p>}
      {data && (
        <>
          <BasicInfo birth={data.birth_info} />
          <ProfileSummary data={data} />
          <PlanetTable planets={data.planets} />
          <HouseAnalysis houses={data.houses.cusps ? data.houses : null} />
          <DashaTable dasha={data.dasha} />
        </>
      )}
    </div>
);
}
