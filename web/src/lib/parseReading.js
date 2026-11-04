import { LIMITS, RANGES } from './constants.js';

export function parseReading(raw, { source = 'live', now = Date.now() } = {}) {
  if (typeof raw !== 'string' || raw.length > LIMITS.payloadChars) {
    return { ok: false, error: 'Payload too large or not text' };
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Payload must be an object' };
  }
  const reading = { ts: now, source };
  for (const key of ['temp', 'hum', 'aqi', 'gas', 'dust']) {
    const value = data[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { ok: false, error: `Missing or invalid ${key}` };
    }
    if (value < RANGES[key].min || value > RANGES[key].max) {
      return { ok: false, error: `${key} out of range` };
    }
    reading[key] = value;
  }
  if ('o2' in data) {
    const value = data.o2;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < RANGES.o2.min || value > RANGES.o2.max) {
      return { ok: false, error: 'Invalid o2' };
    }
    reading.o2 = value;
  }
  return { ok: true, reading };
}
