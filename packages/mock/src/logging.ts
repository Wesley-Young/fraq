import type { LogHandler } from '@fraqjs/fraq';

export function createSimpleLogHandler(): LogHandler {
  return ({ time, level, module, message, error }) => {
    const timeStr = new Date(time).toISOString();
    const levelStr = level.toUpperCase();
    console.log(`[${timeStr} ${levelStr}] [${module}] ${message}`);
    if (error) {
      console.error(error);
    }
  };
}
