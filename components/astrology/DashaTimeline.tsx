import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  type DashaPeriod, currentDasha, dateToTime, formatDate, periodContains, periodProgress, periodYears, planetInfo,
} from '@/util/astro';
import { cn } from '@/util/cn';

const MEANING: Record<string, string> = {
  Sun: 'Authority, vitality, the father and public recognition.',
  Moon: 'Feelings, home, the mother and the public mood.',
  Mars: 'Energy, courage, property and competition.',
  Mercury: 'Learning, trade, writing and communication.',
  Jupiter: 'Growth, teachers, wisdom and good fortune.',
  Venus: 'Relationships, comfort, art and pleasure.',
  Saturn: 'Discipline, endurance, duty and slow results.',
  Rahu: 'Ambition, the unconventional and sudden change.',
  Ketu: 'Detachment, insight and spiritual turning points.',
};

const fmt = (iso: string) => formatDate(iso, { month: 'short', year: 'numeric' });

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-line/[0.08]" aria-hidden="true">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(value * 100)}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/** Vimshottari dasha: the current period, a proportional timeline and the full list. */
export default function DashaTimeline({ dasha, now = Date.now() }: { dasha?: DashaPeriod[]; now?: number }) {
  const periods = Array.isArray(dasha) ? dasha : [];
  const { maha, antar } = useMemo(() => currentDasha(periods, now), [periods, now]);
  const [open, setOpen] = useState<string | null>(maha ? `${maha.lord}-${maha.start}` : null);

  if (periods.length === 0) return null;

  const first = dateToTime(periods[0].start);
  const last = dateToTime(periods[periods.length - 1].end);
  const span = last - first || 1;
  const nowPct = Math.min(100, Math.max(0, ((now - first) / span) * 100));

  return (
    <div className="space-y-4">
      {maha && (
        <Card className="overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl" style={{ background: `${planetInfo(maha.lord).color}22` }} />
          <p className="eyebrow">Running now</p>
          <div className="mt-3 grid gap-6 sm:grid-cols-2">
            {[{ label: 'Mahadasha', p: maha }, ...(antar ? [{ label: 'Antardasha', p: antar }] : [])].map(({ label, p }) => {
              const info = planetInfo(p.lord);
              const pct = periodProgress(p, now);
              return (
                <div key={label}>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{label}</p>
                  <p className="mt-1 flex items-baseline gap-2 font-display text-3xl font-semibold">
                    <span className="planet-glyph text-2xl" style={{ ['--pc' as any]: info.color }} aria-hidden="true">{info.glyph}</span>
                    {p.lord}
                  </p>
                  <p className="mt-1 text-sm text-muted">{fmt(p.start)} – {fmt(p.end)}</p>
                  <div className="mt-3"><ProgressBar value={pct} color={info.color} /></div>
                  <p className="mt-1.5 text-xs text-subtle">{Math.round(pct * 100)}% complete</p>
                </div>
              );
            })}
          </div>
          {MEANING[maha.lord] && <p className="mt-5 border-t border-line/10 pt-4 text-sm leading-relaxed text-muted">{maha.lord} period: {MEANING[maha.lord]}</p>}
        </Card>
      )}

      <Card>
        <CardHeader
          title="Vimshottari dasha"
          description="The 120-year cycle of planetary periods, starting from the Moon’s nakshatra at birth."
        />

        {/* Proportional timeline */}
        <div className="relative mb-8 mt-2">
          <div className="flex h-11 overflow-hidden rounded-xl border border-line/10" role="img" aria-label="Timeline of mahadasha periods">
            {periods.map((p, i) => {
              const w = ((dateToTime(p.end) - dateToTime(p.start)) / span) * 100;
              const info = planetInfo(p.lord);
              const active = maha === p;
              return (
                <motion.div
                  key={`${p.lord}-${p.start}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: `${w}%`, background: `${info.color}${active ? '55' : '26'}`, transformOrigin: 'left' }}
                  className="flex min-w-0 items-center justify-center border-r border-canvas/60 text-[11px] font-semibold text-fg/90 last:border-0"
                  title={`${p.lord}: ${fmt(p.start)} – ${fmt(p.end)}`}
                >
                  <span className="truncate px-1">{w > 6 ? p.lord : planetInfo(p.lord).abbr}</span>
                </motion.div>
              );
            })}
          </div>
          {now >= first && now <= last && (
            <div className="pointer-events-none absolute -bottom-6 top-[-6px] flex flex-col items-center" style={{ left: `${nowPct}%`, transform: 'translateX(-50%)' }}>
              <div className="w-0.5 flex-1 rounded-full bg-fg" />
              <span className="mt-1 rounded-full bg-fg px-1.5 text-[10px] font-semibold uppercase tracking-wider text-canvas">Now</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-xs text-subtle">
            <span>{fmt(periods[0].start)}</span>
            <span>{fmt(periods[periods.length - 1].end)}</span>
          </div>
        </div>

        {/* Period list */}
        <ul className="divide-y divide-line/[0.07] overflow-hidden rounded-2xl border border-line/10">
          {periods.map((p) => {
            const key = `${p.lord}-${p.start}`;
            const info = planetInfo(p.lord);
            const isOpen = open === key;
            const isNow = periodContains(p, now);
            const isPast = dateToTime(p.end) <= now;
            return (
              <li key={key} className={cn(isNow && 'bg-accent/[0.05]')}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : key)}
                  aria-expanded={isOpen}
                  disabled={!p.sub?.length}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-line/[0.03] disabled:cursor-default"
                >
                  <span className="planet-dot h-2.5 w-2.5 shrink-0 rounded-full" style={{ ['--pc' as any]: info.color }} aria-hidden="true" />
                  <span className={cn('w-20 font-medium', isPast ? 'text-muted' : 'text-fg')}>{p.lord}</span>
                  <span className="flex-1 text-sm tabular-nums text-muted">
                    {fmt(p.start)} – {fmt(p.end)}
                    <span className="hidden text-subtle sm:inline"> · {periodYears(p).toFixed(1)} yrs</span>
                  </span>
                  {isNow && <Badge tone="accent">Now</Badge>}
                  {!!p.sub?.length && (
                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-subtle transition-transform duration-300', isOpen && 'rotate-180')} aria-hidden="true" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && p.sub && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <ul className="grid gap-1 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
                        {p.sub.map((s) => {
                          const subNow = periodContains(s, now);
                          return (
                            <li
                              key={`${s.lord}-${s.start}`}
                              className={cn(
                                'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm',
                                subNow ? 'bg-accent/10 text-fg' : 'text-muted',
                              )}
                            >
                              <span className="flex items-center gap-2">
                                <span className="planet-dot h-1.5 w-1.5 rounded-full" style={{ ['--pc' as any]: planetInfo(s.lord).color }} aria-hidden="true" />
                                {p.lord}–{s.lord}
                              </span>
                              <span className="text-xs tabular-nums text-subtle">{fmt(s.start)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
