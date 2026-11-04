import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard.jsx';

test('shows the unavailable oxygen placeholder', () => {
  render(
    <MetricCard
      label="Oxygen"
      value={null}
      unit="%"
      unavailable
      unavailableText="Not installed — Phase 2 (A2 reserved)"
      tag="NOT INSTALLED"
    />,
  );
  expect(screen.getByRole('heading', { name: 'Oxygen' })).toBeInTheDocument();
  expect(screen.getByText('—')).toBeInTheDocument();
  expect(screen.getByText('Not installed — Phase 2 (A2 reserved)')).toBeInTheDocument();
  expect(screen.getByText('NOT INSTALLED')).toBeInTheDocument();
});

test('shows a value, status and simulated tag', () => {
  render(
    <MetricCard label="Air quality" value={342} unit="raw" status="warning" tag="SIM" footnote="Warn > 300" />,
  );
  expect(screen.getByText('342')).toBeInTheDocument();
  expect(screen.getByText('Warning')).toBeInTheDocument();
  expect(screen.getByText('SIM')).toBeInTheDocument();
});
