import { Context, definePlugin, type LogMessage } from '../src';

import assert from 'node:assert/strict';
import test from 'node:test';

function createTestContext(logs: LogMessage[] = []): Context {
  return Context.create({
    connect: {
      baseUrl: 'http://localhost:30001/',
    },
    logHandler(message) {
      logs.push(message);
    },
  });
}

function snapshot(message: LogMessage): Omit<LogMessage, 'time'> {
  const { time: _time, ...rest } = message;
  return rest;
}

test('logger emits structured log messages', () => {
  const logs: LogMessage[] = [];
  const ctx = createTestContext(logs);
  const warnError = new Error('warn detail');
  const errorDetail = new Error('error detail');

  ctx.logger.debug('debug message');
  ctx.logger.info('info message');
  ctx.logger.warn('warn message', warnError);
  ctx.logger.error('error message', errorDetail);

  assert.deepEqual(logs.map(snapshot), [
    {
      level: 'debug',
      module: 'context',
      message: 'debug message',
      error: undefined,
    },
    {
      level: 'info',
      module: 'context',
      message: 'info message',
      error: undefined,
    },
    {
      level: 'warn',
      module: 'context',
      message: 'warn message',
      error: warnError,
    },
    {
      level: 'error',
      module: 'context',
      message: 'error message',
      error: errorDetail,
    },
  ]);
  assert.equal(
    logs.every((message) => typeof message.time === 'number'),
    true,
  );
});

test('plugin receives a logger proxy scoped to the plugin name', async () => {
  const logs: LogMessage[] = [];
  const parent = createTestContext(logs);
  const child = parent.fork('child');
  let pluginLogger: Context['logger'] | undefined;

  child.install(
    definePlugin({
      name: 'plugin-logger',
      apply(ctx) {
        pluginLogger = ctx.logger;

        assert.equal(ctx.logger, pluginLogger);
        assert.notEqual(ctx.logger, child.logger);

        ctx.logger.info('plugin message');
      },
    }),
  );

  await child.start();

  assert.ok(pluginLogger);
  assert.deepEqual(logs.map(snapshot), [
    {
      level: 'info',
      module: 'plugin-logger',
      message: 'plugin message',
      error: undefined,
    },
  ]);
});
