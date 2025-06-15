// src/components/ProfileSummary.jsx
import React from 'react';

export default function ProfileSummary({ data }) {
  if (!data) return null;
  return (
    <section className="mb-6">
      <h2>Core Profile</h2>
      <ul>
        <li><strong>Lagna (Ascendant):</strong> {data.lagna.name}</li>
        <li><strong>Moon Sign:</strong> {data.moon_sign.name}</li>
        <li><strong>Nakshatra:</strong> {data.nakshatra.name} (Pada {data.pada})</li>
      </ul>
    </section>
  );
}
