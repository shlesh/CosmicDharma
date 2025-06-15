// src/components/DashaTable.jsx
import React from 'react';

export default function DashaTable({ dasha }) {
  if (!Array.isArray(dasha) || dasha.length === 0) return null;
  return (
    <section className="mb-6">
      <h3>Vimshottari Mahādasha</h3>
      <table>
        <thead>
          <tr>
            <th>Lord</th><th>Start (JD)</th><th>End (JD)</th><th>Years</th>
          </tr>
        </thead>
        <tbody>
          {dasha.map(({ lord, start_jd, end_jd, remaining_years }) => (
            <tr key={lord}>
              <td>{lord}</td>
              <td>{start_jd.toFixed(2)}</td>
              <td>{end_jd.toFixed(2)}</td>
              <td>{remaining_years.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
