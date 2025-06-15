// src/components/HouseAnalysis.jsx
import React from 'react';

export default function HouseAnalysis({ houses, planetsInHouses }) {
  if (!houses) return null;
  return (
    <section className="mb-6">
      <h3>House Analysis</h3>
      <div className="grid grid-cols-3 gap-4">
        {houses.cusps.map(c => (
          <div key={c.house} className="p-2 border rounded">
            <h4>House {c.house}</h4>
            <p><strong>Sign:</strong> {c.sign} ({c.deg}°)</p>
            <p>
              <strong>Planets:</strong>{" "}
              {houses.planets_in_houses
                 .filter(p => p.house === c.house)
                 .map(p => p.planet)
                 .join(", ") ||
                "—"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
