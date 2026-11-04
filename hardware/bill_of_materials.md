# Bill of Materials (BOM) — AirGuard IoT

This document details the active hardware components, quantities, functional descriptions, and operating specifications for constructing the **AirGuard IoT** station using an **Arduino Mega 2560** and an **ESP8266 Wi-Fi** gateway, with visual analytics streamed to a **Real-Time Web Application**.

---

## 1. Active Component List (Phase 1 Prototype)

| # | Item Description | Part / Model | Qty | Operating Voltage | Purpose / Role |
| :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | **Microcontroller Board** | **Arduino Mega 2560** (ATmega2560) | 1 | 5V (USB / DC 7–12V) | Edge data acquisition, sensor polling & hardware UART streaming |
| 2 | **Wi-Fi Transceiver Module** | **ESP8266** (ESP-01 / NodeMCU) | 1 | 3.3V (250mA peak) | Wi-Fi gateway for MQTT/HTTP cloud and web app transmission |
| 3 | **Air Quality Sensor** | **MQ-135** | 1 | 5V | Detects CO₂, NH₃, alcohol, benzene, and smoke |
| 4 | **Combustible Gas Sensor** | **MQ-2** | 1 | 5V | Detects LPG, propane, methane, and smoke leakage |
| 5 | **Optical Dust Sensor** | **Sharp GP2Y1010AU0F** | 1 | 5V | Particulate matter (PM2.5 / PM10) detection |
| 6 | **Temperature & Humidity Sensor** | **DHT11** or **DHT22** | 1 | 3.3V–5V | Ambient temperature & relative humidity logging |
| 7 | **Acoustic Alarm** | **Active 5V Buzzer** | 1 | 5V | Immediate local sound alarm upon threshold breach |
| 8 | **Status Indicators** | **5mm LEDs** (Green, Yellow, Red) | 3 | 2V–3V (with 220Ω) | Visual tri-color safety level indication |
| 9 | **Resistors & Capacitors** | 220Ω, 1kΩ, 2kΩ, 150Ω, 220µF cap | 1 kit | Passive | Current limiting, voltage divider & dust filter |
| 10 | **Power Source** | **5V/2A DC Adapter** or 9V / 18650 Battery Pack | 1 | 5V–9V | System power supply |
| 11 | **Prototyping Hardware** | Solderless Breadboard & Jumper Wires | 1 set | — | Interconnection and breadboard prototyping |

---

## 2. Planned Future Scope (Phase 2 Upgrade)

| Component Description | Part / Model | Reserved Pin | Status / Budget Justification |
| :--- | :--- | :--- | :--- |
| **Electrochemical O₂ Sensor Module** | **ME2-O2** or Grove O₂ Sensor | Arduino Mega **A2** | **Deferred to Phase 2**: Due to prohibitive commercial electrochemical cell procurement costs, O₂ sensing is scheduled for future release once dedicated lab grant funds are secured. Analog channel A2 and firmware hooks remain reserved for plug-and-play addition. |

---

> [!NOTE]
> **Display Architecture**: The physical 16×2 character LCD has been superseded by a dedicated **Real-Time Web Application**. This eliminates physical display viewing constraints, reduces breadboard clutter, and enables remote multi-device monitoring across laptops, tablets, and smartphones.
