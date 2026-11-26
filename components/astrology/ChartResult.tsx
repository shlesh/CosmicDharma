import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Printer, Download, RotateCcw, MapPin, Clock, CalendarDays, Globe2,
  LayoutGrid, Orbit, Home, Hourglass, Layers, Sparkles, Gauge, CalendarClock,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader } from '@/components/ui/Card';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import ChartDiagram, { type ChartStyle } from './ChartDiagram';
import PlanetTable from './PlanetTable';
import HouseAnalysis, { houseRows, Occupants } from './HouseAnalysis';
import DashaTimeline from './DashaTimeline';
import DivisionalCharts from './DivisionalCharts';
import YogasSection from './YogasSection';
import StrengthSection, { savByHouse } from './StrengthSection';
import PanchangaPanel from './PanchangaPanel';
import YugaPanel from './YugaPanel';
import CoreElements from './CoreElements';
import type { ProfileResult } from '@/util/api';
import {
  NAKSHATRAS, SIGNS, currentDasha, formatDate, formatDegree, formatLatLon, formatTime, planetInfo, signNumber,
} from '@/util/astro';
import { cn } from '@/util/cn';

export interface ChartMeta {
  name?: string;
  location?: string;
  /** Labels of the options the chart was cast with, when not the defaults */
  ayanamsa?: string;
  houseSystem?: string;
  nodeType?: string;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'planets', label: 'Planets', icon: <Orbit className="h-4 w-4" /> },
  { id: 'houses', label: 'Houses', icon: <Home className="h-4 w-4" /> },
  { id: 'dasha', label: 'Dasha', icon: <Hourglass className="h-4 w-4" /> },
  { id: 'vargas', label: 'Vargas', icon: <Layers className="h-4 w-4" /> },
  { id: 'yogas', label: 'Yogas', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'strength', label: 'Strength', icon: <Gauge className="h-4 w-4" /> },
  { id: 'panchanga', label: 'Panchanga', icon: <CalendarClock className="h-4 w-4" /> },
];

const STYLE_KEY = 'cd-chart-style';

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line/10 bg-canvas/30 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1.5 break-words font-display text-xl font-semibold leading-tight sm:text-2xl">{value}</p>
      {sub && <p className="mt-0.5 text-xs leading-snug text-muted">{sub}</p>}
    </div>
  );
}

function StyleToggle({ value, onChange }: { value: ChartStyle; onChange: (s: ChartStyle) => void }) {
  return (
    <div className="inline-flex rounded-full border border-line/15 p-0.5 text-xs font-medium" role="group" aria-label="Chart style">
      {(['north', 'south'] as ChartStyle[]).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          aria-pressed={value === s}
          className={cn('rounded-full px-3 py-1.5 transition-colors', value === s ? 'bg-line/10 text-fg' : 'text-subtle hover:text-fg')}
        >
          {s === 'north' ? 'North Indian' : 'South Indian'}
        </button>
      ))}
    </div>
  );
}

export default function ChartResult({
  result,
  meta,
  onNewChart,
}: {
  result: ProfileResult & Record<string, any>;
  meta?: ChartMeta;
  onNewChart?: () => void;
}) {
  const [tab, setTab] = useState('overview');
  const [style, setStyle] = useState<ChartStyle>('north');
  const [selected, setSelected] = useState<number>(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STYLE_KEY);
      if (saved === 'north' || saved === 'south') setStyle(saved);
    } catch { /* ignore */ }
  }, []);

  const changeStyle = (s: ChartStyle) => {
    setStyle(s);
    try { localStorage.setItem(STYLE_KEY, s); } catch { /* ignore */ }
    // The selection means "house" in North and "sign" in South; translate it.
    if (lagnaSign) setSelected(s === 'south' ? ((lagnaSign - 1 + selected - 1) % 12) + 1 : ((selected - lagnaSign + 12) % 12) + 1);
  };

  const birth: Record<string, any> = result.birthInfo || {};
  const lagnaSign = signNumber(birth.lagna_sign ?? birth.ascendant_sign);
  const planets: any[] = Array.isArray(result.planetaryPositions) ? result.planetaryPositions : [];
  const placements = useMemo(() => {
    const out: Record<string, number> = {};
    for (const p of planets) {
      const n = signNumber(p.sign);
      if (n) out[p.name] = n;
    }
    return out;
  }, [planets]);
  // Mean nodes always move backwards, so charts don't mark Rahu and Ketu as retrograde.
  const retro = planets.filter((p) => p.retrograde && p.name !== 'Rahu' && p.name !== 'Ketu').map((p) => p.name);
  const moon = planets.find((p) => p.name === 'Moon');
  const sun = planets.find((p) => p.name === 'Sun');
  const nak = result.nakshatra || result.analysis?.nakshatra;
  const { maha, antar } = currentDasha(result.vimshottariDasha as any);
  const houses = houseRows(result.houses);
  const interpretations: Record<string, string> = result.analysis?.planetaryInterpretations || {};

  const selHouse = style === 'north' || !lagnaSign ? selected : ((selected - lagnaSign + 12) % 12) + 1;
  const houseInfo = houses.find((h) => h.num === selHouse);

  const ayanamsaValue = typeof birth.sidereal_offset === 'number' ? formatDegree(birth.sidereal_offset, true) : null;
  const title = meta?.name ? `${meta.name}’s chart` : 'Birth chart';

  const download = () => {
    const blob = new Blob([JSON.stringify({ ...result, meta, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-dharma-chart-${birth.date || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card padding="lg" className="overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Birth chart</p>
            <h2 className="mt-2 font-display text-display-md font-semibold">{title}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
              <li className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-subtle" />{formatDate(birth.date, { day: 'numeric', month: 'long', year: 'numeric' })}</li>
              <li className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-subtle" />{formatTime(birth.time)}</li>
              {(meta?.location || birth.location) && <li className="flex min-w-0 items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0 text-subtle" /><span className="truncate">{meta?.location || birth.location}</span></li>}
              <li className="flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-subtle" />{birth.timezone}{Number.isFinite(birth.latitude) ? ` · ${formatLatLon(birth.latitude, birth.longitude)}` : ''}</li>
            </ul>
            <p className="mt-2 text-xs text-subtle">
              {meta?.ayanamsa || 'Sri Yukteswar'} ayanamsa{ayanamsaValue ? ` ${ayanamsaValue}` : ''} · {meta?.houseSystem || 'whole-sign'} houses · {meta?.nodeType || 'mean'} nodes
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
            <Button variant="secondary" size="sm" onClick={download}><Download className="h-4 w-4" /> Download</Button>
            {onNewChart && <Button variant="outline" size="sm" onClick={onNewChart}><RotateCcw className="h-4 w-4" /> New chart</Button>}
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Fact
            label="Ascendant"
            value={birth.ascendant_sign || (lagnaSign ? SIGNS[lagnaSign - 1].name : '—')}
            sub={typeof birth.lagna_degree === 'number' ? `${formatDegree(birth.lagna_degree)} · ${lagnaSign ? SIGNS[lagnaSign - 1].sanskrit : ''}` : undefined}
          />
          <Fact
            label="Moon"
            value={moon?.sign || '—'}
            sub={nak?.nakshatra ? `${nak.nakshatra}, pada ${nak.pada}` : moon && typeof moon.nakshatra_index === 'number' ? NAKSHATRAS[moon.nakshatra_index] : undefined}
          />
          <Fact label="Sun" value={sun?.sign || '—'} sub={sun ? formatDegree(sun.degree) : undefined} />
          <Fact
            label="Current dasha"
            value={maha ? `${maha.lord}${antar ? ` · ${antar.lord}` : ''}` : '—'}
            sub={antar ? `until ${formatDate(antar.end, { month: 'short', year: 'numeric' })}` : maha ? `until ${formatDate(maha.end, { month: 'short', year: 'numeric' })}` : undefined}
          />
        </div>
      </Card>

      {/* Tabs stick under the header while scrolling the long sections */}
      <div className="no-print sticky top-[calc(var(--header-h)+0.5rem)] z-20">
        <Tabs idBase="chart" label="Chart sections" items={TABS} value={tab} onChange={setTab} />
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        {tab === 'overview' && (
          <TabPanel idBase="chart" id="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <Card>
                <CardHeader title="Rashi chart" description="Tap a house to see what is in it." action={<StyleToggle value={style} onChange={changeStyle} />} />
                <ChartDiagram
                  style={style}
                  placements={placements}
                  lagnaSign={lagnaSign}
                  retrograde={retro}
                  title="D1"
                  subtitle="Rashi"
                  selected={selected}
                  onSelect={setSelected}
                  className="mx-auto max-w-[460px]"
                />
              </Card>
              <div className="grid gap-4">
                {houseInfo && (
                  <Card>
                    <p className="eyebrow">House {houseInfo.num}</p>
                    <h3 className="mt-1 font-display text-3xl font-semibold">{houseInfo.bhava} bhava</h3>
                    <p className="mt-1 text-sm text-muted">{houseInfo.topic}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-line/[0.04] p-3">
                        <dt className="text-xs text-subtle">Sign</dt>
                        <dd className="mt-0.5 text-fg">{houseInfo.sign || '—'}</dd>
                      </div>
                      <div className="rounded-xl bg-line/[0.04] p-3">
                        <dt className="text-xs text-subtle">Lord</dt>
                        <dd className="mt-0.5 text-fg">{houseInfo.lord || '—'}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 text-sm"><Occupants names={houseInfo.occupants} empty="No planets in this house" /></div>
                    {houseInfo.notes.length > 0 && (
                      <ul className="mt-4 space-y-1.5 border-t border-line/10 pt-4 text-sm leading-relaxed text-muted">
                        {houseInfo.notes.map((n) => <li key={n}>{n}</li>)}
                      </ul>
                    )}
                  </Card>
                )}
                {nak?.nakshatra && (
                  <Card>
                    <p className="eyebrow">Janma nakshatra</p>
                    <h3 className="mt-1 font-display text-3xl font-semibold">{nak.nakshatra}</h3>
                    <p className="text-sm text-muted">Pada {nak.pada}{nak.ruling_planet ? ` · ruled by ${nak.ruling_planet}` : ''}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      {[['Deity', nak.deity], ['Symbol', nak.symbol], ['Gana', nak.gana], ['Animal', nak.animal]].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k as string}>
                          <dt className="text-xs text-subtle">{k}</dt>
                          <dd className="text-fg">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {result.analysis?.nakshatra?.description && (
                      <p className="mt-4 border-t border-line/10 pt-4 text-sm leading-relaxed text-muted">{result.analysis.nakshatra.description}</p>
                    )}
                  </Card>
                )}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <CoreElements elements={result.coreElements} />
              <YugaPanel yuga={result.yuga || birth.yuga} lineage={result.lineage} />
            </div>
          </TabPanel>
        )}

        {tab === 'planets' && (
          <TabPanel idBase="chart" id="planets" className="space-y-4">
            <PlanetTable planets={planets} lagnaSign={lagnaSign} vargottama={result.vargottamaPlanets} />
            {Object.keys(interpretations).length > 0 && (
              <Card>
                <CardHeader title="Planets in signs" description="Traditional sign-by-sign readings. Read them as tendencies, not certainties." />
                <ul className="grid gap-3 md:grid-cols-2">
                  {Object.entries(interpretations).map(([key, text]) => {
                    const planet = key.split('In')[0];
                    return (
                      <li key={key} className="rounded-2xl border border-line/10 bg-canvas/30 p-4 text-sm leading-relaxed text-muted">
                        <span className="mb-1 flex items-center gap-2 font-medium text-fg">
                          <span className="planet-dot h-2 w-2 rounded-full" style={{ ['--pc' as any]: planetInfo(planet).color }} aria-hidden="true" />
                          {key.replace('In', ' in ')}
                        </span>
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </TabPanel>
        )}

        {tab === 'houses' && (
          <TabPanel idBase="chart" id="houses">
            <HouseAnalysis houses={result.houses} points={(result as any).ashtakavarga?.sav && lagnaSign ? savByHouse((result as any).ashtakavarga.sav, lagnaSign) : null} />
          </TabPanel>
        )}

        {tab === 'dasha' && (
          <TabPanel idBase="chart" id="dasha">
            <DashaTimeline dasha={result.vimshottariDasha as any} />
          </TabPanel>
        )}

        {tab === 'vargas' && (
          <TabPanel idBase="chart" id="vargas">
            <DivisionalCharts
              charts={result.divisionalCharts}
              analysis={result.analysis?.divisionalCharts}
              vargottama={result.vargottamaPlanets}
              lagnaSign={lagnaSign}
            />
          </TabPanel>
        )}

        {tab === 'yogas' && (
          <TabPanel idBase="chart" id="yogas">
            <YogasSection yogas={result.yogas} />
          </TabPanel>
        )}

        {tab === 'strength' && (
          <TabPanel idBase="chart" id="strength">
            <StrengthSection shadbala={result.shadbala as any} ashtakavarga={(result as any).ashtakavarga} lagnaSign={lagnaSign} />
          </TabPanel>
        )}

        {tab === 'panchanga' && (
          <TabPanel idBase="chart" id="panchanga">
            <PanchangaPanel panchanga={result.panchanga as any} />
          </TabPanel>
        )}
      </motion.div>

    </div>
  );
}
