import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { createMqttConnection } from './mqttConnection.js';

function fakeClient() {
  const client = new EventEmitter();
  client.subscribe = vi.fn();
  client.end = vi.fn();
  return client;
}

describe('createMqttConnection', () => {
  it('subscribes on connect, forwards messages, reports status and closes', () => {
    const client = fakeClient();
    const connect = vi.fn(() => client);
    const onMessage = vi.fn();
    const onStatus = vi.fn();

    const connection = createMqttConnection({
      url: 'wss://example.com/mqtt',
      topic: 'lab/telemetry',
      onMessage,
      onStatus,
      connect,
      random: () => 0.5,
    });

    expect(connect).toHaveBeenCalledWith('wss://example.com/mqtt', expect.objectContaining({ clean: true }));
    client.emit('connect');
    expect(onStatus).toHaveBeenCalledWith({ state: 'live' });
    expect(client.subscribe).toHaveBeenCalledWith('lab/telemetry', { qos: 0 });

    client.emit('message', 'lab/telemetry', { toString: () => '{"temp":28}' });
    expect(onMessage).toHaveBeenCalledWith('{"temp":28}');

    client.emit('reconnect');
    expect(onStatus).toHaveBeenCalledWith({ state: 'reconnecting' });

    client.emit('error', new Error('boom'));
    expect(onStatus).toHaveBeenCalledWith({ state: 'error', error: 'boom' });

    client.emit('close');
    expect(onStatus).toHaveBeenCalledWith({ state: 'offline' });

    onStatus.mockClear();
    connection.close();
    expect(client.end).toHaveBeenCalledWith(true);
    client.emit('close');
    expect(onStatus).not.toHaveBeenCalled();
  });
});
