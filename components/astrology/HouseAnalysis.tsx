// src/components/HouseAnalysis.jsx
import React from 'react';
import Card from '../ui/Card'

export interface HouseAnalysisProps {
  houses?: Record<string, unknown> | null;
}

// Summarizes how each astrological house influences life areas.

export default function HouseAnalysis({ houses }: HouseAnalysisProps) {
  if (!houses) return null;

  // The backend now returns { houses: { "1": { ... }, "2": { ... } }, ... }
  // Extract the main 'houses' dictionary
  const housesData = 'houses' in houses && houses.houses ? (houses.houses as Record<string, any>) : (houses as Record<string, any>);

  if (!housesData || typeof housesData !== 'object') return null;

  // Extract entries and ensure they are sorted by house number
  const entries = Object.entries(housesData)
    .filter(([key]) => !isNaN(Number(key)))
    .sort(([a], [b]) => Number(a) - Number(b));

  if (entries.length === 0) return null;

  return (
    <Card variant="glass" className="mb-6">
      <div className="flex justify-between items-baseline mb-4">
        <h3 title="How each house shapes your experiences">House Analysis</h3>
      </div>
      <p className="help-text mb-4">Detailed breakdown of each house's sign and occupants.</p>

      <div className="space-y-3">
        {entries.map(([num, value]) => {
          // New backend structure: value is an object with { sign, lord, occupants, summary, ... }
          // Fallback for old structure: value might be list or string
          const isRich = typeof value === 'object' && value !== null && 'sign' in value;

          let signName = '—';
          let lordName = '';
          let summaryText = '';

          if (isRich) {
            signName = value.sign || '—';
            lordName = value.lord ? `ruled by ${value.lord}` : '';
            // Prefer the summary from backend if available, mostly it will be
            summaryText = value.summary || `${signName}.`;
          } else {
            // Fallback logic for legacy/simple data
            summaryText = String(value);
            if (Array.isArray(value)) summaryText = value.join(', ') || 'Empty';
          }

          return (
            <div key={num} className="bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-accent-light">House {num}</span>
                <span className="text-xs uppercase tracking-wider opacity-70">{signName}</span>
              </div>
              <div className="text-sm text-white/90">
                {summaryText}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
