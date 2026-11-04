import { render, screen, within } from '@testing-library/react';
import App from './App.jsx';

test('renders navigation and the demo badge', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '#/');
  expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '#/history');
  expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '#/settings');
  const header = within(screen.getByRole('banner'));
  expect(header.getByText('SIMULATED')).toBeInTheDocument();
  expect(header.getByText('Demo')).toBeInTheDocument();
});
