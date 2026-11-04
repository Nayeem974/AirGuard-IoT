import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DevicePanel from './DevicePanel.jsx';
import { DEFAULT_SETTINGS } from '../lib/constants.js';

test('shows connection details, age and rejected count', () => {
  const now = 10000;
  render(
    <DevicePanel
      connection={{ state: 'live' }}
      settings={DEFAULT_SETTINGS}
      latest={{ ts: 6000 }}
      readingsCount={12}
      rejected={2}
      source="live"
      stale={false}
      now={now}
      onRetry={vi.fn()}
    />,
  );
  expect(screen.getByText('wss://broker.hivemq.com:8884/mqtt')).toBeInTheDocument();
  expect(screen.getByText('airguard/telemetry')).toBeInTheDocument();
  expect(screen.getByText('4s ago')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText(/Local buzzer\/LEDs follow air \+ gas thresholds only/)).toBeInTheDocument();
});

test('offers retry on connection error', () => {
  const onRetry = vi.fn();
  render(
    <DevicePanel
      connection={{ state: 'error', error: 'boom' }}
      settings={DEFAULT_SETTINGS}
      latest={null}
      readingsCount={0}
      rejected={0}
      source="live"
      stale={false}
      now={0}
      onRetry={onRetry}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(onRetry).toHaveBeenCalled();
});
