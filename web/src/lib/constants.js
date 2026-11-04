export const RANGES = {
  temp: { min: -40, max: 85 },
  hum: { min: 0, max: 100 },
  aqi: { min: 0, max: 1023 },
  gas: { min: 0, max: 1023 },
  dust: { min: 0, max: 1000 },
  o2: { min: 0, max: 25 },
};

export const LIMITS = {
  readings: 3600,
  alerts: 50,
  payloadChars: 512,
  staleMs: 15000,
};

export const DEFAULT_SETTINGS = {
  thresholds: { airWarn: 300, airDanger: 500, gasDanger: 400, dustWarn: 50, dustDanger: 150 },
  mqtt: { url: 'wss://broker.hivemq.com:8884/mqtt', topic: 'airguard/telemetry' },
  demo: { enabled: true, intervalMs: 3000 },
};
