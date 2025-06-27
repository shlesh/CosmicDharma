import React from 'react';

export interface CoreElementsProps {
  analysis?: Record<string, unknown> | null;
  elements?: Record<string, unknown> | null;
}

// Shows the balance of the five classical elements based on the user's chart.

export default function CoreElements({ analysis, elements }: CoreElementsProps) {
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
      <h3 title="Distribution of Fire, Earth, Air, Water and Space in your chart">Core Elements</h3>
      <p className="help-text">These percentages indicate your dominant energies.</p>
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
