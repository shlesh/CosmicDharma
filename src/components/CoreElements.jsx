import React from 'react';

export default function CoreElements({ analysis, elements }) {
  const data =
    (analysis && (analysis.coreElements || analysis.core_elements)) ||
    elements;

  if (!data || typeof data !== 'object') return null;

  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const formatPercent = val => {
    if (typeof val === 'number') return val.toString();
    const m = String(val).match(/([0-9]+(?:\.[0-9]+)?)/);
    return m ? m[1] : String(val);
  };

  return (
    <section className="mb-6">
      <h3>Core Elements</h3>
      <ul>
        {entries.map(([elem, val]) => (
          <li key={elem}>
            <strong>{elem}:</strong> {formatPercent(val)}%
          </li>
        ))}
      </ul>
    </section>
  );
}
