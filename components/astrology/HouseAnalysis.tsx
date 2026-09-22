import React from 'react';
import Card from '../ui/Card'

export interface HouseAnalysisProps {
  houses?: Record<string, unknown> | null;
}

export default function HouseAnalysis({ houses }: HouseAnalysisProps) {
  if (!houses) return null;

  const housesData =
    'houses' in houses && houses.houses
      ? (houses.houses as Record<string, any>)
      : (houses as Record<string, any>);

  if (!housesData || typeof housesData !== 'object') return null;

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
          const isRich = typeof value === 'object' && value !== null && 'sign' in value;
          let signName = '—';
          let summaryText = '';
          if (isRich) {
            signName = value.sign || '—';
            summaryText = value.summary || `${signName}.`;
          } else if (Array.isArray(value)) {
            summaryText = value.join(', ') || 'Empty';
          } else {
            summaryText = String(value);
          }
          return (
            <div key={num} className="bg-gray-50 dark:bg-white/5 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-transparent">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-purple-600 dark:text-purple-400">House {num}</span>
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{signName}</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{summaryText}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
