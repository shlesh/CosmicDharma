import React from 'react';
import { Card } from '../ui';

export interface YugaPanelProps {
  yuga?: {
    display?: string;
    name?: string;
    arc?: string;
    dharma?: string;
    quality?: string;
    years_into?: number;
    years_remaining?: number;
    in_sandhi?: boolean;
    sandhi?: string | null;
    next_yuga?: string;
    next_year?: number;
    source?: string;
    note?: string;
  } | null;
  lineage?: {
    frame?: string;
    source?: string;
    note?: string;
  } | null;
}

export default function YugaPanel({ yuga, lineage }: YugaPanelProps) {
  if (!yuga && !lineage) return null;

  return (
    <Card variant="glass" className="mb-6">
      <h2 title="Yuga clock from The Holy Science">Holy Science Frame</h2>
      <p className="help-text">
        Sri Yukteswar&apos;s 24,000-year cycle and Revati ayanamsa.
      </p>
      {yuga?.display && (
        <p>
          <strong>Yuga:</strong> {yuga.display}
        </p>
      )}
      {yuga?.dharma && (
        <p>
          <strong>Dharma:</strong> {yuga.dharma}
        </p>
      )}
      {typeof yuga?.years_remaining === 'number' && (
        <p>
          <strong>Years remaining in this yuga:</strong> {yuga.years_remaining}
          {yuga.next_yuga ? ` → ${yuga.next_yuga} (${yuga.next_year})` : ''}
        </p>
      )}
      {yuga?.in_sandhi && (
        <p>
          <strong>Sandhi:</strong> {yuga.sandhi || 'transition'}
        </p>
      )}
      {yuga?.quality && <p className="help-text mt-2">{yuga.quality}</p>}
      {lineage?.frame && (
        <p className="mt-3">
          <strong>Ayanamsa:</strong> {lineage.frame}
        </p>
      )}
      {(lineage?.source || yuga?.source) && (
        <p className="help-text mt-2">{lineage?.source || yuga?.source}</p>
      )}
      {(lineage?.note || yuga?.note) && (
        <p className="help-text mt-2">{lineage?.note || yuga?.note}</p>
      )}
    </Card>
  );
}
