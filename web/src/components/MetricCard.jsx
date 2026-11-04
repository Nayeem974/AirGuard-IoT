import Sparkline from './Sparkline.jsx';
import StatusChip from './StatusChip.jsx';

export default function MetricCard({
  label,
  icon,
  value,
  unit,
  decimals = 0,
  status,
  footnote,
  sparkValues = [],
  tag,
  unavailable = false,
  unavailableText,
}) {
  const display = unavailable || value == null ? '—' : Number(value).toFixed(decimals);

  return (
    <article className="metric-card" data-level={status ?? 'idle'} data-unavailable={unavailable || undefined}>
      <div className="metric-head">
        <span className="metric-icon" aria-hidden="true">{icon}</span>
        <h3>{label}</h3>
        {tag && <span className="metric-tag">{tag}</span>}
      </div>
      <div className="metric-reading">
        <span className="metric-value">{display}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {status && <StatusChip level={status} />}
      <Sparkline values={sparkValues} level={status} />
      {unavailable && unavailableText && <p className="metric-unavailable">{unavailableText}</p>}
      {footnote && <p className="metric-footnote">{footnote}</p>}
    </article>
  );
}
