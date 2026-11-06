import { render, screen } from '@testing-library/react';
import StatusBanner from './StatusBanner.jsx';

const latest = { ts: new Date('2026-11-02T10:00:00Z').getTime() };

test('shows the danger headline', () => {
  render(<StatusBanner overall="danger" latest={latest} demo={false} stale={false} />);
  expect(screen.getByRole('status')).toHaveTextContent('Hazardous conditions detected');
});

test('shows the empty state without a reading', () => {
  render(<StatusBanner overall={null} latest={null} demo />);
  expect(screen.getByRole('status')).toHaveTextContent('Waiting for data');
});

test('marks simulated and stale data', () => {
  const { rerender } = render(<StatusBanner overall="good" latest={latest} demo stale={false} />);
  expect(screen.getByRole('status')).toHaveTextContent('Simulated');
  expect(screen.getByRole('status')).not.toHaveTextContent('Last update');
  rerender(<StatusBanner overall="good" latest={latest} demo={false} stale />);
  expect(screen.getByRole('status')).toHaveTextContent('No data from the station');
});

test.each([
  ['broker', 'Broker connected'],
  ['disconnected', 'Disconnected from the broker'],
  ['error', 'Connection error'],
  ['connecting', 'Connecting to the broker'],
])('explains the %s link state when there is no reading', (link, title) => {
  render(<StatusBanner overall={null} latest={null} link={link} />);
  expect(screen.getByRole('status')).toHaveTextContent(title);
});
