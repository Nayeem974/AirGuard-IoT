import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TrendChart from './TrendChart.jsx';

vi.mock('react-chartjs-2', () => ({
  Line: ({ data }) => (
    <div data-testid="line" data-label={data.datasets[0].label} data-points={data.datasets[0].data.length} />
  ),
}));

const now = 1_000_000;
const readings = [
  { ts: now - 1000, source: 'demo', aqi: 100, gas: 100, dust: 10, temp: 27, hum: 60 },
  { ts: now - 2000, source: 'demo', aqi: 120, gas: 110, dust: 12, temp: 27, hum: 61 },
  { ts: now - 600000, source: 'demo', aqi: 140, gas: 120, dust: 14, temp: 27, hum: 62 },
];

describe('TrendChart', () => {
  it('switches metric and filters by range', () => {
    render(<TrendChart readings={readings} now={now} />);
    expect(screen.getByTestId('line')).toHaveAttribute('data-label', 'Air');
    fireEvent.click(screen.getByRole('button', { name: 'Dust' }));
    expect(screen.getByTestId('line')).toHaveAttribute('data-label', 'Dust');
    fireEvent.click(screen.getByRole('button', { name: '5m' }));
    expect(screen.getByTestId('line')).toHaveAttribute('data-points', '2');
  });

  it('grid layout shows every metric together and applies the range to all', () => {
    render(<TrendChart readings={readings} now={now} layout="grid" />);
    expect(screen.getAllByTestId('line').map((el) => el.getAttribute('data-label'))).toEqual(['Air', 'Gas', 'Dust', 'Temperature', 'Humidity']);
    expect(screen.queryByRole('group', { name: 'Chart metric' })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('line')[0]).toHaveAttribute('data-points', '3');
    fireEvent.click(screen.getByRole('button', { name: '5m' }));
    screen.getAllByTestId('line').forEach((el) => expect(el).toHaveAttribute('data-points', '2'));
  });

  it('grid layout shows the newest reading by timestamp on each card', () => {
    render(<TrendChart readings={readings} now={now} layout="grid" />);
    expect(screen.getByRole('heading', { name: 'Dust' }).closest('article')).toHaveTextContent('10.0');
  });
});
