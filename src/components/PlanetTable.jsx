// src/components/PlanetTable.jsx
import React from 'react';

export default function PlanetTable({ planets }) {
  if (!planets || Object.keys(planets).length === 0) return null;
  return (
    <section className="mb-6">
      <h3>Planetary Positions</h3>
      <table>
        <thead>
          <tr><th>Planet</th><th>Sign</th><th>°</th></tr>
        </thead>
        <tbody>
          {Object.entries(planets).map(([name, info]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{info.sign}</td>
              <td>{info.deg.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
