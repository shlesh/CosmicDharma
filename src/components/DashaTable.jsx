// src/components/DashaTable.jsx
import React from 'react';
import PropTypes from 'prop-types';

// Tabular listing of each planetary period with start and end dates.

export default function DashaTable({ dasha }) {
  if (!Array.isArray(dasha) || dasha.length === 0) return null;
  return (
    <section className="mb-6">
      <h3 title="Detailed listing of your planetary periods">Vimshottari Mahādasha</h3>
      <p className="help-text">This table helps you track when each period begins and ends.</p>
      <table>
        <thead>
          <tr>
            <th>Lord</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {dasha.map(({ lord, start, end }) => (
            <tr key={`${lord}-${start}`}>
              <td>{lord}</td>
              <td>{start}</td>
              <td>{end}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

DashaTable.propTypes = {
  dasha: PropTypes.arrayOf(
    PropTypes.shape({
      lord: PropTypes.string.isRequired,
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
    })
  ),
};
