import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend);

const FALLBACK_DESCRIPTIONS = {
  Sun: 'Focus on self-expression, authority, vitality.',
  Moon: 'Emotional sensitivity, nurturing, introspection.',
  Mars: 'Action, courage, conflict, drive.',
  Mercury: 'Communication, learning, adaptability.',
  Jupiter: 'Growth, wisdom, optimism, abundance.',
  Venus: 'Relationships, beauty, harmony, comfort.',
  Saturn: 'Discipline, restriction, karma, perseverance.',
  Rahu: 'Innovation, obsession, transformation.',
  Ketu: 'Detachment, spirituality, liberation.',
};

export default function DashaChart({ dasha, analysis }) {
  const descriptions = useMemo(() => {
    if (analysis && Array.isArray(analysis)) {
      return analysis.map(d => d.description || '');
    }
    if (Array.isArray(dasha)) {
      return dasha.map(d => FALLBACK_DESCRIPTIONS[d.lord] || '');
    }
    return [];
  }, [analysis, dasha]);

  const data = useMemo(() => {
    if (!Array.isArray(dasha) || dasha.length === 0) return null;
    return {
      datasets: dasha.map((d, idx) => ({
        label: d.lord,
        data: [
          { x: new Date(d.start), y: idx },
          { x: new Date(d.end), y: idx },
        ],
        borderWidth: 4,
        fill: false,
      })),
    };
  }, [dasha]);

  if (!data) return null;

  const options = {
    scales: {
      y: {
        ticks: {
          callback: (_, i) => (dasha && dasha[i] ? dasha[i].lord : i),
        },
        beginAtZero: false,
      },
      x: { type: 'time' },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const idx = ctx.datasetIndex;
            const d = dasha && dasha[idx];
            if (!d) return '';
            return `${d.lord}: ${d.start} – ${d.end}`;
          },
          afterLabel: ctx => {
            const idx = ctx.datasetIndex;
            const desc = descriptions[idx];
            return desc ? `Meaning: ${desc}` : '';
          },
        },
      },
    },
  };

  return (
    <section className="mb-6">
      <h3>Dasha Timeline</h3>
      <Line data={data} options={options} />
    </section>
  );
}
