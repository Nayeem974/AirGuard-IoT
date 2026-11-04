import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '../test/memoryStorage.js';
import { TelemetryProvider } from './TelemetryContext.jsx';
import { useTelemetry } from '../hooks/useTelemetry.js';
import { KEYS, loadJSON } from '../lib/storage.js';

vi.mock('../lib/mqttConnection', () => ({ createMqttConnection: vi.fn() }));
import { createMqttConnection } from '../lib/mqttConnection.js';

function Probe() {
  const t = useTelemetry();
  return (
    <div>
      <output data-testid="latest">{t.latest ? `${t.latest.source}:${t.latest.gas}` : 'none'}</output>
      <output data-testid="overall">{t.overall ?? 'none'}</output>
      <output data-testid="connection">{t.connection.state}</output>
      <output data-testid="stale">{String(t.isStale)}</output>
      <output data-testid="leak">{String(t.leakActive)}</output>
      <output data-testid="alerts">{t.alerts.length}</output>
      <output data-testid="rejected">{t.rejected}</output>
      <output data-testid="readings">{t.readings.length}</output>
      <output data-testid="persistFailed">{String(t.persistFailed)}</output>
      <button onClick={t.triggerLeak}>leak</button>
      <button onClick={t.resetSettings}>reset</button>
      <button onClick={t.clearHistory}>clear</button>
      <button
        onClick={() =>
          t.updateSettings({ ...t.settings, demo: { ...t.settings.demo, enabled: false } })
        }
      >
        live
      </button>
      <button
        onClick={() =>
          t.updateSettings({ ...t.settings, demo: { ...t.settings.demo, enabled: true } })
        }
      >
        demo
      </button>
    </div>
  );
}

function renderProbe() {
  const fixedRandom = () => 0.5;
  const storage = memoryStorage();
  return {
    storage,
    ...render(
      <TelemetryProvider storage={storage} random={fixedRandom}>
        <Probe />
      </TelemetryProvider>,
    ),
  };
}

describe('TelemetryProvider', () => {
  let fake;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T10:00:00Z'));
    createMqttConnection.mockReset();
    createMqttConnection.mockImplementation(({ onMessage, onStatus }) => {
      fake = { onMessage, onStatus, close: vi.fn() };
      return fake;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates demo readings, raises a gas alert and recovers', () => {
    renderProbe();
    expect(screen.getByTestId('latest')).toHaveTextContent('none');
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId('latest')).toHaveTextContent('demo:');
    expect(screen.getByTestId('overall')).toHaveTextContent('good');

    fireEvent.click(screen.getByText('leak'));
    expect(screen.getByTestId('leak')).toHaveTextContent('true');
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId('overall')).toHaveTextContent('danger');
    expect(screen.getByTestId('alerts')).toHaveTextContent('1');

    act(() => vi.advanceTimersByTime(14000));
    expect(screen.getByTestId('leak')).toHaveTextContent('false');
    expect(screen.getByTestId('overall')).toHaveTextContent('good');
    expect(screen.getByTestId('alerts')).toHaveTextContent('2');
  });

  it('switches to live, accepts a message and goes stale', () => {
    renderProbe();
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.click(screen.getByText('live'));
    expect(screen.getByTestId('connection')).toHaveTextContent('connecting');
    expect(createMqttConnection).toHaveBeenCalled();

    act(() => fake.onStatus({ state: 'live' }));
    act(() => fake.onMessage('{"temp":28,"hum":60,"aqi":100,"gas":100,"dust":10}'));
    expect(screen.getByTestId('latest')).toHaveTextContent('live:100');
    expect(screen.getByTestId('stale')).toHaveTextContent('false');

    act(() => vi.advanceTimersByTime(16001));
    expect(screen.getByTestId('stale')).toHaveTextContent('true');

    act(() => fake.onMessage('{"temp":28,"hum":60,"aqi":100,"gas":100,"dust":10}'));
    expect(screen.getByTestId('stale')).toHaveTextContent('false');
  });

  it('counts rejected live packets without replacing the last good reading', () => {
    renderProbe();
    fireEvent.click(screen.getByText('live'));
    act(() => fake.onMessage('{"temp":28,"hum":60,"aqi":100,"gas":100,"dust":10}'));
    act(() => fake.onMessage('{"temp":28,"hum":60,"aqi":1024,"gas":100,"dust":10}'));

    expect(screen.getByTestId('latest')).toHaveTextContent('live:100');
    expect(screen.getByTestId('rejected')).toHaveTextContent('1');
  });

  it('caps stored readings at 3,600 and alerts at 50', () => {
    renderProbe();
    fireEvent.click(screen.getByText('live'));
    act(() => {
      for (let i = 0; i < 3601; i += 1) {
        fake.onMessage('{"temp":28,"hum":60,"aqi":100,"gas":100,"dust":10}');
      }
    });
    expect(screen.getByTestId('readings')).toHaveTextContent('3600');

    act(() => {
      for (let i = 0; i < 60; i += 1) {
        fake.onMessage(`{"temp":28,"hum":60,"aqi":100,"gas":${i % 2 ? 100 : 600},"dust":10}`);
      }
    });
    expect(screen.getByTestId('alerts')).toHaveTextContent('50');
  }, 20000);

  it('clears history and removes persisted keys', () => {
    const { storage } = renderProbe();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId('readings')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('readings')).toHaveTextContent('0');
    expect(loadJSON(KEYS.readings, 'missing', storage)).toBe('missing');
    expect(loadJSON(KEYS.alerts, 'missing', storage)).toBe('missing');
  });

  it('closes the MQTT connection when demo is re-enabled', () => {
    renderProbe();
    fireEvent.click(screen.getByText('live'));
    expect(fake.close).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('demo'));
    expect(fake.close).toHaveBeenCalled();
  });

  it('surfaces a failed storage write instead of silently dropping data', () => {
    const { storage } = renderProbe();
    expect(screen.getByTestId('persistFailed')).toHaveTextContent('false');

    storage.setItem = () => {
      throw new Error('quota');
    };
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId('persistFailed')).toHaveTextContent('true');
  });

  it('restarts the demo generator when settings reset during a leak', () => {
    renderProbe();
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.click(screen.getByText('leak'));
    expect(screen.getByTestId('leak')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('reset'));
    expect(screen.getByTestId('leak')).toHaveTextContent('false');
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId('overall')).toHaveTextContent('good');
  });
});
