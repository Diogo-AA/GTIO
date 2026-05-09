import type { LogTransport, LogPayload } from "./LogTransport";
import { LogLevel } from "./LogTransport";
import { ServerTransport } from "./transports/ServerTransport";

class LoggerService {
  private transports: LogTransport[] = [];
  private minLevel: LogLevel = LogLevel.DEBUG;

  constructor() {
    // Now logging to the NGINX server to be visible in docker logs
    this.addTransport(new ServerTransport());
  }

  public addTransport(transport: LogTransport) {
    this.transports.push(transport);
  }

  public setMinLevel(level: LogLevel) {
    this.minLevel = level;
  }

  private emitLog(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
  ) {
    if (level < this.minLevel) return;

    const payload: LogPayload = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    this.transports.forEach((transport) => {
      try {
        transport.log(payload);
      } catch (err) {
        console.error("Failed to log to transport", err);
      }
    });
  }

  public debug(message: string, context?: Record<string, any>) {
    this.emitLog(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, any>) {
    this.emitLog(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>) {
    this.emitLog(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: Record<string, any>) {
    this.emitLog(LogLevel.ERROR, message, context);
  }
}

export const Logger = new LoggerService();
