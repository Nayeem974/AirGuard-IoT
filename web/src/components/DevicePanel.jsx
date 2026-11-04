const CONNECTION_LABELS = {
  demo: 'Demo',
  connecting: 'Connecting',
  live: 'Live',
  reconnecting: 'Reconnecting',
  offline: 'Offline',
  error: 'Error',
};

function ageLabel(latest, now) {
  if (!latest) return '—';
  return `${Math.max(0, Math.round((now - latest.ts) / 1000))}s ago`;
}

export default function DevicePanel({
  connection,
  settings,
  latest,
  readingsCount,
  rejected,
  source,
  stale,
  now,
  onRetry,
}) {
  const broken = connection.state === 'error' || connection.state === 'offline';

  return (
    <section className="panel device-panel" aria-labelledby="device-title">
      <div className="panel-head">
        <h2 id="device-title">Device</h2>
        {stale && <span className="count-badge count-badge--warn">STALE</span>}
      </div>
      <dl className="device-rows">
        <div><dt>Source</dt><dd>{source === 'demo' ? 'Demo (simulated)' : 'Live MQTT'}</dd></div>
        <div><dt>Connection</dt><dd>{CONNECTION_LABELS[connection.state] ?? 'Unknown'}</dd></div>
        <div><dt>Broker</dt><dd className="mono">{settings.mqtt.url}</dd></div>
        <div><dt>Topic</dt><dd className="mono">{settings.mqtt.topic}</dd></div>
        <div><dt>Last message</dt><dd>{ageLabel(latest, now)}</dd></div>
        <div><dt>Readings</dt><dd>{readingsCount}</dd></div>
        <div><dt>Rejected</dt><dd>{rejected}</dd></div>
      </dl>
      {broken && (
        <div className="device-error">
          {connection.error && <p>{connection.error}</p>}
          <button type="button" className="btn btn--small" onClick={onRetry}>Retry</button>
        </div>
      )}
      <p className="panel-note">Local buzzer/LEDs follow air + gas thresholds only.</p>
    </section>
  );
}
