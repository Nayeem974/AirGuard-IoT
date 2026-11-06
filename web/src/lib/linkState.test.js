import { deriveLink } from './linkState.js';

const base = { source: 'live', connectionState: 'live', sessionLive: false, stale: false };

test.each([
  [{ source: 'demo' }, 'demo'],
  [{ connectionState: 'connecting' }, 'connecting'],
  [{ connectionState: 'reconnecting' }, 'reconnecting'],
  [{ connectionState: 'live' }, 'broker'],
  [{ connectionState: 'live', sessionLive: true }, 'data'],
  [{ connectionState: 'live', sessionLive: true, stale: true }, 'waiting'],
  [{ connectionState: 'offline' }, 'disconnected'],
  [{ connectionState: 'error' }, 'error'],
])('derives link for %j as %s', (patch, expected) => {
  expect(deriveLink({ ...base, ...patch })).toBe(expected);
});

test('a connected broker alone never reports live data', () => {
  expect(deriveLink({ ...base, stale: true })).toBe('broker');
});
