import { describe, expect, it } from 'vitest';
import { parseReading } from './parseReading.js';

const valid = '{"temp":28.5,"hum":65,"aqi":180,"gas":95,"dust":34.2}';

describe('parseReading', () => {
  it('accepts a valid payload and adds ts/source', () => {
    const result = parseReading(valid, { source: 'live', now: 123 });
    expect(result).toEqual({
      ok: true,
      reading: { ts: 123, source: 'live', temp: 28.5, hum: 65, aqi: 180, gas: 95, dust: 34.2 },
    });
  });

  it('accepts an optional o2 field', () => {
    const result = parseReading('{"temp":28,"hum":60,"aqi":100,"gas":100,"dust":10,"o2":20.9}');
    expect(result.ok).toBe(true);
    expect(result.reading.o2).toBe(20.9);
  });

  it.each([
    ['invalid JSON', '{'],
    ['array', '[]'],
    ['null', 'null'],
    ['missing field', '{"temp":28,"hum":60,"aqi":100,"gas":100}'],
    ['string number', '{"temp":"28","hum":60,"aqi":100,"gas":100,"dust":10}'],
    ['NaN-like', '{"temp":28,"hum":60,"aqi":null,"gas":100,"dust":10}'],
    ['air out of range', '{"temp":28,"hum":60,"aqi":1024,"gas":100,"dust":10}'],
    ['humidity out of range', '{"temp":28,"hum":101,"aqi":100,"gas":100,"dust":10}'],
    ['invalid o2', '{"temp":28,"hum":60,"aqi":100,"gas":100,"dust":10,"o2":30}'],
    ['oversized', 'x'.repeat(513)],
  ])('rejects %s', (_name, raw) => {
    expect(parseReading(raw).ok).toBe(false);
  });

  it('ignores unknown keys', () => {
    const result = parseReading('{"temp":28,"hum":60,"aqi":100,"gas":100,"dust":10,"foo":"bar"}');
    expect(result.ok).toBe(true);
    expect(result.reading.foo).toBeUndefined();
  });
});
