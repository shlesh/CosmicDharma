import React from 'react';
import { motion } from 'framer-motion';
import Card, { CardHeader } from '@/components/ui/Card';
import { planetInfo } from '@/util/astro';
import { cn } from '@/util/cn';

export interface HouseAnalysisProps {
  houses?: Record<string, unknown> | null;
  /** Sarvashtakavarga points by house number, if available */
  points?: Record<string, number> | null;
}

export type HouseRow = {
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
  1: ['Tanu', 'Body, temperament, first impressions'],
  2: ['Dhana', 'Speech, family, savings'],
  3: ['Sahaja', 'Courage, siblings, short journeys'],
  4: ['Sukha', 'Home, mother, inner contentment'],
  5: ['Putra', 'Intellect, children, creativity'],
  6: ['Ari', 'Health, debts, daily work, rivals'],
  7: ['Kalatra', 'Marriage, partnerships, contracts'],
  8: ['Ayu', 'Longevity, research, sudden change'],
  9: ['Dharma', 'Teachers, father, fortune'],
  10: ['Karma', 'Career, status, public life'],
  11: ['Labha', 'Gains, friends, ambitions'],
  12: ['Vyaya', 'Expenses, retreat, foreign lands'],
};

function unwrap(houses: Record<string, any>): Record<string, any> {
  return houses && typeof houses === 'object' && houses.houses && typeof houses.houses === 'object' ? houses.houses : houses;
}

function toRow(num: number, value: unknown): HouseRow {
  const [bhava, topic] = BHAVA_FALLBACK[num] || ['Bhava', ''];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const row = value as Record<string, any>;
    return {
      num,
      sign: row.sign,
      lord: row.lord,
      bhava: row.bhava || bhava,
      topic: row.topic || topic,
      occupants: Array.isArray(row.occupants) ? row.occupants.map(String) : [],
      notes: Array.isArray(row.notes) ? row.notes.map(String) : [],
      summary: String(row.summary || ''),
    };
  }
  if (Array.isArray(value)) {
    return { num, bhava, topic, occupants: value.map(String), notes: [], summary: value.join(', ') || 'Empty' };
  }
  return { num, bhava, topic, occupants: [], notes: [], summary: String(value ?? '') };
}

/** Normalise the API's houses payload into twelve rows (shared with the chart overview). */
export function houseRows(houses?: Record<string, unknown> | null): HouseRow[] {
  if (!houses) return [];
  const data = unwrap(houses as Record<string, any>);
  if (!data || typeof data !== 'object') return [];
  return Object.entries(data)
    .filter(([key]) => !Number.isNaN(Number(key)))
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([key, value]) => toRow(Number(key), value));
}

export function Occupants({ names, empty = 'No planets' }: { names: string[]; empty?: string }) {
  if (!names.length) return <span className="text-subtle">{empty}</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {names.map((n) => (
        <span key={n} className="inline-flex items-center gap-1.5 rounded-full border border-line/10 bg-line/[0.04] px-2 py-0.5 text-xs text-fg">
          <span className="planet-dot h-1.5 w-1.5 rounded-full" style={{ ['--pc' as any]: planetInfo(n).color }} aria-hidden="true" />
          {n}
        </span>
      ))}
    </span>
  );
}

export default function HouseAnalysis({ houses, points }: HouseAnalysisProps) {
  const rows = houseRows(houses);
  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title="Houses"
        description="Whole-sign houses counted from the ascendant. An empty house still acts through its lord."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row, i) => {
          const sav = points?.[String(row.num)];
          return (
            <motion.article
              key={row.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.35 }}
              className={cn(
                'flex flex-col rounded-2xl border p-4 transition-colors',
                row.occupants.length ? 'border-accent/20 bg-accent/[0.04]' : 'border-line/10 bg-canvas/30',
              )}
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-xl font-semibold leading-tight">
                    House {row.num}
                    <span className="font-normal text-muted"> · {row.bhava}</span>
                  </h4>
                  {row.topic && <p className="mt-1 text-xs text-subtle">{row.topic}</p>}
                </div>
                {typeof sav === 'number' && (
                  <span
                    className={cn('shrink-0 rounded-lg px-2 py-1 text-xs tabular-nums', sav >= 28 ? 'bg-success/10 text-success' : 'bg-line/[0.05] text-muted')}
                    title="Sarvashtakavarga points (28 is average)"
                  >
                    {sav} pts
                  </span>
                )}
              </header>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-subtle">Sign</dt>
                  <dd className="text-fg">{row.sign || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-subtle">Lord</dt>
                  <dd className="text-fg">{row.lord ? <span>lord {row.lord}</span> : '—'}</dd>
                </div>
              </dl>
              <div className="mt-3 text-sm">
                <Occupants names={row.occupants} />
              </div>
              {row.notes.length > 0 ? (
                <ul className="mt-3 space-y-1.5 border-t border-line/[0.06] pt-3 text-sm leading-relaxed text-muted">
                  {row.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              ) : row.summary && !row.sign ? (
                <p className="mt-3 text-sm text-muted">House {row.num}: {row.summary}</p>
              ) : null}
            </motion.article>
          );
        })}
      </div>
    </Card>
  );
}
