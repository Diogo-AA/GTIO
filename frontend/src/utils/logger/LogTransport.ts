export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

export interface LogTransport {
  log(payload: LogPayload): void;
}
