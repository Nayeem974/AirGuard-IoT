# AirGuard Web Dashboard

React 19 + Vite dashboard for the AirGuard IoT monitoring station. The full hardware-to-web setup is documented in the [repository root README](../README.md).

## Development

```bash
npm ci
npm run dev
```

## Verification

```bash
npm test
npm run lint
npm run build
npm run test:coverage
```

## Features

- Live MQTT-over-WebSocket telemetry and simulated demo readings
- Air-quality, combustible-gas, dust, temperature and humidity metric cards
- Status banner, threshold alerts and device connection information
- Historical readings, filters and CSV export
- Configurable MQTT broker, topic, demo interval and alert thresholds
- Browser-local settings and history

## MQTT defaults

- Broker WebSocket URL: `wss://broker.hivemq.com:8884/mqtt`
- Topic: `airguard/telemetry`
- Required fields: `temp`, `hum`, `aqi`, `gas`, `dust`
- Optional future field: `o2`

The `aqi` and `gas` fields are raw ADC values, not calibrated AQI or ppm measurements.
