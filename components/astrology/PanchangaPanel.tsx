import React from 'react';
import { Card } from '../ui';

export interface PanchangaPanelProps {
  panchanga?: {
    vaara?: string;
    tithi?: { name?: string; paksha?: string };
    nakshatra?: { nakshatra?: string; pada?: number };
    yoga?: { name?: string };
    karana?: { name?: string };
  } | null;
}

export default function PanchangaPanel({ panchanga }: PanchangaPanelProps) {
  if (!panchanga) return null;

  const rows = [
    ['Vaara', panchanga.vaara],
    ['Tithi', panchanga.tithi?.name],
    ['Paksha', panchanga.tithi?.paksha],
    ['Nakshatra', panchanga.nakshatra?.nakshatra
      ? `${panchanga.nakshatra.nakshatra}${panchanga.nakshatra.pada ? ` (pada ${panchanga.nakshatra.pada})` : ''}`
      : undefined],
    ['Yoga', panchanga.yoga?.name],
    ['Karana', panchanga.karana?.name],
  ].filter(([, value]) => Boolean(value));

  if (rows.length === 0) return null;

  return (
    <Card variant="glass" className="mb-6">
      <h2 title="Five-limb calendar of the birth moment">Panchanga</h2>
      <p className="help-text">Tithi, vara, nakshatra, yoga and karana at the birth instant.</p>
      {rows.map(([label, value]) => (
        <p key={label}>
          <strong>{label}:</strong> {value}
        </p>
      ))}
    </Card>
  );
}
