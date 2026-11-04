import AlertsPanel from '../components/AlertsPanel.jsx';
import DevicePanel from '../components/DevicePanel.jsx';
import MetricCard from '../components/MetricCard.jsx';
import StatusBanner from '../components/StatusBanner.jsx';
import TrendChart from '../components/TrendChart.jsx';
import { useTelemetry } from '../hooks/useTelemetry.js';

function MetricIcon({ name }) {
  const props = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  };

  if (name === 'air') {
    return (
      <svg {...props}>
        <path d="M3 8h11a3 3 0 1 0-3-3M3 13h14a3 3 0 1 1-3 3M4 18h6" />
      </svg>
    );
  }
  if (name === 'gas') {
    return (
      <svg {...props}>
        <path d="M12 3c1.2 3.2 4 4.5 4 8a4 4 0 0 1-8 0c0-2 1-3.2 2.2-4.4.4 1.8 1.8 2.4 1.8 4.4 0-2.4 1-3.6 0-8Z" />
      </svg>
    );
  }
  if (name === 'dust') {
    return (
      <svg {...props}>
        <circle cx="7" cy="9" r="2" />
        <circle cx="16" cy="7" r="1.5" />
        <circle cx="12" cy="15" r="2.5" />
        <circle cx="18" cy="17" r="1.2" />
        <circle cx="5" cy="18" r="1.2" />
      </svg>
    );
  }
  if (name === 'temp') {
    return (
      <svg {...props}>
        <path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0Z" />
        <path d="M12 9v7" />
      </svg>
    );
  }
  if (name === 'hum') {
    return (
      <svg {...props}>
        <path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="10" cy="10" r="1" />
      <circle cx="14" cy="14" r="1" />
      <circle cx="15" cy="9" r="1" />
    </svg>
  );
}

export default function Dashboard() {
  const {
    latest,
    statuses,
    overall,
    demo,
    isStale,
    readings,
    settings,
    alerts,
    connection,
    rejected,
    now,
    source,
    leakActive,
    triggerLeak,
    updateSettings,
    retry,
  } = useTelemetry();
  const activeSource = demo ? 'demo' : 'live';
  const activeReadings = readings.filter((reading) => reading.source === activeSource);
  const recent = activeReadings.slice(-20);
  const series = (key) => recent.map((reading) => reading[key]);
  const tag = demo ? 'SIM' : 'LIVE';
  const { thresholds } = settings;
  const oxygenMissing = source === 'live' && latest?.o2 == null;
  const toggleDemo = () => updateSettings({
    ...settings,
    demo: { ...settings.demo, enabled: !settings.demo.enabled },
  });

  return (
    <div className="dashboard">
      <h1 className="sr-only">Dashboard</h1>
      <StatusBanner overall={overall} latest={latest} demo={demo} stale={isStale} />
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="cards" data-stale={isStale} aria-label="Current readings">
            <MetricCard
              label="Air quality"
              icon={<MetricIcon name="air" />}
              value={latest?.aqi}
              unit="raw"
              status={latest ? statuses.air : undefined}
              tag={tag}
              sparkValues={series('aqi')}
              footnote={`Raw 0–1023 · Warn > ${thresholds.airWarn} · Danger > ${thresholds.airDanger}`}
            />
            <MetricCard
              label="Combustible gas"
              icon={<MetricIcon name="gas" />}
              value={latest?.gas}
              unit="raw"
              status={latest ? statuses.gas : undefined}
              tag={tag}
              sparkValues={series('gas')}
              footnote={`Raw 0–1023 · Danger > ${thresholds.gasDanger}`}
            />
            <MetricCard
              label="Dust"
              icon={<MetricIcon name="dust" />}
              value={latest?.dust}
              unit="µg/m³"
              decimals={1}
              status={latest ? statuses.dust : undefined}
              tag={tag}
              sparkValues={series('dust')}
              footnote={`Warn > ${thresholds.dustWarn} · Danger > ${thresholds.dustDanger} (dashboard)`}
            />
            <MetricCard
              label="Temperature"
              icon={<MetricIcon name="temp" />}
              value={latest?.temp}
              unit="°C"
              decimals={1}
              tag={tag}
              sparkValues={series('temp')}
              footnote="DHT11"
            />
            <MetricCard
              label="Humidity"
              icon={<MetricIcon name="hum" />}
              value={latest?.hum}
              unit="%"
              decimals={1}
              tag={tag}
              sparkValues={series('hum')}
              footnote="DHT11"
            />
            <MetricCard
              label="Oxygen"
              icon={<MetricIcon name="o2" />}
              value={latest?.o2}
              unit="%"
              decimals={1}
              tag={oxygenMissing ? 'NOT INSTALLED' : tag}
              sparkValues={oxygenMissing ? [] : series('o2')}
              unavailable={oxygenMissing}
              unavailableText="Not installed — Phase 2 (A2 reserved)"
              footnote={oxygenMissing ? 'Phase 2 · pin A2' : 'ME2-O2 sensor'}
            />
          </section>
          <TrendChart readings={activeReadings} now={now} />
        </div>
        <aside className="dashboard-rail" aria-label="Session details">
          <AlertsPanel statuses={statuses} alerts={alerts} />
          <DevicePanel
            connection={connection}
            settings={settings}
            latest={latest}
            readingsCount={readings.length}
            rejected={rejected}
            source={source}
            stale={isStale}
            now={now}
            onRetry={retry}
          />
          <section className="panel quick-panel" aria-labelledby="quick-title">
            <div className="panel-head"><h2 id="quick-title">Quick actions</h2></div>
            <div className="quick-actions">
              <button type="button" className="btn" onClick={toggleDemo}>
                {demo ? 'Turn demo off' : 'Turn demo on'}
              </button>
              {demo ? (
                <button type="button" className="btn btn--accent" onClick={triggerLeak} disabled={leakActive}>
                  Simulate gas leak
                </button>
              ) : (
                <p className="panel-note">Live MQTT</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
