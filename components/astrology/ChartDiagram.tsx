import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SIGNS, planetInfo, signOfHouse, houseFromLagna, PLANET_ORDER } from '@/util/astro';
import { cn } from '@/util/cn';

export type ChartStyle = 'north' | 'south';

export interface ChartDiagramProps {
  /** planet name -> sign number (1-12) */
  placements: Record<string, number>;
  /** Ascendant sign (1-12). Required for the North Indian layout. */
  lagnaSign?: number | null;
  retrograde?: string[];
  style?: ChartStyle;
  /** Shown in the centre of the South Indian chart */
  title?: string;
  subtitle?: string;
  /** Selected house (North) or sign (South); highlights that region. */
  selected?: number | null;
  onSelect?: (n: number) => void;
  className?: string;
}

// ---- North Indian geometry (400 x 400) -----------------------------------------------------
type Region = { points: string; cx: number; cy: number; lx: number; ly: number; perRow: number };
const NORTH: Record<number, Region> = {
  1: { points: '200,0 300,100 200,200 100,100', cx: 200, cy: 100, lx: 200, ly: 176, perRow: 3 },
  2: { points: '0,0 200,0 100,100', cx: 100, cy: 38, lx: 100, ly: 80, perRow: 2 },
  3: { points: '0,0 100,100 0,200', cx: 34, cy: 100, lx: 80, ly: 100, perRow: 1 },
  4: { points: '0,200 100,100 200,200 100,300', cx: 100, cy: 200, lx: 176, ly: 200, perRow: 3 },
  5: { points: '0,200 100,300 0,400', cx: 34, cy: 300, lx: 80, ly: 300, perRow: 1 },
  6: { points: '0,400 100,300 200,400', cx: 100, cy: 362, lx: 100, ly: 320, perRow: 2 },
  7: { points: '200,400 100,300 200,200 300,300', cx: 200, cy: 300, lx: 200, ly: 224, perRow: 3 },
  8: { points: '200,400 300,300 400,400', cx: 300, cy: 362, lx: 300, ly: 320, perRow: 2 },
  9: { points: '400,400 300,300 400,200', cx: 366, cy: 300, lx: 320, ly: 300, perRow: 1 },
  10: { points: '400,200 300,300 200,200 300,100', cx: 300, cy: 200, lx: 224, ly: 200, perRow: 3 },
  11: { points: '400,200 300,100 400,0', cx: 366, cy: 100, lx: 320, ly: 100, perRow: 1 },
  12: { points: '400,0 300,100 200,0', cx: 300, cy: 38, lx: 300, ly: 80, perRow: 2 },
};

// ---- South Indian geometry: fixed sign cells in a 4x4 grid ---------------------------------
const SOUTH_CELLS: Record<number, [number, number]> = {
  12: [0, 0], 1: [1, 0], 2: [2, 0], 3: [3, 0],
  11: [0, 1], 4: [3, 1],
  10: [0, 2], 5: [3, 2],
  9: [0, 3], 8: [1, 3], 7: [2, 3], 6: [3, 3],
};
const CELL = 100;

function orderPlanets(names: string[]) {
  return [...names].sort((a, b) => {
    const ia = PLANET_ORDER.indexOf(a);
    const ib = PLANET_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

function PlanetLabels({ names, cx, cy, perRow, retro, size = 14 }: { names: string[]; cx: number; cy: number; perRow: number; retro: Set<string>; size?: number }) {
  const rows: string[][] = [];
  names.forEach((n, i) => {
    const r = Math.floor(i / perRow);
    (rows[r] = rows[r] || []).push(n);
  });
  const lineH = size + 3;
  const top = cy - ((rows.length - 1) * lineH) / 2;
  return (
    <>
      {rows.map((row, r) => (
        <text key={r} x={cx} y={top + r * lineH} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={600}>
          {row.map((name, i) => {
            const info = planetInfo(name);
            return (
              <tspan key={name} className="planet-label" style={{ ['--pc' as any]: info.color }} dx={i === 0 ? 0 : 5}>
                {info.abbr}
                {retro.has(name) && <tspan fontSize={size * 0.68} fillOpacity={0.75}>R</tspan>}
              </tspan>
            );
          })}
        </text>
      ))}
    </>
  );
}

/** North or South Indian chart as an accessible, interactive SVG. */
export default function ChartDiagram({
  placements,
  lagnaSign,
  retrograde = [],
  style = 'north',
  title,
  subtitle,
  selected,
  onSelect,
  className,
}: ChartDiagramProps) {
  const retro = useMemo(() => new Set(retrograde), [retrograde]);
  const bySign = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const [planet, sign] of Object.entries(placements)) {
      if (!sign) continue;
      (map[sign] = map[sign] || []).push(planet);
    }
    for (const k of Object.keys(map)) map[+k] = orderPlanets(map[+k]);
    return map;
  }, [placements]);

  const useNorth = style === 'north' && !!lagnaSign;
  const interactive = !!onSelect;

  const regionProps = (n: number, label: string) =>
    interactive
      ? {
          role: 'button' as const,
          tabIndex: 0,
          'aria-label': label,
          'aria-pressed': selected === n,
          onClick: () => onSelect?.(n),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(n); }
          },
          className: 'cursor-pointer outline-none [&:focus-visible>.region]:stroke-accent',
        }
      : {};

  const describe = (planets: string[]) => (planets.length ? planets.join(', ') : 'empty');

  return (
    <motion.svg
      viewBox="0 0 400 400"
      className={cn('h-auto w-full select-none', className)}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      role="img"
      aria-label={useNorth ? 'North Indian birth chart' : 'South Indian birth chart'}
    >
      <rect x={1} y={1} width={398} height={398} rx={6} className="fill-surface-2/40 stroke-line/25" strokeWidth={1.5} />

      {useNorth
        ? Object.entries(NORTH).map(([key, r]) => {
            const house = +key;
            const sign = signOfHouse(house, lagnaSign!);
            const planets = bySign[sign] || [];
            const isSel = selected === house;
            return (
              <g key={house} {...regionProps(house, `House ${house}, ${SIGNS[sign - 1].name}: ${describe(planets)}`)}>
                <polygon
                  points={r.points}
                  className={cn(
                    'region transition-colors duration-200',
                    isSel ? 'fill-accent/15 stroke-accent/70' : 'fill-transparent stroke-line/25',
                    interactive && !isSel && 'hover:fill-line/[0.05]',
                  )}
                  strokeWidth={isSel ? 2 : 1.2}
                />
                <text x={r.lx} y={r.ly} textAnchor="middle" dominantBaseline="central" fontSize={12} className={house === 1 ? 'fill-accent' : 'fill-subtle'} fontWeight={house === 1 ? 700 : 500}>
                  {sign}
                </text>
                {house === 1 && (
                  <text x={200} y={36} textAnchor="middle" dominantBaseline="central" fontSize={10.5} className="fill-accent" fontWeight={600} letterSpacing={1}>
                    ASC
                  </text>
                )}
                <PlanetLabels names={planets} cx={r.cx} cy={house === 1 ? r.cy + 6 : r.cy} perRow={r.perRow} retro={retro} />
              </g>
            );
          })
        : Object.entries(SOUTH_CELLS).map(([key, [col, row]]) => {
            const sign = +key;
            const planets = bySign[sign] || [];
            const x = col * CELL;
            const y = row * CELL;
            const isSel = selected === sign;
            const isLagna = lagnaSign === sign;
            const label = `${SIGNS[sign - 1].name}${isLagna ? ' (ascendant)' : ''}${lagnaSign ? `, house ${houseFromLagna(sign, lagnaSign)}` : ''}: ${describe(planets)}`;
            return (
              <g key={sign} {...regionProps(sign, label)}>
                <rect
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  className={cn(
                    'region transition-colors duration-200',
                    isSel ? 'fill-accent/15 stroke-accent/70' : 'fill-transparent stroke-line/25',
                    interactive && !isSel && 'hover:fill-line/[0.05]',
                  )}
                  strokeWidth={isSel ? 2 : 1.2}
                />
                {isLagna && <line x1={x} y1={y + 26} x2={x + 26} y2={y} className="stroke-accent" strokeWidth={1.5} />}
                <text x={x + CELL - 8} y={y + 14} textAnchor="end" fontSize={10.5} className="fill-subtle">
                  {SIGNS[sign - 1].name.slice(0, 3)}
                </text>
                <PlanetLabels names={planets} cx={x + CELL / 2} cy={y + CELL / 2 + 6} perRow={3} retro={retro} size={13} />
              </g>
            );
          })}

      {!useNorth && (
        <g>
          <rect x={CELL} y={CELL} width={CELL * 2} height={CELL * 2} className="fill-canvas/30 stroke-line/25" strokeWidth={1.2} />
          {title && (
            <text x={200} y={subtitle ? 190 : 200} textAnchor="middle" dominantBaseline="central" className="fill-fg font-display" fontSize={26} fontWeight={600}>
              {title}
            </text>
          )}
          {subtitle && (
            <text x={200} y={220} textAnchor="middle" dominantBaseline="central" className="fill-subtle" fontSize={12}>
              {subtitle}
            </text>
          )}
        </g>
      )}
    </motion.svg>
  );
}
