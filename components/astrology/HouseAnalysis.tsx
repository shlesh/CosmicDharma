import React from 'react';
import Card from '../ui/Card';

export interface HouseAnalysisProps {
  houses?: Record<string, unknown> | null;
}

type HouseRow = {
  num: number;
  sign?: string;
  lord?: string;
  bhava?: string;
  topic?: string;
  occupants: string[];
  notes: string[];
  summary: string;
};

const BHAVA_FALLBACK: Record<number, [string, string]> = {
  1: ['Tanu', 'Body and first impression'],
  2: ['Dhana', 'Speech, family, stored wealth'],
  3: ['Sahaja', 'Courage, siblings, short journeys'],
  4: ['Sukha', 'Home, mother, inner peace'],
  5: ['Putra', 'Intelligence, children, poorva-punya'],
  6: ['Ari', 'Debt, disease, daily labour'],
  7: ['Kalatra', 'Spouse, contracts, the other'],
  8: ['Ayu', 'Longevity, research, sudden change'],
  9: ['Dharma', 'Guru, father, fortune'],
  10: ['Karma', 'Work, status, public deed'],
  11: ['Labha', 'Gains, friends, elder allies'],
  12: ['Vyaya', 'Loss, exile, the far shore'],
};

function unwrapHouses(houses: Record<string, any>): Record<string, any> {
  if (houses && typeof houses === 'object' && houses.houses && typeof houses.houses === 'object') {
    return houses.houses as Record<string, any>;
  }
  return houses;
}

function toRow(num: number, value: unknown): HouseRow {
  const [bhava, topic] = BHAVA_FALLBACK[num] || ['Bhava', ''];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const row = value as Record<string, any>;
    const occupants = Array.isArray(row.occupants) ? row.occupants.map(String) : [];
    const notes = Array.isArray(row.notes) ? row.notes.map(String) : [];
    return {
      num,
      sign: row.sign,
      lord: row.lord,
      bhava: row.bhava || bhava,
      topic: row.topic || topic,
      occupants,
      notes,
      summary: String(row.summary || ''),
    };
  }
  if (Array.isArray(value)) {
    return {
      num,
      bhava,
      topic,
      occupants: value.map(String),
      notes: [],
      summary: value.join(', ') || 'Empty',
    };
  }
  return {
    num,
    bhava,
    topic,
    occupants: [],
    notes: [],
    summary: String(value ?? ''),
  };
}

export default function HouseAnalysis({ houses }: HouseAnalysisProps) {
  if (!houses) return null;
  const housesData = unwrapHouses(houses as Record<string, any>);
  if (!housesData || typeof housesData !== 'object') return null;

  const rows = Object.entries(housesData)
    .filter(([key]) => !Number.isNaN(Number(key)))
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([key, value]) => toRow(Number(key), value));

  if (rows.length === 0) return null;

  return (
    <Card variant="glass" className="mb-6">
      <h3 className="font-display text-amber-50">Houses</h3>
      <p className="help-text mb-4">
        Whole-sign bhavas from Lagna. An empty house is not mute; its lord still acts.
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
        {rows.map((row) => (
          <div
            key={`map-${row.num}`}
            className={`rounded-lg border px-2 py-2 text-center ${
              row.occupants.length
                ? 'border-amber-200/40 bg-amber-200/10'
                : 'border-white/10 bg-black/20'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wide text-amber-50/60">{row.num}</div>
            <div className="text-sm text-amber-50">{row.sign || '—'}</div>
            <div className="text-[10px] text-amber-50/70 truncate">
              {row.occupants.length ? row.occupants.join(' · ') : 'lord only'}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <article
            key={row.num}
            className="rounded-xl border border-amber-200/15 bg-black/20 p-4"
          >
            <header className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h4 className="text-amber-50 font-display text-lg m-0">
                House {row.num}
                <span className="text-amber-50/70 font-normal"> · {row.bhava}</span>
              </h4>
              <p className="text-sm text-amber-100/80 m-0">
                {row.sign ? `${row.sign}` : ''}
                {row.lord ? ` · lord ${row.lord}` : ''}
              </p>
            </header>
            {row.topic ? <p className="help-text mb-2">{row.topic}</p> : null}
            {row.occupants.length > 0 ? (
              <p className="text-sm text-amber-50/90 mb-2">
                Sits here: {row.occupants.join(', ')}
              </p>
            ) : (
              <p className="text-sm text-amber-50/60 mb-2">No graha in this sign.</p>
            )}
            {row.notes.length > 0 ? (
              <ul className="help-text list-disc pl-5 space-y-1">
                {row.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : row.summary && !row.sign ? (
              <p className="text-sm text-amber-50/80">House {row.num}: {row.summary}</p>
            ) : null}
          </article>
        ))}
      </div>
    </Card>
  );
}
