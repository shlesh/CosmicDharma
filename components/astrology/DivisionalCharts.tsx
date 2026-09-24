import React, { useMemo, useState } from 'react';
import Card from '../ui/Card';

export interface DivisionalChartsProps {
  charts?: Record<string, any> | null;
  analysis?: Record<string, any> | null;
  vargottama?: string[] | null;
}

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SHODASHA = [
  'D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12',
  'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60',
];

const VARGA_META: Record<string, { name: string; reads: string }>= {
  D1: { name: 'Rāśi', reads: 'Body and the life as lived' },
  D2: { name: 'Horā', reads: 'Wealth and substance' },
  D3: { name: 'Drekkāṇa', reads: 'Courage, siblings, effort' },
  D4: { name: 'Caturthāṃśa', reads: 'Home, land, happiness' },
  D7: { name: 'Saptāṃśa', reads: 'Children and creative fruit' },
  D9: { name: 'Navāṃśa', reads: 'Marriage, dharma, inner strength' },
  D10: { name: 'Daśāṃśa', reads: 'Work and public deed' },
  D12: { name: 'Dvādaśāṃśa', reads: 'Parents and lineage' },
  D16: { name: 'Ṣoḍaśāṃśa', reads: 'Vehicles and comforts' },
  D20: { name: 'Viṃśāṃśa', reads: 'Upāsana and devotion' },
  D24: { name: 'Siddhāṃśa', reads: 'Learning and vidyā' },
  D27: { name: 'Bhāṃśa', reads: 'Strength and stamina' },
  D30: { name: 'Triṃśāṃśa', reads: 'Misfortune and arishta' },
  D40: { name: 'Khavedāṃśa', reads: 'Maternal line' },
  D45: { name: 'Akṣavedāṃśa', reads: 'Paternal line' },
  D60: { name: 'Ṣaṣṭiāṃśa', reads: 'Past-life residue' },
};

const PLANET_ORDER = ['Lagna', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

function signName(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  const n = Number(value);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return SIGN_NAMES[n - 1];
  return String(value ?? '—');
}

function chartKeySort(a: string, b: string) {
  const na = Number(a.replace(/^D/i, '')) || 0;
  const nb = Number(b.replace(/^D/i, '')) || 0;
  return na - nb;
}

type NormalizedChart = {
  key: string;
  name: string;
  reads: string;
  description?: string;
  placements: Record<string, string>;
  details: { planet: string; sign: string; text: string }[];
};

function extractPlacements(raw: any): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {};
  if (raw.placements && typeof raw.placements === 'object') {
    return Object.fromEntries(
      Object.entries(raw.placements).map(([k, v]) => [k, signName(v)])
    );
  }
  const skip = new Set(['name', 'domain', 'description', 'interpretation', 'details', 'special_note', 'vargottama', 'distribution']);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (skip.has(k) || v === null || typeof v === 'object') continue;
    out[k] = signName(v);
  }
  return out;
}

function normalizeOne(key: string, raw: any, analysisNode?: any): NormalizedChart {
  const meta = VARGA_META[key] || { name: key, reads: analysisNode?.domain || raw?.domain || 'Divisional chart' };
  const fromAnalysis = analysisNode && typeof analysisNode === 'object' ? analysisNode : null;
  const source = fromAnalysis || raw || {};
  const placements = extractPlacements(source.placements ? source : raw);
  const details = Array.isArray(source.details)
    ? source.details.map((d: any) => ({
        planet: String(d.planet || ''),
        sign: signName(d.sign),
        text: String(d.text || ''),
      }))
    : [];
  return {
    key,
    name: source.name || meta.name,
    reads: source.domain || meta.reads,
    description: source.description || source.interpretation,
    placements,
    details,
  };
}

function occupancyPreview(placements: Record<string, string>): string {
  const planets = Object.keys(placements);
  if (!planets.length) return '—';
  const bySign: Record<string, string[]> = {};
  for (const [planet, sign] of Object.entries(placements)) {
    bySign[sign] = bySign[sign] || [];
    bySign[sign].push(planet);
  }
  const crowded = Object.entries(bySign)
    .filter(([, list]) => list.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 2)
    .map(([sign, list]) => `${sign} (${list.length})`);
  return crowded.length ? crowded.join(', ') : `${planets.length} grahas placed`;
}

export default function DivisionalCharts({
  charts,
  analysis,
  vargottama,
}: DivisionalChartsProps) {
  const [selected, setSelected] = useState('D9');
  const [showAll, setShowAll] = useState(false);

  const catalog = useMemo(() => {
    const raw = charts && typeof charts === 'object' ? charts : {};
    const analyzed = analysis && typeof analysis === 'object' ? analysis : {};
    const keys = new Set([...Object.keys(raw), ...Object.keys(analyzed)]);
    const items: NormalizedChart[] = [];
    for (const key of Array.from(keys).sort(chartKeySort)) {
      if (!/^D\d+$/i.test(key)) continue;
      items.push(normalizeOne(key.toUpperCase(), raw[key], analyzed[key]));
    }
    return items;
  }, [charts, analysis]);

  const rows = useMemo(() => {
    if (showAll) return catalog;
    const primary = catalog.filter((c) => SHODASHA.includes(c.key));
    return primary.length ? primary : catalog.slice(0, 16);
  }, [catalog, showAll]);

  const active = rows.find((c) => c.key === selected) || catalog.find((c) => c.key === selected) || rows[0];

  if (catalog.length === 0) return null;

  const orderedPlanets = active
    ? [
        ...PLANET_ORDER.filter((p) => p in active.placements),
        ...Object.keys(active.placements).filter((p) => !PLANET_ORDER.includes(p)),
      ]
    : [];

  return (
    <Card variant="glass" className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h3 className="font-display text-amber-50 m-0">Divisional charts</h3>
          <p className="help-text mb-0">
            Ṣoḍaśa vargas first. Click a row to read that chart below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-sm text-amber-200 hover:text-amber-100 underline underline-offset-4"
        >
          {showAll ? 'Show the sixteen' : 'Show every varga'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-amber-200/15">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-amber-200/15 text-amber-50/70">
              <th className="py-2 px-3 font-medium">Chart</th>
              <th className="py-2 px-3 font-medium">Name</th>
              <th className="py-2 px-3 font-medium hidden sm:table-cell">Reads</th>
              <th className="py-2 px-3 font-medium hidden md:table-cell">Clusters</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isOn = active?.key === row.key;
              return (
                <tr
                  key={row.key}
                  onClick={() => setSelected(row.key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(row.key);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isOn}
                  className={`cursor-pointer border-b border-white/5 last:border-0 ${
                    isOn ? 'bg-amber-200/15 text-amber-50' : 'hover:bg-white/5 text-amber-50/85'
                  }`}
                >
                  <td className="py-2 px-3 font-semibold">{row.key}</td>
                  <td className="py-2 px-3">{row.name}</td>
                  <td className="py-2 px-3 hidden sm:table-cell help-text">{row.reads}</td>
                  <td className="py-2 px-3 hidden md:table-cell help-text">{occupancyPreview(row.placements)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && (
        <section className="mt-5 rounded-xl border border-amber-200/15 bg-black/20 p-4 md:p-5">
          <header className="mb-3">
            <h4 className="font-display text-amber-50 text-xl m-0">
              {active.key} · {active.name}
            </h4>
            <p className="help-text mt-1 mb-0">{active.reads}</p>
          </header>
          {active.description ? <p className="help-text mb-4">{active.description}</p> : null}

          {vargottama && vargottama.length > 0 && active.key === 'D9' ? (
            <p className="text-sm text-amber-100 mb-4">
              Vargottama in D1/D9: {vargottama.join(', ')}
            </p>
          ) : null}

          {orderedPlanets.length > 0 ? (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-amber-200/15 text-amber-50/70">
                    <th className="py-2 pr-3 font-medium">Graha</th>
                    <th className="py-2 pr-3 font-medium">Sign in {active.key}</th>
                    {active.key === 'D9' && vargottama?.length ? (
                      <th className="py-2 font-medium">Note</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {orderedPlanets.map((planet) => (
                    <tr key={planet} className="border-b border-white/5 last:border-0">
                      <td className="py-2 pr-3 text-amber-50">{planet}</td>
                      <td className="py-2 pr-3 text-amber-50/90">{active.placements[planet]}</td>
                      {active.key === 'D9' && vargottama?.length ? (
                        <td className="py-2 text-amber-200/80">
                          {vargottama.includes(planet) ? 'Vargottama' : ''}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="help-text">No placements were returned for this chart.</p>
          )}

          {active.details.length > 0 ? (
            <ul className="help-text list-disc pl-5 space-y-2">
              {active.details.map((item) => (
                <li key={`${item.planet}-${item.sign}`}>
                  <strong className="text-amber-50/90">{item.planet} in {item.sign}.</strong>{' '}
                  {item.text}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}
    </Card>
  );
}
