import StatusChip from './StatusChip.jsx';

const METRIC_LABELS = { air: 'Air quality', gas: 'Combustible gas', dust: 'Dust' };

export default function AlertsPanel({ statuses, alerts = [] }) {
  const active = ['air', 'gas', 'dust'].filter((metric) => statuses[metric] !== 'good');
  const recent = [...alerts].sort((a, b) => b.ts - a.ts).slice(0, 5);

  return (
    <section className="panel alerts-panel" aria-labelledby="alerts-title">
      <div className="panel-head">
        <h2 id="alerts-title">Alerts</h2>
        {active.length > 0 && <span className="count-badge">{active.length}</span>}
      </div>
      {active.length > 0 && (
        <ul className="active-alerts">
          {active.map((metric) => (
            <li key={metric}>
              <span>{METRIC_LABELS[metric]}</span>
              <StatusChip level={statuses[metric]} />
            </li>
          ))}
        </ul>
      )}
      {recent.length > 0 && (
        <ol className="alert-list">
          {recent.map((alert) => (
            <li key={alert.id}>
              <div className="alert-meta">
                <time dateTime={new Date(alert.ts).toISOString()}>{new Date(alert.ts).toLocaleTimeString()}</time>
                <span className="alert-level" data-level={alert.level}>{alert.level}</span>
                {alert.source === 'demo' && <span className="metric-tag">SIM</span>}
              </div>
              <p>{alert.message}</p>
            </li>
          ))}
        </ol>
      )}
      {active.length === 0 && recent.length === 0 && <p className="empty-state">No alerts this session.</p>}
    </section>
  );
}
