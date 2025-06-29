// src/components/DashaTable.jsx
import React from 'react';
import Card from './ui/Card';

export interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
}

export interface DashaTableProps {
  dasha?: DashaPeriod[];
}

// Tabular listing of each planetary period with start and end dates.

export default function DashaTable({ dasha }: DashaTableProps) {
  if (!Array.isArray(dasha) || dasha.length === 0) return null;
  return (
    <Card variant="glass" className="mb-6">
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
    </Card>
  );
}
