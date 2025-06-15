// src/components/HouseAnalysis.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function HouseAnalysis({ houses }) {
  if (!houses) return null;

  const entries = Object.entries(houses).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <section className="mb-6">
      <h3>House Analysis</h3>
      <ul>
        {entries.map(([num, plist]) => {
          const list = Array.isArray(plist) ? plist.join(', ') : String(plist ?? '');
          return (
            <li key={num}>
              <strong>House {num}:</strong> {list || '—'}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

HouseAnalysis.propTypes = {
  houses: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.array),
    PropTypes.arrayOf(PropTypes.array),
  ]),
};
