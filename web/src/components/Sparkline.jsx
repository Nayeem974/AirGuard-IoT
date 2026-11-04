export default function Sparkline({ values, level = 'good' }) {
  if (!values || values.length < 2) return null;
  const points = values
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => Number.isFinite(value));
  if (points.length < 2) return null;
  const min = Math.min(...points.map(({ value }) => value));
  const max = Math.max(...points.map(({ value }) => value));
  const spread = max - min || 1;
  const polyline = points
    .map(({ value, index }) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 25 - ((value - min) / spread) * 22;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg className={`sparkline sparkline--${level}`} viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
