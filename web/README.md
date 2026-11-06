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
- Multi-chart trend grid (air, gas, dust, temperature, humidity) with a shared 5m / 15m / 1h range
- Connection states that separate broker connectivity from actual data flow (see below)
- Historical readings, filters and CSV export
- Configurable MQTT broker, topic, demo interval and alert thresholds
- Browser-local settings and history

## Connection states

| State | Meaning |
| :--- | :--- |
| Demo | Simulated readings; no broker is used |
| Connecting / Reconnecting | The MQTT connection is being opened or restored |
| Broker connected | Subscribed to the topic; no valid reading has arrived yet |
| Live data | Valid readings are arriving |
| Waiting for device data | Broker connected, but no reading for more than 15 seconds |
| Disconnected / Error | The broker link is down or failed |

"Live data" is shown only after a valid message arrives; a connected broker alone is never reported as live.

## Fonts and styles

Inter and Space Grotesk are bundled with the app through `@fontsource-variable` packages, so no external font CDN is needed. All styles live in `src/styles.css`: base rules first, then one `@media` block per breakpoint at the end of the file (widest first).

## MQTT defaults

- Broker WebSocket URL: `wss://broker.hivemq.com:8884/mqtt`
- Topic: `airguard/telemetry`
- Required fields: `temp`, `hum`, `aqi`, `gas`, `dust`
- Optional future field: `o2`

The `aqi` and `gas` fields are raw ADC values, not calibrated AQI or ppm measurements.

See the repository [CHANGELOG](../CHANGELOG.md) for recent changes.
