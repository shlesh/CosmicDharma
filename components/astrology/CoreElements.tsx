import React from 'react';
import Card from '../ui/Card';

export interface CoreElementsProps {
  analysis?: Record<string, unknown> | null;
  elements?: Record<string, unknown> | null;
}

// Shows the balance of the four classical elements based on the user's chart.

export default function CoreElements({ analysis, elements }: CoreElementsProps) {
  const data =
    (analysis && (analysis.coreElements || (analysis as any).core_elements)) ||
    elements;

  if (!data || typeof data !== 'object') return null;

  // Helper to render a distribution section (e.g. Elements or Modalities)
  const renderSection = (title: string, subset: any) => {
    if (!subset || typeof subset !== 'object') return null;
    const entries = Object.entries(subset);
    if (entries.length === 0) return null;

    return (
      <div className="mb-4 last:mb-0">
        <h4 className="font-semibold text-sm uppercase tracking-wider mb-2 opacity-80">{title}</h4>
        <div className="grid grid-cols-2 gap-2">
          {entries.map(([key, val]) => (
            <div key={key} className="flex justify-between items-center bg-white/5 p-2 rounded">
              <span className="capitalize">{key}</span>
              <span className="font-mono">{formatPercent(val)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const formatPercent = (val: any) => {
    if (typeof val === 'number') return Math.round(val).toString();
    const m = String(val).match(/([0-9]+(?:\.[0-9]+)?)/);
    return m ? Math.round(parseFloat(m[1])).toString() : '0';
  };

  // Check if we have the nested structure { elements: {...}, modalities: {...} }
  const hasSubsections = 'elements' in data || 'modalities' in data;

  return (
    <Card variant="glass" className="mb-6">
      <h3 title="Distribution of energy in your chart">Core Elements</h3>
      <p className="help-text mb-4">These percentages indicate your dominant energies.</p>

      {hasSubsections ? (
        <>
          {renderSection('Elements', (data as any).elements)}
          {renderSection('Modalities', (data as any).modalities)}
        </>
      ) : (
        // Fallback for flat structure if ever mistakenly passed
        renderSection('Distribution', data)
      )}
    </Card>
  );
}
