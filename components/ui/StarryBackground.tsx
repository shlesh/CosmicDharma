import React, { useMemo } from 'react';

type Star = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
};

function makeStars(count: number, seed: number): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const n = (i + 1) * seed;
    return {
      id: i,
      left: `${(n * 37.1) % 100}%`,
      top: `${(n * 19.7) % 88}%`,
      size: n % 11 === 0 ? 2.6 : n % 5 === 0 ? 1.7 : 1,
      delay: `${(n % 23) * 0.18}s`,
      duration: `${2.2 + (n % 6) * 0.55}s`,
      opacity: 0.35 + ((n % 8) * 0.08),
    };
  });
}

function StarField({ stars, className }: { stars: Star[]; className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="sky-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}

function VanvasHorizon() {
  return (
    <svg
      className="vanvas-horizon"
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vanvasMist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#061018" stopOpacity="0" />
          <stop offset="40%" stopColor="#07140e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#020605" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path fill="url(#vanvasMist)" d="M0 80 L1440 80 L1440 220 L0 220 Z" />
      <path
        fill="#020806"
        d="M0 220 L0 148 C70 148 90 92 140 118 C170 70 210 96 240 128 C280 64 330 88 370 130 C410 78 460 108 500 138 C560 70 620 118 680 142 C740 86 800 124 860 148 C920 100 980 136 1040 154 C1100 112 1160 148 1220 160 C1280 128 1340 156 1440 168 L1440 220 Z"
      />
      <path
        fill="#010403"
        d="M0 220 L0 176 C40 168 80 150 120 166 C160 132 200 158 250 172 C310 140 360 168 420 180 C490 150 560 176 640 186 C720 164 800 182 880 190 C980 168 1080 186 1180 194 C1280 180 1360 190 1440 198 L1440 220 Z"
      />
    </svg>
  );
}

export function StarryBackground() {
  const near = useMemo(() => makeStars(70, 11), []);
  const mid = useMemo(() => makeStars(110, 29), []);
  const far = useMemo(() => makeStars(160, 47), []);

  return (
    <div className="sky-root" aria-hidden="true">
      <div className="sky-nebula" />
      <div className="sky-milky" />
      <StarField stars={far} className="sky-layer sky-layer-far" />
      <StarField stars={mid} className="sky-layer sky-layer-mid" />
      <StarField stars={near} className="sky-layer sky-layer-near" />
      <span className="sky-shoot sky-shoot-a" />
      <span className="sky-shoot sky-shoot-b" />
      <span className="sky-firefly f1" />
      <span className="sky-firefly f2" />
      <span className="sky-firefly f3" />
      <VanvasHorizon />
    </div>
  );
}

export default StarryBackground;
