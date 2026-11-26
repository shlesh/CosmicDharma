import React from 'react';
import { motion } from 'framer-motion';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { NAKSHATRAS, formatDegree, houseFromLagna, planetInfo, signInfo, signNumber } from '@/util/astro';

export interface PlanetData {
  name: string;
  sign: string;
  degree: number;
  longitude?: number;
  nakshatra_index?: number;
  pada?: number;
  retrograde?: boolean;
}

export interface PlanetTableProps {
  planets?: PlanetData[];
  lagnaSign?: number | null;
  vargottama?: string[] | null;
}

function PlanetName({ name }: { name: string }) {
  const info = planetInfo(name);
  return (
    <span className="flex items-center gap-3">
      <span
        className="planet-glyph flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/10 bg-line/[0.04] text-[15px]"
        style={{ ['--pc' as any]: info.color }}
        aria-hidden="true"
      >
        {info.glyph}
      </span>
      <span>
        <span className="block font-medium text-fg">{name}</span>
        <span className="block text-xs text-subtle">{info.sanskrit}</span>
      </span>
    </span>
  );
}

export default function PlanetTable({ planets, lagnaSign, vargottama }: PlanetTableProps) {
  if (!Array.isArray(planets) || planets.length === 0) return null;
  const varg = new Set(vargottama || []);

  const rows = planets.map((p) => {
    const sNum = signNumber(p.sign);
    const nak = typeof p.nakshatra_index === 'number' ? NAKSHATRAS[p.nakshatra_index] : undefined;
    return {
      ...p,
      sign: signInfo(p.sign),
      house: sNum && lagnaSign ? houseFromLagna(sNum, lagnaSign) : undefined,
      nak,
    };
  });

  const badges = (p: (typeof rows)[number]) => (
    <>
      {p.retrograde && p.name !== 'Rahu' && p.name !== 'Ketu' && <Badge tone="warning" title="Retrograde">Retrograde</Badge>}
      {varg.has(p.name) && <Badge tone="accent" title="Same sign in D1 and D9">Vargottama</Badge>}
    </>
  );

  return (
    <Card>
      <CardHeader
        title="Planetary positions"
        description="Sidereal positions at the moment of birth. Degrees are within the sign."
      />

      {/* Desktop table */}
      <div className="-mx-2 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line/10 text-xs uppercase tracking-wider text-subtle">
              <th scope="col" className="px-2 py-3 font-medium">Planet</th>
              <th scope="col" className="px-2 py-3 font-medium">Sign</th>
              <th scope="col" className="px-2 py-3 font-medium">Degree</th>
              <th scope="col" className="px-2 py-3 font-medium">Nakshatra</th>
              <th scope="col" className="px-2 py-3 font-medium">House</th>
              <th scope="col" className="px-2 py-3 font-medium"><span className="sr-only">Notes</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <motion.tr
                key={p.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-line/[0.06] transition-colors last:border-0 hover:bg-line/[0.03]"
              >
                <td className="px-2 py-3"><PlanetName name={p.name} /></td>
                <td className="px-2 py-3">
                  <span className="text-fg">{p.sign?.name ?? '—'}</span>
                  {p.sign && <span className="ml-2 text-subtle" aria-hidden="true">{p.sign.glyph}</span>}
                </td>
                <td className="px-2 py-3 font-mono tabular-nums text-fg/90">{formatDegree(p.degree)}</td>
                <td className="px-2 py-3 text-muted">{p.nak ? `${p.nak}${p.pada ? ` · ${p.pada}` : ''}` : '—'}</td>
                <td className="px-2 py-3 tabular-nums text-muted">{p.house ?? '—'}</td>
                <td className="px-2 py-3"><div className="flex justify-end gap-1.5">{badges(p)}</div></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone cards */}
      <ul className="grid gap-2.5 md:hidden">
        {rows.map((p) => (
          <li key={p.name} className="rounded-2xl border border-line/10 bg-canvas/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <PlanetName name={p.name} />
              <div className="text-right">
                <p className="font-medium text-fg">{p.sign?.name ?? '—'}</p>
                <p className="font-mono text-sm tabular-nums text-muted">{formatDegree(p.degree)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line/[0.06] pt-3 text-xs text-muted">
              <span>{p.nak ? `${p.nak}${p.pada ? `, pada ${p.pada}` : ''}` : '—'}</span>
              {p.house && <span>House {p.house}</span>}
              <span className="ml-auto flex gap-1.5">{badges(p)}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
