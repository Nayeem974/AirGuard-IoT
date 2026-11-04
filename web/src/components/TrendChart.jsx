import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(LinearScale, PointElement, LineElement, Tooltip, Filler);

const METRICS = {
  aqi: { label: 'Air', color: '#38bdf8', fill: 'rgba(56, 189, 248, 0.14)' },
  gas: { label: 'Gas', color: '#fbbf24', fill: 'rgba(251, 191, 36, 0.14)' },
  dust: { label: 'Dust', color: '#34d399', fill: 'rgba(52, 211, 153, 0.14)' },
  temp: { label: 'Temperature', color: '#f87171', fill: 'rgba(248, 113, 113, 0.14)' },
  hum: { label: 'Humidity', color: '#a78bfa', fill: 'rgba(167, 139, 250, 0.14)' },
};

const RANGES = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
};

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => new Date(items[0].parsed.x).toLocaleTimeString(),
      },
    },
  },
  scales: {
    x: {
      type: 'linear',
      grid: { color: 'rgba(255, 255, 255, 0.06)' },
      ticks: {
        color: '#8fa3bf',
        maxTicksLimit: 6,
        callback: (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.06)' },
      ticks: { color: '#8fa3bf' },
    },
  },
};

export default function TrendChart({ readings = [], now }) {
  const [metric, setMetric] = useState('aqi');
  const [range, setRange] = useState('15m');
  const config = METRICS[metric];
  const points = readings.filter((reading) => reading.ts >= now - RANGES[range]);

  const data = {
    datasets: [
      {
        label: config.label,
        data: points.map((reading) => ({ x: reading.ts, y: reading[metric] })),
        borderColor: config.color,
        backgroundColor: config.fill,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <section className="panel chart-panel" aria-labelledby="trend-title">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Trend</p>
          <h2 id="trend-title">Readings over time</h2>
        </div>
        <div className="segmented" role="group" aria-label="Chart range">
          {Object.keys(RANGES).map((key) => (
            <button key={key} type="button" aria-pressed={range === key} onClick={() => setRange(key)}>
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="segmented segmented--wide" role="group" aria-label="Chart metric">
        {Object.entries(METRICS).map(([key, item]) => (
          <button key={key} type="button" aria-pressed={metric === key} onClick={() => setMetric(key)}>
            {item.label}
          </button>
        ))}
      </div>
      {points.length === 0 ? (
        <p className="empty-state">No readings in this range yet.</p>
      ) : (
        <div className="chart-canvas" role="img" aria-label={`${config.label} over the last ${range}, ${points.length} readings`}>
          <Line data={data} options={OPTIONS} />
        </div>
      )}
    </section>
  );
}
