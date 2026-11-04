import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createDemoGenerator } from '../lib/demo.js';
import { LIMITS, RANGES } from '../lib/constants.js';
import { createMqttConnection } from '../lib/mqttConnection';
import { parseReading } from '../lib/parseReading.js';
import { normalizeSettings, validateSettings } from '../lib/settings.js';
import { getStatuses, isStaleAt, overallStatus } from '../lib/status.js';
import { getStorage, KEYS, loadJSON, removeKey, saveJSON } from '../lib/storage.js';
import { TelemetryContext } from './telemetryContext.js';

const DEFAULT_NOW = () => Date.now();
const DEFAULT_RANDOM = Math.random;
const STATUS_KEYS = ['air', 'gas', 'dust'];
const EMPTY_STATUSES = { air: 'good', gas: 'good', dust: 'good' };
const DEMO_CONNECTION = { state: 'demo' };
const MAX_TS = 4102444800000; // year 2100, rejects corrupt far-future timestamps
const METRICS = {
  air: { label: 'Air quality', key: 'aqi', messages: { warning: 'Air quality is elevated', danger: 'Air quality is hazardous' } },
  gas: { label: 'Combustible gas', key: 'gas', messages: { danger: 'Combustible gas detected' } },
  dust: { label: 'Dust', key: 'dust', messages: { warning: 'Dust level is elevated', danger: 'Dust level is high' } },
};

function isNumberInRange(value, range) {
  return typeof value === 'number' && Number.isFinite(value) && value >= range.min && value <= range.max;
}

function isReading(value) {
  if (!value || typeof value !== 'object' || !['live', 'demo'].includes(value.source)) return false;
  if (!Number.isFinite(value.ts) || value.ts < 0 || value.ts > MAX_TS) return false;
  if (!['temp', 'hum', 'aqi', 'gas', 'dust'].every((key) => isNumberInRange(value[key], RANGES[key]))) return false;
  return value.o2 == null || isNumberInRange(value.o2, RANGES.o2);
}

function isAlert(value) {
  return value
    && typeof value === 'object'
    && typeof value.id === 'string'
    && Number.isFinite(value.ts)
    && value.ts >= 0
    && value.ts <= MAX_TS
    && ['warning', 'danger', 'recovered'].includes(value.level)
    && STATUS_KEYS.includes(value.metric)
    && ['live', 'demo'].includes(value.source);
}

function cappedItems(value, limit, predicate) {
  return Array.isArray(value) ? value.filter(predicate).slice(-limit) : [];
}

function canUseStorage(storage) {
  if (!storage) return false;
  try {
    const key = '__airguard_probe__';
    storage.setItem(key, '1');
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function messageFor(metric, level) {
  if (level === 'recovered') return `${METRICS[metric].label} returned to normal`;
  return METRICS[metric].messages[level];
}

export function TelemetryProvider({ children, storage, now = DEFAULT_NOW, random = DEFAULT_RANDOM }) {
  const [activeStorage] = useState(() => (storage === undefined ? getStorage() : storage));
  const [settings, setSettings] = useState(() => normalizeSettings(loadJSON(KEYS.settings, null, activeStorage)));
  const [readings, setReadings] = useState(() => cappedItems(loadJSON(KEYS.readings, [], activeStorage), LIMITS.readings, isReading));
  const [alerts, setAlerts] = useState(() => cappedItems(loadJSON(KEYS.alerts, [], activeStorage), LIMITS.alerts, isAlert));
  const [connection, setConnection] = useState(() => ({ state: settings.demo.enabled ? 'demo' : 'connecting' }));
  const [rejected, setRejected] = useState(0);
  const [clock, setClock] = useState(() => now());
  const [retryKey, setRetryKey] = useState(0);
  const [leakActive, setLeakActive] = useState(false);
  const [demoEpoch, setDemoEpoch] = useState(0);
  const [persistStore] = useState(() => {
    let failed = false;
    const listeners = new Set();
    return {
      fail() {
        if (failed) return;
        failed = true;
        listeners.forEach((listener) => listener());
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      getSnapshot: () => failed,
    };
  });
  const persistFailed = useSyncExternalStore(persistStore.subscribe, persistStore.getSnapshot);
  const [storageAvailable] = useState(() => canUseStorage(activeStorage));
  const thresholdsRef = useRef(settings.thresholds);
  const lastReadingRef = useRef(null);
  const generatorRef = useRef(null);
  const leakTimerRef = useRef(null);
  const alertIdRef = useRef(0);
  const skipReadingsPersistRef = useRef(false);
  const skipAlertsPersistRef = useRef(false);

  const source = settings.demo.enabled ? 'demo' : 'live';

  useEffect(() => {
    const interval = setInterval(() => setClock(now()), 1000);
    return () => clearInterval(interval);
  }, [now]);

  useEffect(() => {
    if (!saveJSON(KEYS.settings, settings, activeStorage)) persistStore.fail();
  }, [activeStorage, settings, persistStore]);

  useEffect(() => {
    if (skipReadingsPersistRef.current) {
      skipReadingsPersistRef.current = false;
      return;
    }
    if (!saveJSON(KEYS.readings, readings, activeStorage)) persistStore.fail();
  }, [activeStorage, readings, persistStore]);

  useEffect(() => {
    if (skipAlertsPersistRef.current) {
      skipAlertsPersistRef.current = false;
      return;
    }
    if (!saveJSON(KEYS.alerts, alerts, activeStorage)) persistStore.fail();
  }, [activeStorage, alerts, persistStore]);

  useEffect(() => {
    thresholdsRef.current = settings.thresholds;
  }, [settings.thresholds]);

  useEffect(() => {
    lastReadingRef.current = null;
  }, [source]);

  const ingest = useCallback((reading) => {
    const next = getStatuses(reading, thresholdsRef.current);
    const previous = lastReadingRef.current
      ? getStatuses(lastReadingRef.current, thresholdsRef.current)
      : null;
    const events = [];

    if (previous) {
      for (const metric of STATUS_KEYS) {
        if (next[metric] === previous[metric]) continue;
        const level = next[metric] === 'good' ? 'recovered' : next[metric];
        const detail = METRICS[metric];
        events.push({
          id: `${reading.ts}-${metric}-${++alertIdRef.current}`,
          ts: reading.ts,
          level,
          metric,
          value: reading[detail.key],
          message: messageFor(metric, level),
          source: reading.source,
        });
      }
    }

    lastReadingRef.current = reading;
    setReadings((current) => [...current, reading].slice(-LIMITS.readings));
    if (events.length > 0) setAlerts((current) => [...current, ...events].slice(-LIMITS.alerts));
  }, []);

  useEffect(() => {
    if (source !== 'demo') return undefined;
    const generator = createDemoGenerator({ random });
    generatorRef.current = generator;
    const interval = setInterval(() => ingest(generator.next(now())), settings.demo.intervalMs);

    return () => {
      clearInterval(interval);
      if (generatorRef.current === generator) generatorRef.current = null;
      if (leakTimerRef.current) clearTimeout(leakTimerRef.current);
      leakTimerRef.current = null;
      setLeakActive(false);
    };
  }, [ingest, now, random, settings.demo.intervalMs, source, demoEpoch]);

  useEffect(() => {
    if (source !== 'live') return undefined;
    let active = true;
    const mqtt = createMqttConnection({
      url: settings.mqtt.url,
      topic: settings.mqtt.topic,
      onMessage: (raw) => {
        if (!active) return;
        const result = parseReading(raw, { source: 'live', now: now() });
        if (result.ok) ingest(result.reading);
        else setRejected((count) => count + 1);
      },
      onStatus: (status) => {
        if (active) setConnection(status);
      },
    });

    return () => {
      active = false;
      mqtt.close();
    };
  }, [ingest, now, retryKey, settings.mqtt.topic, settings.mqtt.url, source]);

  const latest = useMemo(() => {
    for (let index = readings.length - 1; index >= 0; index -= 1) {
      if (readings[index].source === source) return readings[index];
    }
    return null;
  }, [readings, source]);
  const statuses = latest ? getStatuses(latest, settings.thresholds) : EMPTY_STATUSES;
  const overall = latest ? overallStatus(statuses) : null;
  const isStale = source === 'live' && latest != null && isStaleAt(latest.ts, clock);

  const triggerLeak = useCallback(() => {
    const generator = generatorRef.current;
    if (!generator || !generator.triggerLeak(now())) return;
    setLeakActive(true);
    if (leakTimerRef.current) clearTimeout(leakTimerRef.current);
    leakTimerRef.current = setTimeout(() => {
      leakTimerRef.current = null;
      setLeakActive(false);
    }, 14000);
  }, [now]);

  const updateSettings = useCallback((next) => {
    const result = validateSettings(next);
    if (result.ok) {
      const nextSource = result.settings.demo.enabled ? 'demo' : 'live';
      const mqttChanged = result.settings.mqtt.url !== settings.mqtt.url
        || result.settings.mqtt.topic !== settings.mqtt.topic;
      if (nextSource === 'live' && (source !== 'live' || mqttChanged)) {
        setConnection({ state: 'connecting' });
      }
      if (source === 'demo' && (nextSource !== 'demo' || result.settings.demo.intervalMs !== settings.demo.intervalMs)) {
        setLeakActive(false);
      }
      setSettings(result.settings);
    }
    return result;
  }, [settings, source]);

  const resetSettings = useCallback(() => {
    setLeakActive(false);
    setDemoEpoch((value) => value + 1);
    setSettings(normalizeSettings(null));
  }, []);

  const clearHistory = useCallback(() => {
    skipReadingsPersistRef.current = true;
    skipAlertsPersistRef.current = true;
    setReadings([]);
    setAlerts([]);
    lastReadingRef.current = null;
    removeKey(KEYS.readings, activeStorage);
    removeKey(KEYS.alerts, activeStorage);
  }, [activeStorage]);

  const retry = useCallback(() => {
    setConnection({ state: 'connecting' });
    setRetryKey((key) => key + 1);
  }, []);

  const value = useMemo(() => ({
    settings,
    updateSettings,
    resetSettings,
    readings,
    alerts,
    latest,
    statuses,
    overall,
    connection: source === 'demo' ? DEMO_CONNECTION : connection,
    rejected,
    isStale,
    now: clock,
    source,
    demo: source === 'demo',
    leakActive,
    triggerLeak,
    clearHistory,
    retry,
    storageAvailable,
    persistFailed,
  }), [alerts, clearHistory, connection, isStale, latest, leakActive, overall, persistFailed, readings, rejected, resetSettings, retry, settings, source, statuses, storageAvailable, triggerLeak, updateSettings, clock]);

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}
