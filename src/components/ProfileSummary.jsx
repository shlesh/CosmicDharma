// src/components/ProfileSummary.jsx
import React from 'react';

export default function ProfileSummary({ analysis }) {
  if (!analysis) return null;
  const nak = analysis.nakshatra;
  return (
    <section className="mb-6">
      <h2>Profile Highlights</h2>
      {nak && (
        <p>
          <strong>Nakshatra:</strong> {nak.nakshatra} (Pada {nak.pada}) – {nak.description}
        </p>
      )}
    </section>
  );
}
