import { describe, expect, it } from 'vitest';
import { createDemoGenerator } from './demo.js';

function seeded(seed = 42) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

describe('createDemoGenerator', () => {
  it('stays inside sensor ranges for 500 ticks', () => {
    const generator = createDemoGenerator({ random: seeded() });
    for (let i = 0; i < 500; i += 1) {
      const reading = generator.next(i * 3000);
      expect(reading.source).toBe('demo');
      expect(reading.temp).toBeGreaterThanOrEqual(-40);
      expect(reading.temp).toBeLessThanOrEqual(85);
      expect(reading.hum).toBeGreaterThanOrEqual(0);
      expect(reading.hum).toBeLessThanOrEqual(100);
      expect(reading.aqi).toBeGreaterThanOrEqual(0);
      expect(reading.aqi).toBeLessThanOrEqual(1023);
      expect(reading.gas).toBeGreaterThanOrEqual(0);
      expect(reading.gas).toBeLessThanOrEqual(1023);
      expect(reading.dust).toBeGreaterThanOrEqual(0);
      expect(reading.dust).toBeLessThanOrEqual(1000);
      expect(reading.o2).toBeGreaterThanOrEqual(0);
      expect(reading.o2).toBeLessThanOrEqual(25);
    }
  });

  it('stays in the normal band for an hour without a triggered leak', () => {
    const generator = createDemoGenerator({ random: seeded() });
    for (let i = 0; i < 1200; i += 1) {
      const reading = generator.next(i * 3000);
      expect(reading.aqi).toBeLessThan(300);
      expect(reading.gas).toBeLessThan(400);
      expect(reading.dust).toBeLessThan(50);
      expect(reading.temp).toBeGreaterThan(15);
      expect(reading.temp).toBeLessThan(40);
    }
  });

  it('ramps gas past danger and recovers', () => {
    const generator = createDemoGenerator({ random: seeded() });
    expect(generator.triggerLeak(0)).toBe(true);
    expect(generator.leakActive).toBe(true);
    expect(generator.next(0).gas).toBeLessThan(400);
    expect(generator.next(3000).gas).toBeGreaterThan(400);
    expect(generator.next(10000).gas).toBeGreaterThan(400);
    expect(generator.next(12000).gas).toBeLessThan(400);
    expect(generator.next(14000).gas).toBeLessThan(400);
    expect(generator.leakActive).toBe(false);
  });

  it('ignores a second trigger while leaking', () => {
    const generator = createDemoGenerator({ random: seeded() });
    expect(generator.triggerLeak(0)).toBe(true);
    expect(generator.triggerLeak(1000)).toBe(false);
    expect(generator.next(3000).gas).toBeGreaterThan(400);
  });
});
