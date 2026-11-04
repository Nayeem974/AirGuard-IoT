import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTelemetry } from '../hooks/useTelemetry.js';
import { downloadCsv, toCsv } from '../lib/csv';
import { LIMITS } from '../lib/constants.js';

const RANGE_MS = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  all: null,
};

const MAX_ROWS = 200;

function number(value, decimals) {
  return value == null ? '—' : Number(value).toFixed(decimals);
}

export default function History() {
  const { readings, clearHistory, now } = useTelemetry();
  const [range, setRange] = useState('15m');
  const [source, setSource] = useState('all');

  const filtered = readings.filter(
    (reading) => (source === 'all' || reading.source === source)
      && (RANGE_MS[range] == null || reading.ts >= now - RANGE_MS[range]),
  );
  const sorted = [...filtered].sort((a, b) => b.ts - a.ts);
  const visible = sorted.slice(0, MAX_ROWS);

  const exportRows = () => downloadCsv('airguard-history.csv', toCsv(sorted));
  const clear = () => {
    if (window.confirm('Clear all stored readings and alerts?')) clearHistory();
  };

  return (
    <section className="page" aria-labelledby="history-title">
      <div className="page-head">
        <div>
          <p className="eyebrow">Stored telemetry</p>
          <h1 id="history-title">History</h1>
        </div>
        <div className="page-actions">
          <button type="button" className="btn" onClick={exportRows} disabled={sorted.length === 0}>Export CSV</button>
          <button type="button" className="btn btn--ghost" onClick={clear} disabled={readings.length === 0}>Clear history</button>
        </div>
      </div>

      <div className="history-toolbar">
        <div className="filter-group">
          <span className="filter-label">Range</span>
          <div className="segmented" role="group" aria-label="Range">
            {Object.keys(RANGE_MS).map((key) => (
              <button key={key} type="button" aria-pressed={range === key} onClick={() => setRange(key)}>
                {key === 'all' ? 'All' : key}
              </button>
            ))}
          </div>
        </div>
        <label className="filter-group">
          <span className="filter-label">Source</span>
          <select value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="all">All</option>
            <option value="live">Live</option>
            <option value="demo">Demo</option>
          </select>
        </label>
      </div>

      {readings.length === 0 ? (
        <p className="empty-state">
          No readings yet. <Link to="/settings">Enable demo mode</Link>
        </p>
      ) : sorted.length === 0 ? (
        <p className="empty-state">No readings match these filters.</p>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Source</th>
                  <th scope="col">Air</th>
                  <th scope="col">Gas</th>
                  <th scope="col">Dust</th>
                  <th scope="col">Temp</th>
                  <th scope="col">Humidity</th>
                  <th scope="col">O₂</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((reading, index) => (
                  <tr key={`${reading.ts}-${reading.source}-${index}`}>
                    <td><time dateTime={new Date(reading.ts).toISOString()}>{new Date(reading.ts).toLocaleString()}</time></td>
                    <td><span className="source-tag" data-source={reading.source}>{reading.source === 'demo' ? 'Demo' : 'Live'}</span></td>
                    <td>{number(reading.aqi, 0)}</td>
                    <td>{number(reading.gas, 0)}</td>
                    <td>{number(reading.dust, 1)}</td>
                    <td>{number(reading.temp, 1)}</td>
                    <td>{number(reading.hum, 1)}</td>
                    <td>{number(reading.o2, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-note">
            {sorted.length > MAX_ROWS
              ? `Showing the newest ${MAX_ROWS} of ${sorted.length} readings. Export includes all filtered rows.`
              : `Showing ${sorted.length} of ${readings.length} stored readings.`}
          </p>
        </>
      )}
      <p className="panel-note">Stored in this browser only, up to {LIMITS.readings.toLocaleString()} readings.</p>
    </section>
  );
}
