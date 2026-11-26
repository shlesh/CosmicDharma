import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ChartDiagram from './ChartDiagram';
import { PLANET_ORDER, SIGNS, planetInfo, signNumber } from '@/util/astro';
import { cn } from '@/util/cn';

export interface DivisionalChartsProps {
  charts?: Record<string, any> | null;
  analysis?: Record<string, any> | null;
  vargottama?: string[] | null;
  /** D1 ascendant sign, used to mark the rashi chart */
  lagnaSign?: number | null;
}

const SHODASHA = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];

const VARGA_META: Record<string, { name: string; reads: string }> = {
  D1: { name: 'Rashi', reads: 'The body and the life as a whole' },
  D2: { name: 'Hora', reads: 'Wealth and resources' },
  D3: { name: 'Drekkana', reads: 'Siblings, courage and effort' },
  D4: { name: 'Chaturthamsha', reads: 'Home, property and happiness' },
  D7: { name: 'Saptamsha', reads: 'Children and creativity' },
  D9: { name: 'Navamsha', reads: 'Marriage, dharma and inner strength' },
  D10: { name: 'Dashamsha', reads: 'Career and public life' },
  D12: { name: 'Dvadashamsha', reads: 'Parents and ancestry' },
  D16: { name: 'Shodashamsha', reads: 'Vehicles and comforts' },
  D20: { name: 'Vimshamsha', reads: 'Spiritual practice and devotion' },
  D24: { name: 'Chaturvimshamsha', reads: 'Education and learning' },
  D27: { name: 'Bhamsha', reads: 'Strength and stamina' },
  D30: { name: 'Trimshamsha', reads: 'Difficulties and misfortune' },
  D40: { name: 'Khavedamsha', reads: 'The maternal line' },
  D45: { name: 'Akshavedamsha', reads: 'The paternal line and character' },
  D60: { name: 'Shashtiamsha', reads: 'Past karma, the finest division' },
};

const chartSort = (a: string, b: string) => (Number(a.replace(/^D/i, '')) || 0) - (Number(b.replace(/^D/i, '')) || 0);

type Normalized = {
  key: string;
  name: string;
  reads: string;
  description?: string;
  placements: Record<string, number>;
  details: { planet: string; sign: string; text: string }[];
};

function extractPlacements(raw: any): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  const source = raw.placements && typeof raw.placements === 'object' ? raw.placements : raw;
  const skip = new Set(['name', 'domain', 'description', 'interpretation', 'details', 'special_note', 'vargottama', 'distribution']);
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(source)) {
    if (skip.has(k) || v === null || typeof v === 'object') continue;
    const n = signNumber(v);
    if (n) out[k] = n;
  }
  return out;
}

function normalize(key: string, raw: any, analysisNode?: any): Normalized {
  const meta = VARGA_META[key] || { name: key, reads: analysisNode?.domain || raw?.domain || 'Divisional chart' };
  const source = (analysisNode && typeof analysisNode === 'object' ? analysisNode : null) || raw || {};
  return {
    key,
    name: VARGA_META[key]?.name || source.name || meta.name,
    reads: source.domain || meta.reads,
    description: source.description || source.interpretation,
    placements: extractPlacements(source.placements ? source : raw),
    details: Array.isArray(source.details)
      ? source.details.map((d: any) => ({
          planet: String(d.planet || ''),
          sign: SIGNS[(signNumber(d.sign) || 1) - 1]?.name || String(d.sign),
          text: String(d.text || ''),
        }))
      : [],
  };
}

export default function DivisionalCharts({ charts, analysis, vargottama, lagnaSign }: DivisionalChartsProps) {
  const [selected, setSelected] = useState('D9');
  const [showAll, setShowAll] = useState(false);

  const catalog = useMemo(() => {
    const raw = charts && typeof charts === 'object' ? charts : {};
    const analyzed = analysis && typeof analysis === 'object' ? analysis : {};
    return Array.from(new Set([...Object.keys(raw), ...Object.keys(analyzed)]))
      .filter((k) => /^D\d+$/i.test(k))
      .sort(chartSort)
      .map((k) => normalize(k.toUpperCase(), raw[k], analyzed[k]));
  }, [charts, analysis]);

  const visible = useMemo(() => {
    if (showAll) return catalog;
    const primary = catalog.filter((c) => SHODASHA.includes(c.key));
    return primary.length ? primary : catalog.slice(0, 16);
  }, [catalog, showAll]);

  if (catalog.length === 0) return null;
  const active = catalog.find((c) => c.key === selected) || visible[0];
  const varg = new Set(vargottama || []);
  const planets = active
    ? [...PLANET_ORDER.filter((p) => p in active.placements), ...Object.keys(active.placements).filter((p) => !PLANET_ORDER.includes(p))]
    : [];

  return (
    <Card>
      <CardHeader
        title="Divisional charts"
        description="Each varga divides every sign more finely to read one area of life. Signs are fixed in this South Indian layout."
        action={
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            {showAll ? 'Show the sixteen' : `Show all ${catalog.length}`}
          </button>
        }
      />

      <div className="no-scrollbar -mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Choose a divisional chart">
        {visible.map((c) => {
          const on = active?.key === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelected(c.key)}
              aria-pressed={on}
              title={`${c.name}: ${c.reads}`}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold tabular-nums transition-all duration-200',
                on ? 'border-accent bg-accent text-accent-fg shadow-[0_6px_20px_-8px_rgb(var(--accent)/0.8)]' : 'border-line/15 text-muted hover:border-line/30 hover:text-fg',
              )}
            >
              {c.key}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.section
            key={active.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]"
          >
            <ChartDiagram
              style="south"
              placements={active.placements}
              lagnaSign={active.key === 'D1' ? lagnaSign : null}
              title={active.key}
              subtitle={active.name}
              className="mx-auto max-w-[420px]"
            />
            <div className="min-w-0">
              <h4 className="font-display text-2xl font-semibold">
                {active.key} · {active.name}
              </h4>
              <p className="mt-1 text-sm text-muted">{active.reads}</p>
              {active.description && <p className="mt-3 text-sm leading-relaxed text-muted">{active.description}</p>}

              {active.key === 'D9' && varg.size > 0 && (
                <p className="mt-4 rounded-xl border border-accent/20 bg-accent/[0.06] px-4 py-3 text-sm text-fg">
                  <strong className="font-semibold">Vargottama:</strong> {Array.from(varg).join(', ')}. Same sign in the rashi
                  and navamsha, which strengthens them.
                </p>
              )}

              {planets.length > 0 ? (
                <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {planets.map((planet) => (
                    <li key={planet} className="flex items-center justify-between gap-2 rounded-xl border border-line/10 px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 text-fg">
                        <span className="planet-dot h-1.5 w-1.5 rounded-full" style={{ ['--pc' as any]: planetInfo(planet).color }} aria-hidden="true" />
                        {planet}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted">
                        {SIGNS[active.placements[planet] - 1]?.name}
                        {active.key === 'D9' && varg.has(planet) && <Badge tone="accent" className="px-1.5">V</Badge>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-subtle">No placements were returned for this chart.</p>
              )}

              {active.details.length > 0 && (
                <ul className="mt-5 space-y-2 text-sm leading-relaxed text-muted">
                  {active.details.map((item) => (
                    <li key={`${item.planet}-${item.sign}`}>
                      <strong className="font-medium text-fg">{item.planet} in {item.sign}.</strong> {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </Card>
  );
}
