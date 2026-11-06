import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTelemetry } from '../hooks/useTelemetry.js';
import { memoryStorage } from '../test/memoryStorage.js';
import { TelemetryProvider } from './TelemetryContext.jsx';

vi.mock('../lib/mqttConnection', () => ({ createMqttConnection: vi.fn() }));
import { createMqttConnection } from '../lib/mqttConnection.js';

function Probe() {
  const t = useTelemetry();
  return (
    <div>
      <output data-testid="link">{t.link}</output>
      <button onClick={() => t.updateSettings({ ...t.settings, demo: { ...t.settings.demo, enabled: false } })}>live</button>
    </div>
  );
}

const PAYLOAD = JSON.stringify({ temp: 27, hum: 60, aqi: 150, gas: 90, dust: 20 });

describe('connection link states', () => {
  let handlers;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-04T10:00:00Z'));
    createMqttConnection.mockImplementation((options) => {
      handlers = options;
      return { close: vi.fn() };
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('only reports live data after a real message, and falls back when data stops', () => {
    render(<TelemetryProvider storage={memoryStorage()}><Probe /></TelemetryProvider>);
    expect(screen.getByTestId('link')).toHaveTextContent('demo');

    fireEvent.click(screen.getByRole('button', { name: 'live' }));
    expect(screen.getByTestId('link')).toHaveTextContent('connecting');

    act(() => handlers.onStatus({ state: 'live' }));
    expect(screen.getByTestId('link')).toHaveTextContent('broker');

    act(() => handlers.onMessage(PAYLOAD));
    expect(screen.getByTestId('link')).toHaveTextContent('data');

    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByTestId('link')).toHaveTextContent('waiting');

    act(() => handlers.onStatus({ state: 'offline' }));
    expect(screen.getByTestId('link')).toHaveTextContent('disconnected');

    act(() => handlers.onStatus({ state: 'error', error: 'boom' }));
    expect(screen.getByTestId('link')).toHaveTextContent('error');
  });

  it('does not count an invalid payload as data', () => {
    render(<TelemetryProvider storage={memoryStorage()}><Probe /></TelemetryProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'live' }));
    act(() => handlers.onStatus({ state: 'live' }));
    act(() => handlers.onMessage('not json'));
    expect(screen.getByTestId('link')).toHaveTextContent('broker');
  });
});
