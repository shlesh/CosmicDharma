// src/components/HouseAnalysis.jsx
import React from 'react';

export default function HouseAnalysis({ houses }) {
  if (!houses) return null;
  return (
    <section className="mb-6">
      <h3>House Analysis</h3>
      <ul>
        {Object.entries(houses).map(([num, plist]) => (
          <li key={num}>
            <strong>House {num}:</strong> {plist.join(', ') || '—'}
          </li>
        ))}
      </ul>
    </section>
  );
}
