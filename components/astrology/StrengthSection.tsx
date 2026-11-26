import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PLANET_ORDER, SIGNS, planetInfo, signOfHouse } from '@/util/astro';
import { cn } from '@/util/cn';

type Shadbala = Record<string, { total?: number; required?: number; is_strong?: boolean } & Record<string, number | boolean>>;

const ease = [0.16, 1, 0.3, 1] as const;

function ShadbalaBars({ shadbala }: { shadbala: Shadbala }) {
  const planets = PLANET_ORDER.filter((p) => shadbala[p] && typeof shadbala[p].total === 'number');
  if (!planets.length) return null;
  const max = Math.max(...planets.map((p) => Math.max(Number(shadbala[p].total) || 0, Number(shadbala[p].required) || 0))) || 1;

  return (
    <ul className="space-y-4">
      {planets.map((p, i) => {
        const row = shadbala[p];
        const total = Number(row.total) || 0;
        const required = Number(row.required) || 0;
        const ratio = required ? total / required : 0;
        const info = planetInfo(p);
        return (
          <li key={p}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-fg">
                <span className="planet-dot h-2 w-2 rounded-full" style={{ ['--pc' as any]: info.color }} aria-hidden="true" />
                {p}
              </span>
              <span className="flex items-center gap-2 tabular-nums text-muted">
                {Math.round(total)} / {Math.round(required)}
                <span className="text-xs text-subtle">({ratio.toFixed(2)}×)</span>
                {row.is_strong && <Badge tone="success">Strong</Badge>}
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-line/[0.07]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: info.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(total / max) * 100}%` }}
                transition={{ duration: 0.9, delay: i * 0.04, ease }}
              />
              {required > 0 && (
                <span
                  className="absolute -top-1 h-4 w-0.5 rounded-full bg-fg/60"
                  style={{ left: `${(required / max) * 100}%` }}
                  title={`Required: ${Math.round(required)}`}
                  aria-hidden="true"
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Sarvashtakavarga by house. The API keys points by SIGN (1 = Aries); with an ascendant we
 *  re-order them into houses, otherwise we show them by sign. */
export function savByHouse(sav: Record<string, number>, lagnaSign?: number | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (let h = 1; h <= 12; h++) out[String(h)] = Number(sav[String(lagnaSign ? signOfHouse(h, lagnaSign) : h)]) || 0;
  return out;
}

function SavGrid({ sav, lagnaSign }: { sav: Record<string, number>; lagnaSign?: number | null }) {
  const byHouse = savByHouse(sav, lagnaSign);
  const values = Array.from({ length: 12 }, (_, i) => byHouse[String(i + 1)]);
  const max = Math.max(...values, 40);
  return (
    <div>
      <div className="flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label="Sarvashtakavarga points per house">
        {values.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className={cn('text-[11px] tabular-nums', v >= 28 ? 'text-success' : 'text-subtle')}>{v}</span>
            <motion.div
              className={cn('w-full rounded-t-md', v >= 28 ? 'bg-success/60' : 'bg-line/20')}
              initial={{ height: 0 }}
              animate={{ height: `${(v / max) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.03, ease }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 border-t border-line/10 pt-2 sm:gap-2">
        {values.map((_, i) => (
          <div key={i} className="flex-1 text-center">
            {lagnaSign ? (
              <>
                <span className="block text-xs font-medium text-fg">{i + 1}</span>
                <span className="hidden text-[10px] text-subtle sm:block">{SIGNS[signOfHouse(i + 1, lagnaSign) - 1].name.slice(0, 3)}</span>
              </>
            ) : (
              <span className="block text-[10px] font-medium text-fg">{SIGNS[i].name.slice(0, 3)}</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-subtle">Houses with 28 or more points (green) are above average and tend to give good results.</p>
    </div>
  );
}

export default function StrengthSection({
  shadbala,
  ashtakavarga,
  lagnaSign,
}: {
  shadbala?: Shadbala | null;
  ashtakavarga?: { sav?: Record<string, number> } | null;
  lagnaSign?: number | null;
}) {
  const hasShadbala = shadbala && Object.keys(shadbala).length > 0;
  const sav = ashtakavarga?.sav;
  if (!hasShadbala && !sav) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {hasShadbala && (
        <Card>
          <CardHeader
            title="Shadbala"
            description="Six-fold planetary strength in virupas. The marker shows the classical minimum for each planet."
          />
          <ShadbalaBars shadbala={shadbala!} />
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-line/[0.04] px-3 py-2.5 text-xs leading-relaxed text-subtle">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Approximate: kala bala currently includes day/night, paksha and weekday strength only, so totals run low.
          </p>
        </Card>
      )}
      {sav && (
        <Card>
          <CardHeader title="Ashtakavarga" description={lagnaSign ? 'Sarvashtakavarga points for each house (sign shown below), from the eight contributors.' : 'Sarvashtakavarga points for each sign, from the eight contributors.'} />
          <SavGrid sav={sav} lagnaSign={lagnaSign} />
        </Card>
      )}
    </div>
  );
}
