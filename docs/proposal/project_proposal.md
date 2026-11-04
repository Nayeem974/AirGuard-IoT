**Course Code: CSE402**

**Course Title: Internet of Things Lab**

**Project Proposal**

**Submitted to:**

Abrar Mahbub Tanim

Lecturer, Department of CSE
University of Information Technology and Sciences (UITS)
Permanent Campus: Baridhara Nayanagar, Dhaka-1212

		**Submitted by (Project Team):**

1. MD. Fahad Rahman (Team Leader - ID: 0432320005101071)
2. Zannatul Nayem (ID: 0432320005101063)
3. Shafayet Hossain Shafin (ID: 0432320005101088)

Batch: 54th Batch
Section: 6B1
Department of CSE
Program: B.Sc. in Computer Science & Engineering
Semester: 7th (Autumn 2026)
University of Information Technology and Sciences (UITS)
October 26, 2026

---

# 1. Project Title
**AirGuard IoT:** An IoT-Based Smart Air Quality, Gas Leakage, and Environmental Monitoring System Using Arduino Mega 2560, ESP8266, and Real-Time Web Application

---

# 2. Domain & Application Scope
* **Primary Domain:** Environmental Sensing & Public Health (Aligned with Domain-Specific IoT Architectures).
* **Secondary Domain:** Smart Campus & Industrial Safety (Targeted for UITS CSE Hardware/IoT Labs, Server Rooms & Academic Buildings).

---

# 3. Problem Statement
Dhaka consistently ranks among the world's most air-polluted metropolises, experiencing severe seasonal particulate spikes (PM2.5/PM10), combustible gas risks, and poor indoor air ventilation. Within enclosed institutional environments—such as UITS computer science laboratories, server clusters, and educational buildings—undetected hazardous gas leaks (LPG, carbon monoxide, methane) and excessive airborne dust present acute respiratory risks and fire hazards. Conventional protection mechanisms suffer from severe architectural limitations:
1. **Lack of Multi-Parameter Integration:** Traditional detectors operate as isolated units, unable to simultaneously sample particulate dust density, toxic/combustible gases, ambient temperature, and relative humidity.
2. **No Remote Telemetry or Cloud Logging:** Standard alarms are standalone buzzers lacking wireless connectivity or historical trend logs for predictive laboratory maintenance.
3. **Delayed Emergency Response:** Off-premises university faculty, lab officers, and safety administrators receive no low-latency push notifications when dangerous conditions develop after hours.

---

# 4. Proposed Solution & System Architecture
**AirGuard IoT** delivers a robust edge-to-cloud environmental safety platform engineered specifically for educational laboratories and institutional facilities, utilizing a high-performance **Arduino Mega 2560** (ATmega2560) paired with an **ESP8266 Wi-Fi** transceiver.

The system captures multi-point physical telemetry from a synchronized multi-sensor array:
* **MQ-135 Gas Sensor:** Detects air pollution, CO₂, NH₃, benzene, alcohol, and ambient smoke.
* **MQ-2 Gas Sensor:** Detects combustible gas leaks (LPG, propane, methane, hydrogen).
* **Sharp GP2Y1010AU0F Optical Dust Sensor:** Quantifies airborne suspended particulates in $\mu\text{g/m}^3$.
* **Digital Climate Sensor (DHT11/DHT22):** Logs ambient temperature and relative humidity.
* **Future Phase Expansion Interface:** Dedicated hardware routing on the Mega 2560 for future integration of an electrochemical O₂ sensor in Phase 2.

The Arduino Mega 2560 executes deterministic analog/digital signal conditioning leveraging its 16 analog input channels and dedicated Hardware Serial UART. Structured JSON telemetry is streamed over Hardware `Serial1` directly to the ESP8266, eliminating software serial emulation overhead. The ESP8266 transmits this telemetry over 2.4 GHz campus Wi-Fi using lightweight MQTT/HTTP protocols to a dedicated, custom-developed **Real-Time Web Application**. The web platform delivers interactive gauges, historical charting, and live remote alerts, while local audio-visual buzzers and LEDs provide immediate on-site safety warning.

---

# 5. Project Objectives
1. **Comprehensive Environmental Sensing:** Continuously quantify Air Quality Index (AQI), combustible gas concentration (PPM), suspended dust density ($\mu\text{g/m}^3$), ambient temperature, and relative humidity.
2. **Early Gas Hazard Detection:** Rapidly detect combustible gas leaks (LPG, methane) and toxic smoke to prevent domestic fire outbreaks, equipment destruction, and asphyxiation accidents.
3. **High-Throughput Hardware UART Gateway:** Establish reliable, jitter-free wireless data transfer between the Arduino Mega 2560 hardware Serial1 port and cloud brokers via the ESP8266 transceiver.
4. **Custom Web Application Visualization:** Develop a responsive, full-featured web dashboard displaying real-time analytical metrics, interactive graphs, and historical logs, replacing restrictive on-site character LCDs.
5. **Automated Dual-Layer Alarming:** Execute immediate local acoustic/visual alert sequences (active buzzer + tri-color LEDs) alongside real-time web socket/cloud alert banners when safety thresholds are breached.

---

# 6. Hardware Requirements & Component Specifications
* **Microcontroller Board:** Arduino Mega 2560 (ATmega2560, 16 MHz, 256 KB Flash, 8 KB SRAM, 4 Hardware UARTs, 16 Analog Inputs) — High-capacity edge data acquisition and processing engine.
* **Wireless Transceiver Module:** ESP8266 (ESP-01 / NodeMCU Shield) — Serial-to-Wi-Fi gateway communicating over 2.4 GHz 802.11 b/g/n for cloud telemetry.
* **Active Environmental & Gas Sensor Suite:**
  * **MQ-135 Gas Sensor:** Air quality sensor detecting CO₂, NH₃, benzene, alcohol, and ambient hazardous smoke.
  * **MQ-2 Gas Sensor:** Combustible gas sensor detecting LPG, propane, methane, hydrogen, and combustible gas leaks.
  * **Optical Dust Sensor (Sharp GP2Y1010AU0F):** Infrared optical particulate sensor quantifying fine PM2.5 / PM10 density measurement in $\mu\text{g/m}^3$.
  * **Climate Sensor (DHT11 / DHT22):** Calibrated digital sensor logging relative humidity and ambient temperature.
  * **Future Phase Expansion Feature:** Electrochemical O₂ Sensor Module (ME2-O2 / Grove O₂) — Reserved expansion interface for oxygen depletion tracking, planned for Phase 2 implementation subject to project grant allocation.
* **Local Actuators & On-Site Indicators:** 5V active acoustic buzzer for immediate emergency warning, and tri-color status LEDs (Green = Normal, Yellow = Warning, Red = Critical Danger).
* **Power & Interface Accessories:** Regulated 5V/2A DC power supply, 3.3V logic level divider (resistor network protecting ESP8266 RX), solderless breadboard, and jumper wires.

---

# 7. Software, Firmware & Web Stack
* **Embedded Firmware:** Arduino IDE (C / Embedded C++) utilizing hardware UART interrupts and non-blocking sensor sampling algorithms.
* **Firmware Libraries:** `WiFiClient.h`, `PubSubClient.h` (MQTT), and `DHT.h` (eliminating `SoftwareSerial.h` and `LiquidCrystal_I2C.h` for maximum efficiency).
* **Communication Protocols:** MQTT (Message Queuing Telemetry Transport) for low-latency publish/subscribe messaging, HTTP REST API POST backup, and Hardware UART Serial communication.
* **Real-Time Web Application Stack:** Modern responsive web dashboard built with HTML5/CSS3, JavaScript (React / Chart.js / WebSockets), displaying live gauge dials, real-time pollution time-series, historical telemetry archives, and threshold alert banners.

---

# 8. Feasibility Analysis
* **Technical Feasibility:** The Arduino Mega 2560 provides 4x more SRAM (8 KB), 8x more flash memory (256 KB), and 4 hardware serial ports compared to entry-level boards, effortlessly handling multi-sensor calculations while the web application provides scalable multi-user access without hardware screen limits.
* **Economic Feasibility:** The system is built entirely from accessible commercial-off-the-shelf (COTS) components. Excluding the costly commercial electrochemical O₂ sensor from the initial bill of materials keeps the prototype strictly within undergraduate student budget limits while preserving multi-hazard air safety monitoring.
* **Operational Feasibility:** The system requires standard 5V power and a 2.4 GHz Wi-Fi hotspot. Laboratory stakeholders and students can inspect live environmental metrics on any smartphone, tablet, or PC browser without needing to physically stand next to the device.

---

# 9. Project Scope & Limitations
* **Project Scope:** Designed for real-time monitoring across UITS computer science laboratories, server rooms, university project exhibition halls, and residential living spaces.
* **Processing Headroom:** The Arduino Mega 2560 provides ample memory headroom, ensuring zero risk of SRAM stack collision during long-duration multi-sensor sampling.
* **Budget Scope & Future O₂ Integration:** Due to prohibitive procurement costs, electrochemical O₂ percentage sensing is omitted from the initial prototype and scheduled as a planned future update; Mega 2560 analog channel A2 is reserved for seamless plug-and-play upgrade.
* **Network Dependency:** Cloud logging and web application telemetry require active Wi-Fi internet connectivity. However, local audio-visual alarm functions (buzzer & LEDs) operate completely autonomously even when offline.

---

# 10. Expected Outcome & Deliverables
1. **Functional Hardware Prototype:** A fully assembled hardware station integrating the Arduino Mega 2560, ESP8266, and 4 primary sensing modules (with expansion readiness for future O₂ addition).
2. **Interactive Real-Time Web Application:** A responsive, feature-rich web dashboard displaying live gauges, time-series telemetry plots, historical logs, and safety indicator cards for air quality, gases, dust, and climate.
3. **Sub-2s Emergency Safety Alarming:** An automated safety response mechanism sounding local sirens and streaming web alert flags within 2 seconds of threshold violations.

---

# 11. Team Work Distribution & Responsibilities
* **MD. Fahad Rahman (Team Leader - 0432320005101071):** Overall system architecture, multi-sensor calibration & interfacing (MQ-135, MQ-2, GP2Y1010AU0F, DHT), future O₂ pin allocation, Arduino Mega 2560 firmware engineering, and hardware serial packetization.
* **Zannatul Nayem (0432320005101063):** ESP8266 Wi-Fi gateway firmware development, Hardware UART packet parsing, MQTT cloud broker configuration, and REST API telemetry transmission pipeline.
* **Shafayet Hossain Shafin (0432320005101088):** Real-Time Web Application frontend/backend development (dashboard UI, live metric cards, Chart.js time-series graphs), local audio-visual alarm circuit integration, testing, and technical documentation.

---

# 12. Project Implementation Milestones (July – Nov 15, 2026)
* **Phase 1 (July – August 2026):** Requirements analysis, COTS sensor procurement (MQ-135, MQ-2, GP2Y1010AU0F, DHT), sensor burn-in, calibration testing, and breadboard baseline prototyping.
* **Phase 2 (September 2026):** Arduino Mega 2560 edge acquisition firmware, Hardware Serial1 UART data packetization, and autonomous on-site audio-visual buzzer/LED alarm circuit integration.
* **Phase 3 (October 2026):** ESP8266 Wi-Fi gateway firmware, MQTT cloud publish/subscribe pipeline configuration, and interactive Real-Time Web Application dashboard development.
* **Phase 4 (November 1 – November 15, 2026):** Hardware enclosure packaging, end-to-end lab benchmarking under simulated gas/smoke, system calibration, and first functional prototype ready before November 15, 2026.
