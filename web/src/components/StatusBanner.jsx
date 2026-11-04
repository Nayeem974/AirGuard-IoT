const COPY = {
  good: { title: 'Air is clear', body: 'All monitored readings are within safe limits.' },
  warning: { title: 'Air quality is elevated', body: 'One or more readings are above the warning threshold.' },
  danger: { title: 'Hazardous conditions detected', body: "A reading has crossed the danger threshold. Check the edge station's local alarm." },
  empty: { title: 'Waiting for data', body: 'Enable demo mode or check the station connection.' },
};

const STALE = {
  title: 'No data from the station',
  body: 'No readings for 15 seconds. Showing last known values.',
};

export default function StatusBanner({ overall, latest, demo = false, stale = false }) {
  const level = stale ? 'stale' : overall ?? 'empty';
  const copy = stale ? STALE : COPY[overall ?? 'empty'];

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
