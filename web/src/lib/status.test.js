import { describe, expect, it } from 'vitest';
import { getStatuses, isStaleAt, overallStatus, statusFor } from './status.js';

describe('statusFor', () => {
  it('uses strict greater-than at boundaries', () => {
    expect(statusFor(300, { warn: 300, danger: 500 })).toBe('good');
    expect(statusFor(301, { warn: 300, danger: 500 })).toBe('warning');
    expect(statusFor(500, { warn: 300, danger: 500 })).toBe('warning');
    expect(statusFor(501, { warn: 300, danger: 500 })).toBe('danger');
    expect(statusFor(400, { danger: 400 })).toBe('good');
    expect(statusFor(401, { danger: 400 })).toBe('danger');
  });
});

describe('getStatuses / overallStatus', () => {
  const thresholds = { airWarn: 300, airDanger: 500, gasDanger: 400, dustWarn: 50, dustDanger: 150 };

  it('derives air, gas and dust independently', () => {
    expect(getStatuses({ aqi: 301, gas: 401, dust: 151 }, thresholds)).toEqual({
      air: 'warning', gas: 'danger', dust: 'danger',
    });
  });

  it('includes dust in the overall status', () => {
    expect(overallStatus({ air: 'good', gas: 'good', dust: 'warning' })).toBe('warning');
    expect(overallStatus({ air: 'good', gas: 'danger', dust: 'good' })).toBe('danger');
    expect(overallStatus({ air: 'good', gas: 'good', dust: 'good' })).toBe('good');
  });
});

describe('isStaleAt', () => {
  it('is stale only after the limit', () => {
    expect(isStaleAt(1000, 16000)).toBe(false);
    expect(isStaleAt(1000, 16001)).toBe(true);
    expect(isStaleAt(undefined, 99999)).toBe(false);
  });
});
