// src/components/ProfileSummary.jsx
import React from 'react';

export interface ProfileSummaryProps {
  analysis?: { nakshatra?: { nakshatra: string; pada: number; description: string } } | null;
}

// Presents key insights from the analysis at a glance.

export default function ProfileSummary({ analysis }: ProfileSummaryProps) {
  if (!analysis) return null;
  const nak = analysis.nakshatra;
  return (
    <section className="mb-6">
      <h2 title="Key takeaways from your chart">Profile Highlights</h2>
      <p className="help-text">A snapshot of the most impactful factors.</p>
      {nak && (
        <p>
          <strong>Nakshatra:</strong> {nak.nakshatra} (Pada {nak.pada}) – {nak.description}
        </p>
      )}
    </section>
  );
}
