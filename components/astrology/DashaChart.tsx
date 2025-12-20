import React, { useMemo } from 'react';
import Card from '../ui/Card';

export interface DashaChartPeriod {
  lord: string;
  start: string;
  end: string;
  description?: string;
}

export interface DashaChartProps {
  dasha?: DashaChartPeriod[];
  analysis?: { description?: string }[];
}

// Visualizes planetary periods so visitors can grasp upcoming life phases.
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

import { parseISO, format } from 'date-fns';

import { useTheme } from '../ui/ThemeProvider';

export default function DashaChart({ dasha, analysis }: DashaChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)'; // gray-800
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const descriptions = useMemo(() => {
    if (analysis && Array.isArray(analysis)) {
      return analysis.map(d => d.description || '');
    }
    if (Array.isArray(dasha)) {
      return dasha.map(d => (FALLBACK_DESCRIPTIONS as Record<string, string>)[d.lord] || '');
    }
    return [];
  }, [analysis, dasha]);

  const data = useMemo(() => {
    if (!Array.isArray(dasha) || dasha.length === 0) return null;

    try {
      return {
        datasets: dasha.map((d, idx) => {
          // Robust date parsing
          const startDate = d.start instanceof Date ? d.start : parseISO(d.start);
          const endDate = d.end instanceof Date ? d.end : parseISO(d.end);

          return {
            label: d.lord,
            data: [
              { x: startDate.getTime(), y: idx },
              { x: endDate.getTime(), y: idx },
            ],
            borderColor: getDashaColor(d.lord),
            backgroundColor: getDashaColor(d.lord), // Point color
            borderWidth: 6, // Thicker lines for visibility
            pointRadius: 4,
            fill: false,
          };
        }),
      };
    } catch (e) {
      console.error("Dasha chart data error", e);
      return null;
    }
  }, [dasha]);

  if (!data) return null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 20
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (_: any, i: number) => (dasha && dasha[i] ? dasha[i].lord : ''),
          autoSkip: false,
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        beginAtZero: true,
      },
      x: {
        type: 'time' as const,
        time: {
          unit: 'year' as const,
        },
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        }
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
        titleColor: isDark ? '#fff' : '#1f2937',
        bodyColor: isDark ? '#fff' : '#4b5563',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => {
            const idx = ctx.datasetIndex;
            const d = dasha && dasha[idx];
            if (!d) return '';
            return `${d.lord}: ${d.start} – ${d.end}`;
          },
          afterLabel: (ctx: any) => {
            const idx = ctx.datasetIndex;
            const desc = descriptions[idx];
            return desc ? `Meaning: ${desc}` : '';
          },
        },
      },
    },
  };

  return (
    <Card variant="glass" className="mb-6 h-[400px]">
      <h3 title="Graphical view of each major period">Dasha Timeline</h3>
      <p className="help-text mb-4">Hover over each segment to read what it signifies.</p>
      <div className="relative h-[300px] w-full">
        <Line data={data} options={options} />
      </div>
    </Card>
  );
}

// Helper for vibrant chart colors
function getDashaColor(lord: string) {
  const colors: Record<string, string> = {
    Sun: '#F59E0B',    // Amber
    Moon: '#E2E8F0',   // Slate-200 (White-ish)
    Mars: '#EF4444',   // Red
    Rahu: '#8B5CF6',   // Violet
    Jupiter: '#FBBF24', // Yellow
    Saturn: '#3B82F6',  // Blue
    Mercury: '#10B981', // Emerald
    Ketu: '#6366F1',    // Indigo
    Venus: '#EC4899',   // Pink
  };
  return colors[lord] || '#9CA3AF';
}
