// Chart.js is loaded only with this module (via next/dynamic in AdminDashboard).
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function CountsChart({ posts, users }: { posts: number; users: number }) {
  return (
    <Bar
      data={{
        labels: ['Posts', 'Users'],
        datasets: [
          {
            label: 'Count',
            data: [posts, users],
            backgroundColor: ['rgba(75,192,192,0.5)', 'rgba(153,102,255,0.5)'],
          },
        ],
      }}
      options={{ responsive: true, plugins: { legend: { display: false } } }}
    />
  );
}
