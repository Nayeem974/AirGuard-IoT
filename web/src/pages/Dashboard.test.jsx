import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelemetryProvider } from '../context/TelemetryContext.jsx';
import { memoryStorage } from '../test/memoryStorage.js';
import Dashboard from './Dashboard.jsx';

vi.mock('../lib/mqttConnection', () => ({ createMqttConnection: vi.fn(() => ({ close: vi.fn() })) }));
vi.mock('../components/TrendChart', () => ({ default: () => <div data-testid="trend-chart" /> }));

function renderDashboard() {
  const fixedRandom = () => 0.5;
  return render(
    <TelemetryProvider storage={memoryStorage()} random={fixedRandom}>
      <Dashboard />
    </TelemetryProvider>,
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T10:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('starts empty and fills from demo mode', () => {
    renderDashboard();
    expect(screen.getByRole('status')).toHaveTextContent('Waiting for data');
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole('heading', { name: 'Air quality' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Oxygen' })).toBeInTheDocument();
    expect(screen.getAllByText('SIM').length).toBeGreaterThan(0);
  });

  it('marks oxygen as not installed in live mode until a payload supplies it', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Turn demo off' }));
    const card = screen.getByRole('heading', { name: 'Oxygen' }).closest('article');
    expect(card).toHaveTextContent('Not installed — Phase 2 (A2 reserved)');
    expect(card).toHaveAttribute('data-unavailable');
  });

  it('does not tag cards as live before any reading arrives', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Turn demo off' }));
    expect(screen.getAllByText('NO DATA').length).toBeGreaterThan(0);
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
  });

  it('raises and clears the danger banner during a simulated leak', () => {
    renderDashboard();
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.click(screen.getByRole('button', { name: 'Simulate gas leak' }));
    expect(screen.getByRole('button', { name: 'Simulate gas leak' })).toBeDisabled();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole('status')).toHaveTextContent('Hazardous conditions detected');
    act(() => vi.advanceTimersByTime(14000));
    expect(screen.getByRole('status')).toHaveTextContent('Air is clear');
  });
});
