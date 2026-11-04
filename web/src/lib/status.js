import { LIMITS } from './constants.js';

export function statusFor(value, { warn, danger } = {}) {
  if (danger != null && value > danger) return 'danger';
  if (warn != null && value > warn) return 'warning';
  return 'good';
}

export function getStatuses(reading, thresholds) {
  return {
    air: statusFor(reading.aqi, { warn: thresholds.airWarn, danger: thresholds.airDanger }),
    gas: statusFor(reading.gas, { danger: thresholds.gasDanger }),
    dust: statusFor(reading.dust, { warn: thresholds.dustWarn, danger: thresholds.dustDanger }),
  };
}

export function overallStatus(statuses) {
  const rank = { good: 0, warning: 1, danger: 2 };
  return ['air', 'gas', 'dust'].reduce(
    (worst, key) => (rank[statuses[key]] > rank[worst] ? statuses[key] : worst),
    'good',
  );
}

export function isStaleAt(lastTs, now, staleMs = LIMITS.staleMs) {
  return typeof lastTs === 'number' && now - lastTs > staleMs;
}
