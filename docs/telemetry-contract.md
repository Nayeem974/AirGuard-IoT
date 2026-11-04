# AirGuard IoT — Telemetry Contract

This document defines the JSON payload shared by the Arduino Mega firmware, ESP8266 MQTT gateway and React dashboard.

## Topic and transport

| Setting | Value |
|---|---|
| MQTT topic | `airguard/telemetry` |
| ESP8266 transport | MQTT TCP, `broker.hivemq.com:1883` |
| Browser transport | MQTT over WebSocket, `wss://broker.hivemq.com:8884/mqtt` |
| Publish interval | 3 seconds (nominal) |
| QoS | 0 |

The broker URL can be changed in the web app's Settings page. If the topic or broker is changed, update the ESP8266 sketch to match.

## Payload

```json
{"temp":28.5,"hum":65.0,"aqi":180,"gas":95,"dust":34.2}
```

| Key | Required? | Type | Valid range | Interpretation |
|---|---|---|---:|---|
| `temp` | Yes | Number | -40–85 | Temperature in degrees Celsius |
| `hum` | Yes | Number | 0–100 | Relative humidity percentage |
| `aqi` | Yes | Number | 0–1023 | Raw MQ-135 analog-to-digital reading; not an AQI index |
| `gas` | Yes | Number | 0–1023 | Raw MQ-2 analog-to-digital reading; not ppm |
| `dust` | Yes | Number | 0–1000 | Dust estimate in µg/m³ |
| `o2` | No | Number | 0–25 | Optional future oxygen percentage; sensor not installed in Phase 1 |

## Validation performed by the dashboard

- Message must be text containing a JSON object (not an array or `null`).
- Maximum payload length is 512 characters.
- Required fields must be finite JSON numbers and remain inside their documented ranges.
- If `o2` is present, it must also be a finite number in its documented range.
- Unknown fields are ignored.
- Invalid messages are rejected and do not replace the most recent valid reading.
- The browser records its own receive timestamp; the current payload does not include a device timestamp or device identifier.

## Alert thresholds

The default dashboard thresholds are:

| Rule | Default |
|---|---:|
| Air warning (`aqi`) | Above 300 |
| Air danger (`aqi`) | Above 500 |
| Gas danger (`gas`) | Above 400 |
| Dust warning | Above 50 µg/m³ |
| Dust danger | Above 150 µg/m³ |

The Mega's local buzzer and LEDs use MQ-135 warning/danger and MQ-2 danger thresholds. Dust is currently evaluated by the dashboard only. Dashboard threshold changes do not automatically reprogram the Mega firmware constants; keep the values aligned manually if you change them.

## Important measurement note

MQ-135 and MQ-2 values are raw ADC readings. Without sensor calibration and an appropriate conversion model, they must not be presented as certified AQI, ppm or exposure measurements. The dashboard labels and project documentation should preserve this distinction.
