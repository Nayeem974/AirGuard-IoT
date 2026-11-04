import { describe, expect, it } from 'vitest';
import { KEYS, loadJSON, removeKey, saveJSON } from './storage.js';
import { memoryStorage } from '../test/memoryStorage.js';

describe('storage', () => {
  it('round-trips JSON', () => {
    const storage = memoryStorage();
    expect(saveJSON(KEYS.settings, { a: 1 }, storage)).toBe(true);
    expect(loadJSON(KEYS.settings, null, storage)).toEqual({ a: 1 });
  });

  it('falls back on corrupt JSON', () => {
    const storage = memoryStorage({ [KEYS.settings]: '{' });
    expect(loadJSON(KEYS.settings, { safe: true }, storage)).toEqual({ safe: true });
  });

  it('returns the fallback when storage is unavailable', () => {
    expect(loadJSON(KEYS.readings, [], null)).toEqual([]);
    expect(saveJSON(KEYS.readings, [], null)).toBe(false);
  });

  it('returns false when storage throws (quota)', () => {
    const broken = { setItem: () => { throw new Error('quota'); } };
    expect(saveJSON(KEYS.readings, [], broken)).toBe(false);
  });

  it('removes a key', () => {
    const storage = memoryStorage({ [KEYS.alerts]: '[]' });
    removeKey(KEYS.alerts, storage);
    expect(loadJSON(KEYS.alerts, 'missing', storage)).toBe('missing');
  });

  it('ignores remove errors', () => {
    const broken = { removeItem: () => { throw new Error('nope'); } };
    expect(() => removeKey(KEYS.alerts, broken)).not.toThrow();
  });
});
