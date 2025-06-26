// src/components/HouseAnalysis.jsx
import React from 'react';

export interface HouseAnalysisProps {
  houses?: Record<string, unknown> | null;
}

// Summarizes how each astrological house influences life areas.

export default function HouseAnalysis({ houses }: HouseAnalysisProps) {
  if (!houses) return null;

  const entries = Object.entries(houses).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <section className="mb-6">
      <h3 title="How each house shapes your experiences">House Analysis</h3>
      <p className="help-text">Review these notes for insight on different life themes.</p>
      <ul>
        {entries.map(([num, value]) => {
          let text;
          if (Array.isArray(value)) {
            text = value.join(', ');
          } else if (typeof value === 'string') {
            text = value;
          } else {
            text = String(value ?? '');
          }
          return (
            <li key={num}>
              <strong>House {num}:</strong> {text || '—'}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
