/**
 * AirGuard IoT - Arduino Edge Node
 * Hardware: Arduino Mega 2560 (ATmega2560)
 * Authors: 
 *   1. MD. Fahad Rahman (ID: 0432320005101071)
 *   2. Zannatul Nayem (ID: 0432320005101063)
 *   3. Shafayet Hossain Shafin (ID: 0432320005101088)
 * Batch: 54th Batch | Section: 6B1
 * Course: CSE402 - Internet of Things Lab (Autumn 26)
 * Institution: University of Information Technology and Sciences (UITS)
 */

#include <DHT.h>

// --- Pin Definitions on Arduino Mega 2560 ---
#define PIN_MQ135      A0  // Air Quality (CO2, NH3, Smoke)
#define PIN_MQ2        A1  // Combustible Gas Leakage (LPG, CH4)
// #define PIN_O2      A2  // [RESERVED FOR FUTURE PHASE 2 UPGRADE] Electrochemical O2 Sensor
#define PIN_DUST_VO    A3  // Sharp GP2Y1010AU0F Analog Output
#define PIN_DHT        4   // DHT11 / DHT22 Digital One-Wire
#define PIN_DUST_LED   7   // Sharp Optical Dust Pulse Trigger
#define PIN_BUZZER     8   // Active 5V Acoustic Buzzer
#define PIN_LED_GREEN  9   // Normal Status Indicator
#define PIN_LED_YELLOW 10  // Warning Status Indicator
#define PIN_LED_RED    11  // Critical Emergency Indicator

// Communication with ESP8266 Gateway:
// Arduino Mega 2560 features 4 Hardware Serial UARTs!
// Serial  -> USB Debug Monitor to PC
// Serial1 -> Hardware Serial on Pin 19 (RX1) and Pin 18 (TX1) to ESP8266

// DHT Configuration
#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

// Non-blocking sampling interval (every 3000ms)
unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL = 3000;

// Safety thresholds
const int THRESHOLD_MQ135_WARN   = 300;
const int THRESHOLD_MQ135_DANGER = 500;
const int THRESHOLD_MQ2_DANGER   = 400;

void setup() {
  // Initialize USB Serial for PC debugging
  Serial.begin(9600);

  // Initialize Hardware Serial1 for ESP8266 Wi-Fi Gateway
  Serial1.begin(9600);

  pinMode(PIN_DUST_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);

  digitalWrite(PIN_DUST_LED, HIGH); // Sharp optical sensor LED off initially
  digitalWrite(PIN_BUZZER, LOW);

  dht.begin();

  Serial.println(F("=================================================="));
  Serial.println(F("AirGuard IoT - Arduino Mega 2560 Edge Station"));
  Serial.println(F("Sensors: MQ-135, MQ-2, Sharp Optical Dust, DHT11"));
  Serial.println(F("Expansion Slot: Analog A2 reserved for Future O2"));
  Serial.println(F("Telemetry streamed to Real-Time Web Application"));
  Serial.println(F("=================================================="));

  // Visual confirmation on boot
  digitalWrite(PIN_LED_GREEN, HIGH);
  delay(500);
  digitalWrite(PIN_LED_YELLOW, HIGH);
  delay(500);
  digitalWrite(PIN_LED_RED, HIGH);
  delay(500);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);
}

float readDustDensity() {
  // Sharp GP2Y1010AU0F 0.32ms pulse sequence
  digitalWrite(PIN_DUST_LED, LOW);
  delayMicroseconds(280);
  int voVal = analogRead(PIN_DUST_VO);
  delayMicroseconds(40);
  digitalWrite(PIN_DUST_LED, HIGH);
  delayMicroseconds(9680);

  float voltage = voVal * (5.0 / 1024.0);
  // Linear dust approximation: mg/m3 = 0.17 * voltage - 0.1
  float dustVal = (0.17 * voltage - 0.1) * 1000.0; // convert to ug/m3
  return (dustVal > 0.0) ? dustVal : 0.0;
}

void updateAlarms(int mq135Val, int mq2Val) {
  bool isDanger = (mq135Val > THRESHOLD_MQ135_DANGER) || 
                  (mq2Val > THRESHOLD_MQ2_DANGER);

  bool isWarning = (!isDanger) && (mq135Val > THRESHOLD_MQ135_WARN);

  if (isDanger) {
    digitalWrite(PIN_LED_RED, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_BUZZER, HIGH);
  } else if (isWarning) {
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_YELLOW, HIGH);
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_BUZZER, LOW);
  } else {
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_BUZZER, LOW);
  }
}

void loop() {
  unsigned long now = millis();
  if (now - lastReadTime >= READ_INTERVAL) {
    lastReadTime = now;

    float temperature = dht.readTemperature();
    float humidity    = dht.readHumidity();
    int mq135Value    = analogRead(PIN_MQ135);
    int mq2Value      = analogRead(PIN_MQ2);
    float dustDensity = readDustDensity();

    if (isnan(temperature) || isnan(humidity)) {
      temperature = 0.0;
      humidity = 0.0;
    }

    // Update on-site acoustic and LED indicators
    updateAlarms(mq135Value, mq2Value);

    // Format structured JSON telemetry for Web Application & Cloud broker
    // Example: {"temp":28.5,"hum":65.0,"aqi":180,"gas":95,"dust":34.2}
    String jsonPayload = "{";
    jsonPayload += "\"temp\":" + String(temperature, 1) + ",";
    jsonPayload += "\"hum\":" + String(humidity, 1) + ",";
    jsonPayload += "\"aqi\":" + String(mq135Value) + ",";
    jsonPayload += "\"gas\":" + String(mq2Value) + ",";
    jsonPayload += "\"dust\":" + String(dustDensity, 1);
    jsonPayload += "}";

    // Transmit over Hardware Serial1 directly to ESP8266 Wi-Fi Gateway
    Serial1.println(jsonPayload);

    // Print to USB Serial for developer console debugging
    Serial.println(jsonPayload);
  }
}
