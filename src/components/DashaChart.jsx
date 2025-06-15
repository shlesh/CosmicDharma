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

export default function DashaChart({ dasha }) {
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
    plugins: { legend: { display: false } },
  };

  return (
    <section className="mb-6">
      <h3>Dasha Timeline</h3>
      <Line data={data} options={options} />
    </section>
  );
}
