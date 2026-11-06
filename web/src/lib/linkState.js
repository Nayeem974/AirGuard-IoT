// User-facing connection state: broker status combined with whether data is actually arriving.
export const LINK_LABELS = {
  demo: 'Demo',
  connecting: 'Connecting',
  reconnecting: 'Reconnecting',
  broker: 'Broker connected',
  waiting: 'Waiting for device data',
  data: 'Live data',
  disconnected: 'Disconnected',
  error: 'Error',
};

export function deriveLink({ source, connectionState, sessionLive, stale }) {
  if (source === 'demo') return 'demo';
  if (connectionState === 'live') {
    if (!sessionLive) return 'broker';
    return stale ? 'waiting' : 'data';
  }
  if (connectionState === 'offline') return 'disconnected';
  if (connectionState === 'error') return 'error';
  if (connectionState === 'reconnecting') return 'reconnecting';
  return 'connecting';
}
