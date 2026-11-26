import React from 'react';
import { motion } from 'framer-motion';
import Card, { CardHeader } from '@/components/ui/Card';

export interface YugaPanelProps {
  yuga?: {
    display?: string;
    name?: string;
    arc?: string;
    dharma?: string;
    quality?: string;
    start_year?: number;
    end_year?: number;
    year?: number;
    years_into?: number;
    years_remaining?: number;
    in_sandhi?: boolean;
    sandhi?: string | null;
    next_yuga?: string;
    next_year?: number;
    source?: string;
    note?: string;
  } | null;
  lineage?: { frame?: string; source?: string; note?: string } | null;
}

/** Where the birth year falls in Sri Yukteswar's 24,000-year cycle. */
export default function YugaPanel({ yuga, lineage }: YugaPanelProps) {
  if (!yuga && !lineage) return null;
  const span = yuga?.start_year !== undefined && yuga?.end_year !== undefined ? yuga.end_year - yuga.start_year : 0;
  const pct = span && typeof yuga?.years_into === 'number' ? Math.min(1, Math.max(0, yuga.years_into / span)) : null;

  return (
    <Card>
      <CardHeader
        as="h3"
        eyebrow="The Holy Science"
        title={yuga?.display || 'Yuga'}
        description={yuga?.quality}
      />
      {pct !== null && (
        <div className="mb-5">
          <div className="h-2 overflow-hidden rounded-full bg-line/[0.07]" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-lunar/70 to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-subtle">
            <span>{yuga?.start_year} CE</span>
            <span>{yuga?.end_year} CE</span>
          </div>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-4 text-sm">
        {yuga?.dharma && (
          <div className="col-span-2">
            <dt className="text-xs text-subtle">Dharma</dt>
            <dd className="text-fg first-letter:uppercase">{yuga.dharma}</dd>
          </div>
        )}
        {typeof yuga?.years_into === 'number' && (
          <div>
            <dt className="text-xs text-subtle">Years in</dt>
            <dd className="tabular-nums text-fg">{yuga.years_into.toLocaleString()}</dd>
          </div>
        )}
        {typeof yuga?.years_remaining === 'number' && (
          <div>
            <dt className="text-xs text-subtle">Until {yuga.next_yuga || 'next'}</dt>
            <dd className="tabular-nums text-fg">{yuga.years_remaining.toLocaleString()} years</dd>
          </div>
        )}
        {yuga?.in_sandhi && (
          <div className="col-span-2">
            <dt className="text-xs text-subtle">Sandhi</dt>
            <dd className="text-fg">{yuga.sandhi || 'Transition period'}</dd>
          </div>
        )}
        {lineage?.frame && (
          <div className="col-span-2">
            <dt className="text-xs text-subtle">Ayanamsa</dt>
            <dd className="text-fg">{lineage.frame}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
