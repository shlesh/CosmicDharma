import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SIGNS, planetInfo } from '@/util/astro';
import { cn } from '@/util/cn';

const C = 300; // centre of the 600x600 viewBox
const polar = (r: number, deg: number) => {
  // 0° (Aries) at the left, signs running counter-clockwise, as on a traditional wheel.
  const a = ((180 - deg) * Math.PI) / 180;
  return [C + r * Math.cos(a), C - r * Math.sin(a)] as const;
};

// A decorative but plausible sky: sidereal longitudes for the planet markers.
const SAMPLE = [
  { name: 'Sun', lon: 222 }, { name: 'Moon', lon: 67 }, { name: 'Mars', lon: 103 }, { name: 'Mercury', lon: 238 },
  { name: 'Jupiter', lon: 92 }, { name: 'Venus', lon: 196 }, { name: 'Saturn', lon: 333 }, { name: 'Rahu', lon: 347 },
  { name: 'Ketu', lon: 167 },
];

/** The animated zodiac wheel in the home page hero. Purely decorative. */
export default function ZodiacWheel({ className }: { className?: string }) {
  const trines = useMemo(
    () =>
      [0, 1, 2, 3].map((k) =>
        [0, 4, 8].map((step) => polar(204, (k + step) * 30 + 15).join(',')).join(' '),
      ),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn('relative aspect-square w-full', className)}
      aria-hidden="true"
    >
      {/* Soft light behind the wheel */}
      <div className="absolute inset-[12%] rounded-full bg-accent/20 blur-3xl" />
      <svg viewBox="0 0 600 600" className="relative h-full w-full animate-spin-slow motion-reduce:animate-none">
        <defs>
          <radialGradient id="zw-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.28" />
            <stop offset="70%" stopColor="rgb(var(--accent))" stopOpacity="0.02" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={C} cy={C} r={296} className="fill-none stroke-line/15" strokeWidth={1} />
        <circle cx={C} cy={C} r={252} className="fill-none stroke-accent/50" strokeWidth={1.2} />
        <circle cx={C} cy={C} r={236} className="fill-none stroke-line/10" strokeWidth={1} />
        <circle cx={C} cy={C} r={204} className="fill-none stroke-line/10" strokeWidth={1} />
        <circle cx={C} cy={C} r={204} fill="url(#zw-core)" />

        {/* Degree ticks: every 5°, longer every 30° */}
        {Array.from({ length: 72 }, (_, i) => {
          const deg = i * 5;
          const long = deg % 30 === 0;
          const [x1, y1] = polar(296, deg);
          const [x2, y2] = polar(long ? 252 : 288, deg);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={long ? 'stroke-accent/50' : 'stroke-line/20'} strokeWidth={long ? 1.2 : 1} />;
        })}

        {/* Sign glyphs */}
        {SIGNS.map((sign, i) => {
          const [x, y] = polar(274, i * 30 + 15);
          return (
            <text key={sign.name} x={x} y={y} textAnchor="middle" dominantBaseline="central" className="fill-fg/80" fontSize={22}>
              {sign.glyph}
            </text>
          );
        })}

        {/* 27 nakshatras */}
        {Array.from({ length: 27 }, (_, i) => {
          const deg = (i * 360) / 27;
          const [x1, y1] = polar(252, deg);
          const [x2, y2] = polar(236, deg);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-line/25" strokeWidth={1} />;
        })}

        {/* The four trines (fire, earth, air, water) form a twelve-pointed star */}
        {trines.map((points, i) => (
          <polygon key={i} points={points} className="fill-none stroke-accent/25" strokeWidth={1} />
        ))}
        <circle cx={C} cy={C} r={118} className="fill-none stroke-line/10" strokeWidth={1} strokeDasharray="2 6" />

        {/* Planets */}
        {SAMPLE.map((p) => {
          const [x, y] = polar(220, p.lon);
          const info = planetInfo(p.name);
          return (
            <g key={p.name}>
              <circle cx={x} cy={y} r={9.5} className="fill-canvas" stroke={info.color} strokeWidth={1.4} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fill={info.color}>
                {info.glyph}
              </text>
            </g>
          );
        })}

        <circle cx={C} cy={C} r={5} className="fill-accent" />
        <circle cx={C} cy={C} r={14} className="fill-none stroke-accent/40" strokeWidth={1} />
      </svg>
    </motion.div>
  );
}
