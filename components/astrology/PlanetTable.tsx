// src/components/PlanetTable.jsx
import React from 'react';
import Card from '../ui/Card'

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
    <Card variant="glass" className="mb-6">
      <h3 title="The sign and degree of each planet at birth">Planetary Positions</h3>
      <p className="help-text">Use these positions to understand planetary influences.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 px-4 font-semibold text-gray-700 dark:text-gray-300">Planet</th>
              <th className="py-2 px-4 font-semibold text-gray-700 dark:text-gray-300">Sign</th>
              <th className="py-2 px-4 font-semibold text-gray-700 dark:text-gray-300">°</th>
            </tr>
          </thead>
          <tbody>
            {planets.map(p => (
              <tr key={p.name} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="py-2 px-4 text-gray-800 dark:text-gray-200">{p.name}</td>
                <td className="py-2 px-4 text-gray-800 dark:text-gray-200">{p.sign}</td>
                <td className="py-2 px-4 text-gray-600 dark:text-gray-400 font-mono text-sm">{p.degree.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
