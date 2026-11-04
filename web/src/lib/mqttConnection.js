import mqtt from 'mqtt';

export function createMqttConnection({
  url,
  topic,
  onMessage,
  onStatus,
  connect = mqtt.connect,
  random = Math.random,
}) {
  let closed = false;
  const client = connect(url, {
    clientId: `airguard-web-${Math.floor(random() * 0xffffffff).toString(16)}`,
    clean: true,
    reconnectPeriod: 4000,
    connectTimeout: 8000,
  });

  client.on('connect', () => {
    onStatus({ state: 'live' });
    client.subscribe(topic, { qos: 0 });
  });
  client.on('reconnect', () => onStatus({ state: 'reconnecting' }));
  client.on('error', (error) => onStatus({ state: 'error', error: error.message }));
  client.on('close', () => {
    if (!closed) onStatus({ state: 'offline' });
  });
  client.on('message', (_topic, payload) => onMessage(payload.toString()));

  return {
    close() {
      closed = true;
      client.end(true);
    },
  };
}
