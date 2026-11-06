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
  aqi: { label: 'Air', unit: 'raw', decimals: 0, color: '#38bdf8', fill: 'rgba(56, 189, 248, 0.14)' },
  gas: { label: 'Gas', unit: 'raw', decimals: 0, color: '#fbbf24', fill: 'rgba(251, 191, 36, 0.14)' },
  dust: { label: 'Dust', unit: 'µg/m³', decimals: 1, color: '#34d399', fill: 'rgba(52, 211, 153, 0.14)' },
  temp: { label: 'Temperature', unit: '°C', decimals: 1, color: '#f87171', fill: 'rgba(248, 113, 113, 0.14)' },
  hum: { label: 'Humidity', unit: '%', decimals: 1, color: '#a78bfa', fill: 'rgba(167, 139, 250, 0.14)' },
};

const RANGES = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
};

const TICK = '#8fa3bf';
const GRID = 'rgba(255, 255, 255, 0.05)';
const FONT = { family: "'Inter Variable', 'Inter', system-ui, sans-serif", size: 11 };

const makeOptions = (range, unit, compact = false, withSeconds = range === '5m') => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { mode: 'nearest', axis: 'x', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => new Date(items[0].parsed.x).toLocaleTimeString(),
        label: (item) => `${item.parsed.y} ${unit}`,
      },
    },
  },
  scales: {
    x: {
      type: 'linear',
      grid: { color: GRID },
      ticks: {
        color: TICK,
        font: FONT,
        maxTicksLimit: compact ? 4 : 6,
        callback: (value) => new Date(value).toLocaleTimeString([], withSeconds ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : { hour: '2-digit', minute: '2-digit' }),
      },
    },
    y: {
      grid: { color: GRID },
      ticks: { color: TICK, font: FONT, maxTicksLimit: compact ? 5 : 8 },
    },
  },
});

// Short recordings need second-level ticks, or every label reads the same minute.
const needsSeconds = (points) => points.length > 1 && points[points.length - 1].ts - points[0].ts < 3 * 60 * 1000;

function dataset(config, points, metric) {
  return {
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
}

function RangeControl({ range, onChange }) {
  return (
    <div className="segmented" role="group" aria-label="Chart range">
      {Object.keys(RANGES).map((key) => (
        <button key={key} type="button" aria-pressed={range === key} onClick={() => onChange(key)}>
          {key}
        </button>
      ))}
    </div>
  );
}

function ChartCard({ metric, readings, points, range }) {
  const config = METRICS[metric];
  const newest = readings.reduce((best, reading) => (best == null || reading.ts > best.ts ? reading : best), null);
  const last = newest ? newest[metric] : null;
  const value = Number.isFinite(last) ? Number(last).toFixed(config.decimals) : '—';

  return (
    <article className="chart-card" data-metric={metric}>
      <div className="chart-card-head">
        <h3>{config.label}</h3>
        <p className="chart-card-value">
          <span style={{ color: config.color }}>{value}</span>
          <small>{config.unit}</small>
        </p>
      </div>
      {points.length === 0 ? (
        <p className="empty-state">No readings in this range yet.</p>
      ) : (
        <div className="chart-canvas chart-canvas--compact" role="img" aria-label={`${config.label} over the last ${range}, ${points.length} readings`}>
          <Line data={dataset(config, points, metric)} options={makeOptions(range, config.unit, true, range === '5m' || needsSeconds(points))} />
        </div>
      )}
    </article>
  );
}

export default function TrendChart({ readings = [], now, layout = 'single' }) {
  const [metric, setMetric] = useState('aqi');
  const [range, setRange] = useState('15m');
  const points = readings.filter((reading) => reading.ts >= now - RANGES[range]);

  if (layout === 'grid') {
    return (
      <section className="chart-section" aria-labelledby="trend-title">
        <div className="chart-section-head">
          <div>
            <p className="eyebrow">Trend</p>
            <h2 id="trend-title">Readings over time</h2>
          </div>
          <RangeControl range={range} onChange={setRange} />
        </div>
        <div className="chart-grid">
          {Object.keys(METRICS).map((key) => (
            <ChartCard key={key} metric={key} readings={readings} points={points} range={range} />
          ))}
        </div>
      </section>
    );
  }

  const config = METRICS[metric];
  return (
    <section className="panel chart-panel" aria-labelledby="trend-title">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Trend</p>
          <h2 id="trend-title">Readings over time</h2>
        </div>
        <RangeControl range={range} onChange={setRange} />
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
          <Line data={dataset(config, points, metric)} options={makeOptions(range, config.unit, false, range === '5m' || needsSeconds(points))} />
        </div>
      )}
    </section>
  );
}
