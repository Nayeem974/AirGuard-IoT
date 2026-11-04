import { render, screen } from '@testing-library/react';
import ConnectionPill from './ConnectionPill.jsx';

test.each([
  ['demo', 'Demo'],
  ['connecting', 'Connecting'],
  ['live', 'Live'],
  ['reconnecting', 'Reconnecting'],
  ['offline', 'Offline'],
  ['error', 'Error'],
])('renders %s as %s', (state, label) => {
  render(<ConnectionPill state={state} />);
  expect(screen.getByText(label)).toBeInTheDocument();
});
