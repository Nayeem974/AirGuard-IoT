/**
 * AirGuard IoT - ESP8266 Wi-Fi & MQTT Cloud Gateway
 * Hardware: ESP8266 (NodeMCU / ESP-01 / Wemos D1 Mini)
 * Authors: 
 *   1. MD. Fahad Rahman (ID: 0432320005101071)
 *   2. Zannatul Nayem (ID: 0432320005101063)
 *   3. Shafayet Hossain Shafin (ID: 0432320005101088)
 * Batch: 54th Batch | Section: 6B1
 * Course: CSE402 - Internet of Things Lab (Autumn 26)
 * Institution: University of Information Technology and Sciences
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// --- Wi-Fi Configuration ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// --- MQTT Broker Configuration ---
// Options: broker.hivemq.com / broker.emqx.io / mqtt.thingspeak.com
const char* MQTT_BROKER   = "broker.hivemq.com";
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC_PUB = "airguard/telemetry";

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setupWiFi() {
  delay(10);
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected. IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "AirGuardClient-" + String(random(0xffff), HEX);

    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("connected to MQTT broker!");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(9600); // Receives telemetry from Arduino Mega 2560 Serial1
  setupWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Listen for incoming JSON telemetry lines from Arduino Uno
  if (Serial.available() > 0) {
    String payload = Serial.readStringUntil('\n');
    payload.trim();

    // Verify valid JSON boundaries
    if (payload.startsWith("{") && payload.endsWith("}")) {
      Serial.print("Forwarding to Cloud: ");
      Serial.println(payload);

      mqttClient.publish(MQTT_TOPIC_PUB, payload.c_str());
    }
  }
}
