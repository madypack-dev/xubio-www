export type LoggerContext = Record<string, unknown>;

export interface AppLogger {
  info(message: string, context?: LoggerContext): void;
  warn(message: string, context?: LoggerContext): void;
  error(message: string, context?: LoggerContext): void;
}

function withContext(context?: LoggerContext) {
  return context ?? {};
}

export function createLogger(scope: string): AppLogger {
  return {
    info(message, context) {
      console.info(`[${scope}] ${message}`, withContext(context));
    },
    warn(message, context) {
      console.warn(`[${scope}] ${message}`, withContext(context));
    },
    error(message, context) {
      console.error(`[${scope}] ${message}`, withContext(context));
    }
  };
}
