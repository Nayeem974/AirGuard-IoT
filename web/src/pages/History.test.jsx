import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import History from './History.jsx';
import { useTelemetry } from '../hooks/useTelemetry.js';
import { downloadCsv } from '../lib/csv.js';

vi.mock('../hooks/useTelemetry', () => ({ useTelemetry: vi.fn() }));
vi.mock('../lib/csv', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, downloadCsv: vi.fn() };
});

const now = new Date('2026-11-02T10:00:00Z').getTime();
const readings = [
  { ts: now - 1000, source: 'live', aqi: 100, gas: 90, dust: 10, temp: 27, hum: 60 },
  { ts: now - 600000, source: 'demo', aqi: 200, gas: 190, dust: 20, temp: 28, hum: 61 },
];

function renderHistory(overrides = {}) {
  useTelemetry.mockReturnValue({ readings, clearHistory: vi.fn(), now, ...overrides });
  return render(
    <MemoryRouter>
      <History />
    </MemoryRouter>,
  );
}

describe('History', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders rows and filters by range', () => {
    renderHistory();
    expect(screen.getAllByRole('row')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: '5m' }));
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('filters by source', () => {
    renderHistory();
    fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'demo' } });
    expect(within(screen.getByRole('table')).getByText('Demo')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('exports the filtered rows', () => {
    renderHistory();
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(downloadCsv).toHaveBeenCalledWith('airguard-history.csv', expect.stringContaining('air_raw'));
  });

  it('clears history after confirmation', () => {
    const clearHistory = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderHistory({ clearHistory });
    fireEvent.click(screen.getByRole('button', { name: 'Clear history' }));
    expect(clearHistory).toHaveBeenCalled();
  });

  it('shows the empty state', () => {
    renderHistory({ readings: [] });
    expect(screen.getByText('No readings yet.')).toBeInTheDocument();
  });
});
