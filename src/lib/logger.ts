// Simple structured logger for the application
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    const levelName = LogLevel[level];

    let logMessage = `[${timestamp}] ${levelName}: ${message}`;

    if (context && Object.keys(context).length > 0) {
      logMessage += ` | Context: ${JSON.stringify(context)}`;
    }

    if (error) {
      logMessage += ` | Error: ${error.message}`;
      if (error.stack) {
        logMessage += ` | Stack: ${error.stack}`;
      }
    }

    return logMessage;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedLog = this.formatLog(entry);

    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.ERROR:
        // eslint-disable-next-line no-console
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(formattedLog);
        break;
    }
  }

  error(
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
}

// Create logger instance
const logLevel =
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
export const logger = new Logger(logLevel);
