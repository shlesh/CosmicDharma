// src/components/DashaTable.jsx
import React from 'react';

export default function DashaTable({ dasha, analysis }) {
  if (!Array.isArray(dasha) || dasha.length === 0) return null;
  return (
    <section className="mb-6">
      <h3>Vimshottari Mahādasha</h3>
      <table>
        <thead>
          <tr>
            <th>Lord</th>
            <th>Start</th>
            <th>End</th>
            {analysis && <th>Description</th>}
          </tr>
        </thead>
        <tbody>
          {dasha.map(({ lord, start, end }, idx) => {
            const desc =
              Array.isArray(analysis) && analysis[idx]
                ? analysis[idx].description
                : null;
            return (
              <tr key={`${lord}-${start}`}>
                <td>{lord}</td>
                <td>{start}</td>
                <td>{end}</td>
                {analysis && <td>{desc}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
