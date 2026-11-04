import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Settings from './Settings.jsx';
import { useTelemetry } from '../hooks/useTelemetry.js';
import { DEFAULT_SETTINGS } from '../lib/constants.js';

vi.mock('../hooks/useTelemetry', () => ({ useTelemetry: vi.fn() }));

const updateSettings = vi.fn(() => ({ ok: true }));
const resetSettings = vi.fn();
const clearHistory = vi.fn();

function renderSettings(overrides = {}) {
  useTelemetry.mockReturnValue({
    settings: DEFAULT_SETTINGS,
    updateSettings,
    resetSettings,
    clearHistory,
    storageAvailable: true,
    readings: [],
    ...overrides,
  });
  return render(<Settings />);
}

describe('Settings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('blocks a non-ws broker URL', async () => {
    renderSettings();
    const url = screen.getByLabelText('Broker WebSocket URL');
    fireEvent.change(url, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(screen.getByText('Enter a ws:// or wss:// URL.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Check the highlighted fields');
    await waitFor(() => expect(url).toHaveFocus());
    expect(updateSettings).not.toHaveBeenCalled();
  });

  it('saves valid changes', () => {
    renderSettings();
    fireEvent.change(screen.getByLabelText('Broker WebSocket URL'), { target: { value: 'wss://example.com/mqtt' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ mqtt: expect.objectContaining({ url: 'wss://example.com/mqtt' }) }),
    );
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('resets and clears', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Reset to defaults' }));
    expect(resetSettings).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear history' }));
    expect(clearHistory).toHaveBeenCalled();
  });

  it('warns when storage is unavailable', () => {
    renderSettings({ storageAvailable: false });
    expect(screen.getByText(/will not persist/i)).toBeInTheDocument();
  });

  it('shows the stored reading count', () => {
    renderSettings({ readings: [{ ts: 1 }, { ts: 2 }] });
    expect(screen.getByText('Stored readings: 2 / 3,600')).toBeInTheDocument();
  });
});
