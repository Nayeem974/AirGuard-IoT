const LABELS = {
  demo: 'Demo',
  connecting: 'Connecting',
  live: 'Live',
  reconnecting: 'Reconnecting',
  offline: 'Offline',
  error: 'Error',
};

export default function ConnectionPill({ state }) {
  const label = LABELS[state] ?? LABELS.offline;
  return (
    <span className="pill" data-state={state}>
      <span className="pill-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
