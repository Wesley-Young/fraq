import type { LogHandler, LogLevel } from '@fraqjs/fraq';
import chalk, { type ChalkInstance } from 'chalk';

export interface ColoredLogHandlerOptions {
  minLevel: LogLevel;
  dateTime?: {
    locale?: Intl.LocalesArgument;
    options?: Intl.DateTimeFormatOptions;
  };
  chalks?: {
    dateTime?: ChalkInstance;
    level?: {
      debug?: ChalkInstance;
      info?: ChalkInstance;
      warn?: ChalkInstance;
      error?: ChalkInstance;
    };
    module?: ChalkInstance;
    message?: ChalkInstance;
  };
}

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function createColoredLogHandler(options: ColoredLogHandlerOptions): LogHandler {
  const toLocaleStringOptions = options.dateTime?.options ?? {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const dateTimeChalk = options.chalks?.dateTime ?? chalk.bold.greenBright;
  const debugChalk = options.chalks?.level?.debug ?? chalk.blueBright;
  const infoChalk = options.chalks?.level?.info ?? chalk.green;
  const warnAndRestChalk = options.chalks?.level?.warn ?? chalk.yellowBright;
  const errorAndRestChalk = options.chalks?.level?.error ?? chalk.redBright;
  const debugAndInfoModuleChalk = options.chalks?.module ?? chalk.cyan;
  const debugAndInfoMessageChalk = options.chalks?.message;

  return ({ time, level, module, message, error }) => {
    if (levelPriority[level] < levelPriority[options.minLevel]) {
      return;
    }

    const dateTimeStr = dateTimeChalk(
      new Date(time).toLocaleString(options.dateTime?.locale ?? 'zh-CN', toLocaleStringOptions),
    );
    let levelStr: string, moduleStr: string, messageStr: string, errorStr: string | undefined;

    switch (level) {
      case 'debug':
        levelStr = debugChalk('DEBUG');
        moduleStr = debugAndInfoModuleChalk(module);
        messageStr = debugAndInfoMessageChalk ? debugAndInfoMessageChalk(message) : message;
        break;
      case 'info':
        levelStr = infoChalk(' INFO');
        moduleStr = debugAndInfoModuleChalk(module);
        messageStr = debugAndInfoMessageChalk ? debugAndInfoMessageChalk(message) : message;
        break;
      case 'warn':
        levelStr = warnAndRestChalk(' WARN');
        moduleStr = warnAndRestChalk(module);
        messageStr = warnAndRestChalk(message);
        if (error) {
          if (error instanceof Error) {
            errorStr = warnAndRestChalk(error.stack ?? error.message);
          } else {
            errorStr = warnAndRestChalk(String(error));
          }
        }
        break;
      case 'error':
        levelStr = errorAndRestChalk('ERROR');
        moduleStr = errorAndRestChalk(module);
        messageStr = errorAndRestChalk(message);
        if (error) {
          if (error instanceof Error) {
            errorStr = errorAndRestChalk(error.stack ?? error.message);
          } else {
            errorStr = errorAndRestChalk(String(error));
          }
        }
        break;
      default:
        levelStr = level as string; // never
        moduleStr = module;
        messageStr = message;
        break;
    }
    console.log(dateTimeStr, levelStr, moduleStr, messageStr);
    if (errorStr) {
      console.log(errorStr);
    }
  };
}
