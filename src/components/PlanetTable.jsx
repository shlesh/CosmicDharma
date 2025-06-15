// src/components/PlanetTable.jsx
import React from 'react';

export default function PlanetTable({ planets }) {
  if (!Array.isArray(planets) || planets.length === 0) return null;
  return (
    <section className="mb-6">
      <h3>Planetary Positions</h3>
      <table>
        <thead>
          <tr>
            <th>Planet</th>
            <th>Sign</th>
            <th>°</th>
          </tr>
        </thead>
        <tbody>
          {planets.map(p => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{p.sign}</td>
              <td>{p.degree.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
