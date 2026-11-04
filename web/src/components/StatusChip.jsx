const LABELS = { good: 'Good', warning: 'Warning', danger: 'Danger' };

export default function StatusChip({ level }) {
  return (
    <span className="chip" data-level={level}>
      <span className="chip-dot" aria-hidden="true" />
      {LABELS[level] ?? LABELS.good}
    </span>
  );
}
