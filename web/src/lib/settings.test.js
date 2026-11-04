import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from './constants.js';
import { normalizeSettings, validateSettings } from './settings.js';

describe('normalizeSettings', () => {
  it('returns defaults for null', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid fields and falls back per field', () => {
    const result = normalizeSettings({
      thresholds: { airWarn: 250, airDanger: 'bad' },
      mqtt: { url: 'wss://example.com/mqtt', topic: 'lab/telemetry' },
      demo: { enabled: false, intervalMs: 1000 },
    });
    expect(result.thresholds.airWarn).toBe(250);
    expect(result.thresholds.airDanger).toBe(500);
    expect(result.mqtt.topic).toBe('lab/telemetry');
    expect(result.demo).toEqual({ enabled: false, intervalMs: 1000 });
  });
});

describe('validateSettings', () => {
  it('rejects a non-ws URL', () => {
    const result = validateSettings({ ...DEFAULT_SETTINGS, mqtt: { ...DEFAULT_SETTINGS.mqtt, url: 'https://x' } });
    expect(result.ok).toBe(false);
    expect(result.errors['mqtt.url']).toMatch(/ws:\/\//);
  });

  it('rejects warning >= danger', () => {
    const result = validateSettings({
      ...DEFAULT_SETTINGS,
      thresholds: { ...DEFAULT_SETTINGS.thresholds, airWarn: 600, airDanger: 500 },
    });
    expect(result.ok).toBe(false);
    expect(result.errors.airWarn).toMatch(/lower/);
  });

  it('accepts numeric strings from form inputs and normalizes them', () => {
    const result = validateSettings({
      ...DEFAULT_SETTINGS,
      thresholds: { airWarn: '250', airDanger: '450', gasDanger: '400', dustWarn: '40', dustDanger: '120' },
    });
    expect(result.ok).toBe(true);
    expect(result.settings.thresholds.airWarn).toBe(250);
  });

  it('trims surrounding whitespace from a valid broker URL', () => {
    const result = validateSettings({
      ...DEFAULT_SETTINGS,
      mqtt: { url: '  wss://example.com/mqtt  ', topic: 'lab/telemetry' },
    });
    expect(result.ok).toBe(true);
    expect(result.settings.mqtt.url).toBe('wss://example.com/mqtt');
  });
});
