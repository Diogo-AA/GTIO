import type { LogTransport, LogPayload } from "../LogTransport";
import { LogLevel } from "../LogTransport";

export class ServerTransport implements LogTransport {
  log(payload: LogPayload): void {
    const { level, message, context } = payload;

    let levelStr = "INFO";
    switch (level) {
      case LogLevel.DEBUG:
        levelStr = "DEBUG";
        break;
      case LogLevel.INFO:
        levelStr = "INFO";
        break;
      case LogLevel.WARN:
        levelStr = "WARN";
        break;
      case LogLevel.ERROR:
        levelStr = "ERROR";
        break;
    }

    let fullMessage = message;
    if (context) {
      try {
        // Keep it relatively short for NGINX logs
        fullMessage += " " + JSON.stringify(context);
      } catch (e) {
        // ignore stringify errors
      }
    }

    // Remove newlines because HTTP headers cannot contain them
    const headerMessage = fullMessage.replace(/[\r\n]+/g, " ");

    try {
      // Fire and forget GET request to Nginx to register the log.
      // We use headers instead of query params so NGINX doesn't print URL-escaped characters.
      fetch(`/_client_log`, {
        method: "GET",
        keepalive: true,
        headers: {
          "x-client-log-level": levelStr,
          "x-client-log-msg": headerMessage,
        },
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  }
}
