import React from 'react';

export default function DivisionalSummary({ charts }) {
  if (!charts) return null;
  const entries = Object.entries(charts);
  return (
    <section className="mb-6">
      <h3>Divisional Chart Summary</h3>
      <ul>
        {entries.map(([name, info]) => (
          <li key={name}>
            <strong>{name}:</strong> {info.interpretation}{' '}
            {info.navamsaStrength && (
              <em>
                Vargottama: {Object.keys(info.navamsaStrength).join(', ')}
              </em>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
