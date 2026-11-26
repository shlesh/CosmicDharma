import React from 'react';
import { motion } from 'framer-motion';
import Card, { CardHeader } from '@/components/ui/Card';

export interface CoreElementsProps {
  analysis?: Record<string, unknown> | null;
  elements?: Record<string, unknown> | null;
  bare?: boolean;
}

const COLORS: Record<string, string> = {
  fire: '#ef7a5a', earth: '#b9a36a', air: '#8ec5e8', water: '#6c8ff0', space: '#b49ae8',
  cardinal: 'rgb(var(--accent))', fixed: 'rgb(var(--lunar))', mutable: 'rgb(var(--success))',
};

const toNumber = (val: unknown) => {
  if (typeof val === 'number') return val;
  const m = String(val).match(/([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
};

function Bars({ title, data }: { title: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined);
  if (!entries.length) return null;
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">{title}</h3>
      <ul className="space-y-2.5">
        {entries.map(([key, val]) => {
          const pct = Math.round(toNumber(val));
          return (
            <li key={key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="capitalize text-fg">{key}</span>
                <span className="tabular-nums text-muted">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line/[0.07]" aria-hidden="true">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: COLORS[key.toLowerCase()] || 'rgb(var(--accent))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Balance of the elements and modalities across the planets. */
export default function CoreElements({ analysis, elements, bare }: CoreElementsProps) {
  const data: any = (analysis && ((analysis as any).coreElements || (analysis as any).core_elements)) || elements;
  if (!data || typeof data !== 'object') return null;
  const nested = 'elements' in data || 'modalities' in data;

  const body = (
    <div className="grid gap-6 sm:grid-cols-2">
      {nested ? (
        <>
          {data.elements && <Bars title="Elements" data={data.elements} />}
          {data.modalities && <Bars title="Modalities" data={data.modalities} />}
        </>
      ) : (
        <Bars title="Distribution" data={data} />
      )}
    </div>
  );

  if (bare) return body;
  return (
    <Card>
      <CardHeader title="Elements" as="h3" description="How the planets are spread across fire, earth, air and water." />
      {body}
    </Card>
  );
}
