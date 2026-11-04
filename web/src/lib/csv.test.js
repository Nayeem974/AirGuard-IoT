import { describe, expect, it } from 'vitest';
import { csvCell, toCsv } from './csv.js';

describe('csv', () => {
  it('exports the header and rows in order', () => {
    const csv = toCsv([
      { ts: 0, source: 'live', aqi: 180, gas: 95, dust: 34.2, temp: 28.5, hum: 65, o2: 20.9 },
    ]);
    const lines = csv.trim().split('\r\n');
    expect(lines[0]).toBe('timestamp,source,air_raw,gas_raw,dust_ugm3,temp_c,humidity_pct,o2_pct');
    expect(lines[1]).toBe('1970-01-01T00:00:00.000Z,live,180,95,34.2,28.5,65,20.9');
  });

  it('leaves o2 empty when absent', () => {
    const csv = toCsv([{ ts: 0, source: 'demo', aqi: 1, gas: 2, dust: 3, temp: 4, hum: 5 }]);
    expect(csv.trim().split('\r\n')[1].endsWith(',')).toBe(true);
  });

  it('quotes cells containing commas or quotes', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell(null)).toBe('');
  });

  it('returns just the header for no readings', () => {
    expect(toCsv([]).trim()).toBe('timestamp,source,air_raw,gas_raw,dust_ugm3,temp_c,humidity_pct,o2_pct');
  });
});
