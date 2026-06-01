import { createColoredLogHandler } from '../src';

const handler = createColoredLogHandler();

handler({
  level: 'debug',
  module: 'root',
  message: 'Debugging info',
  time: Date.now(),
});

handler({
  level: 'info',
  module: 'root',
  message: 'Bot is ready',
  time: Date.now() + 1000,
});

handler({
  level: 'warn',
  module: 'core',
  message: 'Low memory',
  time: Date.now() + 2000,
});

handler({
  level: 'error',
  module: 'core',
  message: 'Failed to start',
  error: new Error('boom'),
  time: Date.now() + 3000,
});
