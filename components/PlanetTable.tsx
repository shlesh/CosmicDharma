// src/components/PlanetTable.jsx
import React from 'react';

export interface PlanetData {
  name: string;
  sign: string;
  degree: number;
}

export interface PlanetTableProps {
  planets?: PlanetData[];
}

// Lists where each planet sits in the zodiac at your time of birth.

export default function PlanetTable({ planets }: PlanetTableProps) {
  if (!Array.isArray(planets) || planets.length === 0) return null;
  return (
    <section className="mb-6">
      <h3 title="The sign and degree of each planet at birth">Planetary Positions</h3>
      <p className="help-text">Use these positions to understand planetary influences.</p>
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
