import { DEFAULT_SETTINGS } from './constants.js';

const FIELD_MAX = {
  airWarn: 1023,
  airDanger: 1023,
  gasDanger: 1023,
  dustWarn: 1000,
  dustDanger: 1000,
};

const INTERVALS = [1000, 3000, 5000];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validMqttUrl(value) {
  const text = typeof value === 'string' ? value.trim() : value;
  if (typeof text !== 'string' || text.length === 0 || text.length > 256) return false;
  try {
    const { protocol } = new URL(text);
    return protocol === 'ws:' || protocol === 'wss:';
  } catch {
    return false;
  }
}

function validTopic(value) {
  return typeof value === 'string' && value.length >= 1 && value.length <= 128 && !/\s/.test(value);
}

function toWhole(value, max) {
  let number;
  if (typeof value === 'number') number = value;
  else if (typeof value === 'string' && /^\d+$/.test(value.trim())) number = Number(value.trim());
  else return null;
  if (!Number.isInteger(number) || number < 0 || number > max) return null;
  return number;
}

export function normalizeSettings(input) {
  const result = clone(DEFAULT_SETTINGS);
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result;

  const thresholds = input.thresholds;
  if (thresholds && typeof thresholds === 'object') {
    for (const [key, max] of Object.entries(FIELD_MAX)) {
      const value = thresholds[key];
      if (Number.isInteger(value) && value >= 0 && value <= max) result.thresholds[key] = value;
    }
  }
  if (result.thresholds.airWarn >= result.thresholds.airDanger) {
    result.thresholds.airWarn = DEFAULT_SETTINGS.thresholds.airWarn;
    result.thresholds.airDanger = DEFAULT_SETTINGS.thresholds.airDanger;
  }
  if (result.thresholds.dustWarn >= result.thresholds.dustDanger) {
    result.thresholds.dustWarn = DEFAULT_SETTINGS.thresholds.dustWarn;
    result.thresholds.dustDanger = DEFAULT_SETTINGS.thresholds.dustDanger;
  }

  const mqtt = input.mqtt;
  if (mqtt && typeof mqtt === 'object') {
    if (validMqttUrl(mqtt.url)) result.mqtt.url = mqtt.url.trim();
    if (validTopic(mqtt.topic)) result.mqtt.topic = mqtt.topic;
  }

  const demo = input.demo;
  if (demo && typeof demo === 'object') {
    if (typeof demo.enabled === 'boolean') result.demo.enabled = demo.enabled;
    if (INTERVALS.includes(demo.intervalMs)) result.demo.intervalMs = demo.intervalMs;
  }

  return result;
}

export function validateSettings(draft) {
  const errors = {};
  const source = draft && typeof draft === 'object' ? draft : {};
  const thresholds = source.thresholds && typeof source.thresholds === 'object' ? source.thresholds : {};
  const values = {};

  for (const [key, max] of Object.entries(FIELD_MAX)) {
    const value = toWhole(thresholds[key], max);
    if (value === null) errors[key] = `Enter a whole number from 0 to ${max}.`;
    else values[key] = value;
  }

  if (values.airWarn != null && values.airDanger != null && !errors.airWarn && !errors.airDanger) {
    if (values.airWarn >= values.airDanger) errors.airWarn = 'Air warning must be lower than air danger.';
  }
  if (values.dustWarn != null && values.dustDanger != null && !errors.dustWarn && !errors.dustDanger) {
    if (values.dustWarn >= values.dustDanger) errors.dustWarn = 'Dust warning must be lower than dust danger.';
  }

  const mqtt = source.mqtt && typeof source.mqtt === 'object' ? source.mqtt : {};
  if (!validMqttUrl(mqtt.url)) errors['mqtt.url'] = 'Enter a ws:// or wss:// URL.';
  if (!validTopic(mqtt.topic)) errors['mqtt.topic'] = 'Enter a topic of 1–128 characters with no spaces.';

  const demo = source.demo && typeof source.demo === 'object' ? source.demo : {};
  const interval = Number(demo.intervalMs);
  if (!INTERVALS.includes(interval)) errors['demo.intervalMs'] = 'Choose a demo interval of 1, 3 or 5 seconds.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    settings: {
      thresholds: values,
      mqtt: { url: mqtt.url.trim(), topic: mqtt.topic },
      demo: { enabled: demo.enabled === true, intervalMs: interval },
    },
  };
}
