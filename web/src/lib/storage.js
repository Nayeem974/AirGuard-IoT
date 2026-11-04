export const KEYS = {
  settings: 'airguard.settings.v1',
  readings: 'airguard.readings.v1',
  alerts: 'airguard.alerts.v1',
};

export function getStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadJSON(key, fallback, storage = getStorage()) {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value, storage = getStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key, storage = getStorage()) {
  try {
    storage?.removeItem(key);
  } catch {
    // ignore unavailable storage
  }
}
