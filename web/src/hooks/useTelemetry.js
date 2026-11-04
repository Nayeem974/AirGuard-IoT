import { useContext } from 'react';
import { TelemetryContext } from '../context/telemetryContext.js';

export function useTelemetry() {
  const value = useContext(TelemetryContext);
  if (!value) throw new Error('useTelemetry must be used inside TelemetryProvider');
  return value;
}
