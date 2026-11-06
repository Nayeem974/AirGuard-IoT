const COPY = {
  good: { title: 'Air is clear', body: 'All monitored readings are within safe limits.' },
  warning: { title: 'Air quality is elevated', body: 'One or more readings are above the warning threshold.' },
  danger: { title: 'Hazardous conditions detected', body: "A reading has crossed the danger threshold. Check the edge station's local alarm." },
  empty: { title: 'Waiting for data', body: 'Enable demo mode or check the station connection.' },
};

const BY_LINK = {
  connecting: { title: 'Connecting to the broker', body: 'Opening the MQTT connection. This usually takes a few seconds.' },
  reconnecting: { title: 'Reconnecting to the broker', body: 'The connection dropped. Retrying automatically.' },
  broker: { title: 'Broker connected', body: 'Subscribed to the topic. Waiting for the station to publish its first reading.' },
  disconnected: { title: 'Disconnected from the broker', body: 'No connection. Check the broker URL in Settings or retry from the Device panel.' },
  error: { title: 'Connection error', body: 'Could not reach the broker. Check the broker URL in Settings or retry from the Device panel.' },
};

const STALE = {
  title: 'No data from the station',
  body: 'No readings for 15 seconds. Showing last known values.',
};

export default function StatusBanner({ overall, latest, demo = false, stale = false, link }) {
  const level = stale ? 'stale' : overall ?? 'empty';
  const copy = stale ? STALE : overall ? COPY[overall] : BY_LINK[link] ?? COPY.empty;

  return (
    <section className="status-banner" data-level={level}>
      <div className="status-copy">
        <div className="status-live" role="status" aria-live="polite">
          <div className="status-kicker">
            {demo && <span className="badge badge--demo">SIMULATED</span>}
            <span>{stale ? 'Signal lost' : demo ? 'Simulated data' : 'Station status'}</span>
          </div>
          <h2>{copy.title}</h2>
          <p>{copy.body}</p>
        </div>
        {latest && <p className="status-time">Last update {new Date(latest.ts).toLocaleTimeString()}</p>}
      </div>
      <p className="status-note">Local buzzer/LEDs follow air and gas thresholds only.</p>
    </section>
  );
}
