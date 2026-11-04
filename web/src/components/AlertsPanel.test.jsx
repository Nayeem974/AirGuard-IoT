import { render, screen } from '@testing-library/react';
import AlertsPanel from './AlertsPanel.jsx';

test('shows active alerts', () => {
  render(<AlertsPanel statuses={{ air: 'danger', gas: 'good', dust: 'good' }} alerts={[]} />);
  expect(screen.getByText(/Air quality/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Danger/i).length).toBeGreaterThan(0);
});

test('shows the empty state', () => {
  render(<AlertsPanel statuses={{ air: 'good', gas: 'good', dust: 'good' }} alerts={[]} />);
  expect(screen.getByText('No alerts this session.')).toBeInTheDocument();
});

test('labels demo alerts', () => {
  render(
    <AlertsPanel
      statuses={{ air: 'good', gas: 'good', dust: 'good' }}
      alerts={[{ id: '1', ts: 0, level: 'danger', metric: 'gas', value: 600, message: 'Combustible gas detected', source: 'demo' }]}
    />,
  );
  expect(screen.getByText('Combustible gas detected')).toBeInTheDocument();
  expect(screen.getByText('SIM')).toBeInTheDocument();
});
