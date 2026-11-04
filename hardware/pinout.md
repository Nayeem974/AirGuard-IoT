# Hardware Wiring & Pinout Guide — AirGuard IoT

This document provides the hardware pin mapping and wiring schematic for the **AirGuard IoT** edge station using an **Arduino Mega 2560** and an **ESP8266 Wi-Fi** module.

---

## 1. Pin Mapping Summary Table

| Peripheral / Sensor | Sensor Pin | Arduino Mega 2560 Pin | ESP8266 Pin | Notes / Operating Voltage |
| :--- | :--- | :--- | :--- | :--- |
| **MQ-135 (Air Quality)** | VCC | 5V | — | Preheating required (~20s) |
| | GND | GND | — | Common Ground |
| | AOUT | **A0** | — | Analog Voltage Output |
| **MQ-2 (Combustible Gas)** | VCC | 5V | — | Preheating required (~20s) |
| | GND | GND | — | Common Ground |
| | AOUT | **A1** | — | Analog Voltage Output |
| **[RESERVED] O₂ Sensor** | — | **A2** | — | *Reserved for Phase 2 Future Upgrade* |
| **Dust Sensor (Sharp GP2Y1010AU0F)** | VCC | 5V | — | Through 150Ω resistor & 220µF capacitor |
| | GND | GND | — | Common Ground |
| | LED Pin | **D7** | — | Pulse trigger pin (0.32ms pulse) |
| | V0 (Analog Out) | **A3** | — | Analog dust concentration reading |
| **DHT11 / DHT22 (Temp & Humidity)** | VCC | 5V / 3.3V | — | 10kΩ pull-up resistor on Data line |
| | GND | GND | — | Common Ground |
| | DATA | **D4** | — | Digital One-Wire bus |
| **Buzzer (Active 5V)** | POS (+) | **D8** | — | Acoustic emergency alert |
| | NEG (-) | GND | — | Common Ground |
| **Status LEDs** | Green LED | **D9** | — | Safe condition (through 220Ω resistor) |
| | Yellow LED | **D10** | — | Moderate warning (through 220Ω resistor)|
| | Red LED | **D11** | — | Critical emergency alert (through 220Ω resistor) |
| **ESP8266 Wi-Fi Module** | 3V3 / VCC | 3.3V (external/regulator)| VCC / EN | Needs minimum 250mA @ 3.3V |
| | GND | GND | GND | Common Ground with Arduino |
| | RX | — | **RX** | Connect to **Pin 18 (TX1)** via 1kΩ/2kΩ voltage divider |
| | TX | **Pin 19 (RX1)** | **TX** | Direct connection to Mega Pin 19 (3.3V logic read as HIGH) |

> [!NOTE]
> * **No Physical LCD Needed**: All sensor telemetry and visual representations are rendered on the dedicated **Real-Time Web Application** dashboard.
> * **O₂ Sensor Deferral**: The electrochemical O₂ sensor is earmarked for a future phase update due to budget constraints. Analog channel `A2` is kept reserved.

---

## 2. Arduino Mega 2560 to ESP8266 Hardware Serial Gateway

The **Arduino Mega 2560** features 4 dedicated hardware UART ports. We utilize **Hardware Serial1**:
* **Pin 18 (`TX1`)**: Transmits serial JSON packets from Arduino Mega to ESP8266.
* **Pin 19 (`RX1`)**: Receives data/acknowledgments from ESP8266.

### Voltage Division Protection Circuit

> [!WARNING]
> The ESP8266 GPIO pins are strictly 3.3V tolerant. Arduino digital outputs produce 5V logic.
> **Always** step down the Arduino Mega Pin 18 (TX1) 5V signal to 3.3V before feeding it into the ESP8266 RX pin.

```
Arduino Mega Pin 18 (TX1) ---> [ 1kΩ Resistor ] ---> ESP8266 RX
                                              |
                                        [ 2kΩ Resistor ]
                                              |
                                             GND
```
* **ESP8266 TX** connects directly to **Arduino Mega Pin 19 (RX1)** (the 3.3V HIGH output from ESP8266 is safely recognized as HIGH by the 5V ATmega2560).

---

## 3. Power Distribution Architecture

* **Primary Input:** 5V / 2A External DC power supply via barrel jack or regulated USB.
* **5V Rail:** Powers the Arduino Mega 2560, MQ-135, MQ-2, Dust sensor, and active Buzzer.
* **3.3V Rail:** Dedicated regulated 3.3V supply (AMS1117-3.3 or external power module) powering the ESP8266 Wi-Fi module (supplying the required $\ge 250\text{mA}$ peak current during RF transmission).
