import React, { useMemo } from 'react';

type Star = { left: string; top: string; size: number; delay: string; duration: string; opacity: number };

// Deterministic pseudo-random layout, so server and client render the same sky.
function makeStars(count: number, seed: number): Star[] {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => {
    const r = rand();
    return {
      left: `${(rand() * 100).toFixed(2)}%`,
      top: `${(rand() * 100).toFixed(2)}%`,
      size: r > 0.97 ? 2.2 : r > 0.85 ? 1.5 : 1,
      delay: `${(rand() * 6).toFixed(2)}s`,
      duration: `${(3 + rand() * 5).toFixed(2)}s`,
      opacity: 0.3 + rand() * 0.6,
    };
  });
}

/** A quiet, slowly twinkling star field behind every page (hidden in light mode and print). */
export default function StarryBackground() {
  const stars = useMemo(() => makeStars(140, 20241126), []);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-stars">
        {stars.map((star, i) => (
          <span
            key={i}
            className="sky-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
              boxShadow: star.size > 2 ? '0 0 6px rgb(255 245 220 / 0.8)' : undefined,
            }}
          />
        ))}
      </div>
      <div className="sky-vignette" />
    </div>
  );
}

export { StarryBackground };
