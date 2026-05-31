export interface LogMessage {
  level: 'debug' | 'info' | 'warn' | 'error';
  module: string;
  message: string;
  error?: unknown;
  time: number;
}

export class Logger {
  constructor(
    private readonly logHandler: (message: LogMessage) => void,
    private readonly module: string,
  ) {}

  private log(level: LogMessage['level'], message: string, error?: unknown) {
    this.logHandler({
      level,
      module: this.module,
      message,
      error,
      time: Date.now(),
    });
  }

  debug(message: string) {
    this.log('debug', message);
  }

  info(message: string) {
    this.log('info', message);
  }

  warn(message: string, error?: unknown) {
    this.log('warn', message, error);
  }

  error(message: string, error?: unknown) {
    this.log('error', message, error);
  }
}
