import { useEffect, useState } from 'react';
import { useTelemetry } from '../hooks/useTelemetry.js';
import { DEFAULT_SETTINGS, LIMITS } from '../lib/constants.js';
import { validateSettings } from '../lib/settings.js';

const THRESHOLD_FIELDS = [
  ['airWarn', 'Air warning threshold', 'ADC 0–1023'],
  ['airDanger', 'Air danger threshold', 'ADC 0–1023'],
  ['gasDanger', 'Gas danger threshold', 'ADC 0–1023'],
  ['dustWarn', 'Dust warning threshold', 'µg/m³ 0–1000'],
  ['dustDanger', 'Dust danger threshold', 'µg/m³ 0–1000'],
];

const INTERVALS = [
  [1000, '1 second'],
  [3000, '3 seconds'],
  [5000, '5 seconds'],
];

const errorId = (key) => `settings-error-${key.replace('.', '-')}`;
const formatCount = (value) => value.toLocaleString('en-US');

export default function Settings() {
  const { settings, updateSettings, resetSettings, clearHistory, storageAvailable, readings } = useTelemetry();
  const [draft, setDraft] = useState(() => structuredClone(settings));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return undefined;
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [saved]);

  const setThreshold = (key, value) => {
    setDraft({ ...draft, thresholds: { ...draft.thresholds, [key]: value } });
  };
  const setMqtt = (key, value) => {
    setDraft({ ...draft, mqtt: { ...draft.mqtt, [key]: value } });
  };
  const setDemo = (key, value) => {
    setDraft({ ...draft, demo: { ...draft.demo, [key]: value } });
  };

  const submit = (event) => {
    event.preventDefault();
    const result = validateSettings(draft);
    if (!result.ok) {
      setErrors(result.errors);
      setSaved(false);
      const firstId = `settings-${Object.keys(result.errors)[0].replace('.', '-')}`;
      setTimeout(() => document.getElementById(firstId)?.focus(), 0);
      return;
    }
    setErrors({});
    updateSettings(result.settings);
    setSaved(true);
  };

  const reset = () => {
    resetSettings();
    setDraft(structuredClone(DEFAULT_SETTINGS));
    setErrors({});
    setSaved(false);
  };

  const clear = () => {
    if (window.confirm('Clear all stored readings and alerts?')) clearHistory();
  };

  const insecureWs = window.location.protocol === 'https:'
    && draft.mqtt.url.trim().toLowerCase().startsWith('ws://');

  return (
    <section className="page" aria-labelledby="settings-title">
      <div className="page-head">
        <div>
          <p className="eyebrow">Station controls</p>
          <h1 id="settings-title">Settings</h1>
        </div>
      </div>

      {!storageAvailable && (
        <p className="settings-warning" role="alert">
          Browser storage is unavailable; settings and history will not persist.
        </p>
      )}

      <form className="settings-form" onSubmit={submit} noValidate>
        {Object.keys(errors).length > 0 && (
          <p className="settings-warning" role="alert">Check the highlighted fields and save again.</p>
        )}
        <fieldset className="panel settings-section">
          <legend>Alert thresholds</legend>
          <p className="field-hint">Raw MQ-135/MQ-2 ADC values (0–1023) are not ppm or AQI.</p>
          <div className="settings-grid">
            {THRESHOLD_FIELDS.map(([key, label, hint]) => (
              <label className="field" key={key}>
                <span>{label}</span>
                <input
                  id={`settings-${key}`}
                  type="number"
                  min="0"
                  max={key.startsWith('dust') ? 1000 : 1023}
                  step="1"
                  value={draft.thresholds[key]}
                  onChange={(event) => setThreshold(key, event.target.value)}
                  aria-invalid={Boolean(errors[key])}
                  aria-describedby={errors[key] ? errorId(key) : undefined}
                />
                <small className="field-hint">{hint}</small>
                {errors[key] && <small className="field-error" id={errorId(key)}>{errors[key]}</small>}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="panel settings-section">
          <legend>MQTT connection</legend>
          <div className="settings-grid">
            <label className="field">
              <span>Broker WebSocket URL</span>
              <input
                id="settings-mqtt-url"
                type="url"
                value={draft.mqtt.url}
                onChange={(event) => setMqtt('url', event.target.value)}
                aria-invalid={Boolean(errors['mqtt.url'])}
                aria-describedby={errors['mqtt.url'] ? errorId('mqtt.url') : undefined}
              />
              {errors['mqtt.url'] && <small className="field-error" id={errorId('mqtt.url')}>{errors['mqtt.url']}</small>}
            </label>
            <label className="field">
              <span>MQTT topic</span>
              <input
                id="settings-mqtt-topic"
                type="text"
                value={draft.mqtt.topic}
                onChange={(event) => setMqtt('topic', event.target.value)}
                aria-invalid={Boolean(errors['mqtt.topic'])}
                aria-describedby={errors['mqtt.topic'] ? errorId('mqtt.topic') : undefined}
              />
              {errors['mqtt.topic'] && <small className="field-error" id={errorId('mqtt.topic')}>{errors['mqtt.topic']}</small>}
            </label>
          </div>
          <p className="field-hint">
            This public broker is unauthenticated and world-readable. Use a unique topic and never publish sensitive data.
          </p>
          {insecureWs && <p className="settings-warning">ws:// will be blocked on this HTTPS page; use wss://.</p>}
        </fieldset>

        <fieldset className="panel settings-section">
          <legend>Demo mode</legend>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.demo.enabled}
              onChange={(event) => setDemo('enabled', event.target.checked)}
            />
            Enable demo mode
          </label>
          <label className="field field--narrow">
            <span>Demo update interval</span>
            <select
              id="settings-demo-intervalMs"
              value={draft.demo.intervalMs}
              onChange={(event) => setDemo('intervalMs', Number(event.target.value))}
              aria-invalid={Boolean(errors['demo.intervalMs'])}
              aria-describedby={errors['demo.intervalMs'] ? errorId('demo.intervalMs') : undefined}
            >
              {INTERVALS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {errors['demo.intervalMs'] && <small className="field-error" id={errorId('demo.intervalMs')}>{errors['demo.intervalMs']}</small>}
          </label>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn--accent">Save settings</button>
          {saved && <p className="saved" role="status">Saved</p>}
        </div>
      </form>

      <section className="panel settings-section" aria-labelledby="data-title">
        <div className="panel-head"><h2 id="data-title">Data</h2></div>
        <p className="data-row">
          <span>Stored readings: {formatCount(readings.length)} / {formatCount(LIMITS.readings)}</span>
          <span className="data-actions">
            <button type="button" className="btn btn--ghost" onClick={clear}>Clear history</button>
            <button type="button" className="btn btn--ghost" onClick={reset}>Reset to defaults</button>
          </span>
        </p>
      </section>
    </section>
  );
}
