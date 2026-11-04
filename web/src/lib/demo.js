import { RANGES } from './constants.js';

const BASELINE = {
  temp: 27.5,
  hum: 65,
  aqi: 180,
  gas: 140,
  dust: 28,
  o2: 20.9,
};

const WALK = {
  temp: 0.6,
  hum: 1.2,
  aqi: 12,
  gas: 8,
  dust: 4,
  o2: 0.05,
};

// Pull each value back toward baseline so demo mode stays boring without a triggered leak.
const REVERSION = 0.1;

const LEAK_START = 140;
const LEAK_PEAK = 650;
const RAMP_MS = 3000;
const HOLD_MS = 7000;
const DECAY_MS = 4000;
const LEAK_MS = RAMP_MS + HOLD_MS + DECAY_MS;

function clamp(value, { min, max }) {
  return Math.min(max, Math.max(min, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function leakGas(elapsed) {
  if (elapsed < RAMP_MS) return LEAK_START + ((LEAK_PEAK - LEAK_START) * elapsed) / RAMP_MS;
  if (elapsed < RAMP_MS + HOLD_MS) return LEAK_PEAK;
  const progress = (elapsed - RAMP_MS - HOLD_MS) / DECAY_MS;
  return Math.max(LEAK_START, LEAK_PEAK - (LEAK_PEAK - LEAK_START) * progress);
}

export function createDemoGenerator({ random = Math.random } = {}) {
  const state = { ...BASELINE };
  let leakStartedAt = null;

  function step(value, baseline, walk, range) {
    return clamp(value + (baseline - value) * REVERSION + (random() * 2 - 1) * walk, range);
  }

  function next(now = Date.now()) {
    if (leakStartedAt != null && now - leakStartedAt >= LEAK_MS) {
      leakStartedAt = null;
      state.gas = BASELINE.gas;
    }

    const leaking = leakStartedAt != null;
    if (!leaking) {
      state.gas = step(state.gas, BASELINE.gas, WALK.gas, RANGES.gas);
    }
    state.temp = step(state.temp, BASELINE.temp, WALK.temp, RANGES.temp);
    state.hum = step(state.hum, BASELINE.hum, WALK.hum, RANGES.hum);
    state.aqi = step(state.aqi, BASELINE.aqi, WALK.aqi, RANGES.aqi);
    state.dust = step(state.dust, BASELINE.dust, WALK.dust, RANGES.dust);
    state.o2 = step(state.o2, BASELINE.o2, WALK.o2, RANGES.o2);

    const gas = leaking ? leakGas(now - leakStartedAt) : state.gas;

    return {
      ts: now,
      source: 'demo',
      temp: round1(state.temp),
      hum: round1(state.hum),
      aqi: Math.round(state.aqi),
      gas: Math.round(gas),
      dust: round1(state.dust),
      o2: round1(state.o2),
    };
  }

  function triggerLeak(now = Date.now()) {
    if (leakStartedAt != null && now - leakStartedAt < LEAK_MS) return false;
    leakStartedAt = now;
    state.gas = BASELINE.gas;
    return true;
  }

  return {
    next,
    triggerLeak,
    get leakActive() {
      return leakStartedAt != null;
    },
  };
}
