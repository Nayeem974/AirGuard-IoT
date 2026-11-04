import mqtt from 'mqtt';

const url = process.env.MQTT_URL || 'mqtt://broker.hivemq.com:1883';
const topic = process.env.MQTT_TOPIC || 'airguard/telemetry';
const leak = process.argv.includes('--leak');
const client = mqtt.connect(url, {
  clientId: `airguard-sample-${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
});

let tick = 0;
let timer;

client.on('connect', () => {
  if (timer) return;
  console.log(`Publishing to ${url} on ${topic}${leak ? ' (gas leak)' : ''}`);
  timer = setInterval(() => {
    tick += 1;
    const payload = {
      temp: 28.5,
      hum: 65,
      aqi: 180,
      gas: leak ? 600 : 140 + Math.round(Math.sin(tick / 3) * 20),
      dust: 34.2,
    };
    client.publish(topic, JSON.stringify(payload));
    console.log(payload);
  }, 3000);
});

client.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  clearInterval(timer);
  client.end(true, () => process.exit(0));
});
