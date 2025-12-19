// src/components/HouseAnalysis.jsx
import React from 'react';
import Card from '../ui/Card'

export interface HouseAnalysisProps {
  houses?: Record<string, unknown> | null;
}

// Summarizes how each astrological house influences life areas.

export default function HouseAnalysis({ houses }: HouseAnalysisProps) {
  if (!houses) return null;

  // The backend can return { houses: {...}, placements: {...}, aspects: {...} }
  // We want to extract the main 'houses' dictionary if it exists.
  const housesData = 'houses' in houses ? (houses.houses as Record<string, unknown>) : houses;

  if (!housesData || typeof housesData !== 'object') return null;

  const entries = Object.entries(housesData).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  // Filter out non-numeric keys if any sneak in (like 'metadata'?)
  const validEntries = entries.filter(([key]) => !isNaN(Number(key)));

  if (validEntries.length === 0) return null;

  return (
    <Card variant="glass" className="mb-6">
      <h3 title="How each house shapes your experiences">House Analysis</h3>
      <p className="help-text">Review these notes for insight on different life themes.</p>
      <ul className="space-y-2 mt-4">
        {validEntries.map(([num, value]) => {
          let text;
          if (Array.isArray(value)) {
            text = value.join(', ');
          } else if (typeof value === 'object' && value !== null) {
            // Handle if the house value is itself a complex object (e.g. details)
            // Ideally we just want the summary or simple value
            text = JSON.stringify(value);
            if ('summary' in value) text = (value as any).summary;
            else if ('sign' in value) text = `${(value as any).sign} (${(value as any).degree?.toFixed(1) || ''}°)`;
            else text = 'details...';
          } else {
            text = String(value ?? '');
          }

          return (
            <li key={num} className="text-sm">
              <span className="font-semibold text-accent-light">House {num}:</span> <span className="text-white/80">{text || '—'}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
