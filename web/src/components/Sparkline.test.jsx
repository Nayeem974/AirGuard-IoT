import { render } from '@testing-library/react';
import Sparkline from './Sparkline.jsx';

test('renders nothing when no finite values exist', () => {
  const { container } = render(<Sparkline values={[undefined, undefined, null]} />);
  expect(container.querySelector('polyline')).toBeNull();
});

test('skips gaps without emitting NaN coordinates', () => {
  const { container } = render(<Sparkline values={[1, undefined, 3]} />);
  const points = container.querySelector('polyline').getAttribute('points');
  expect(points).not.toContain('NaN');
  expect(points.split(' ')).toHaveLength(2);
});
