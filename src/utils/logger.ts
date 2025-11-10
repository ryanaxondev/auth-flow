/**
 * src/utils/logger.ts
 * ----------------------------------------
 * Lightweight, extensible logger utility with colorized output and debug mode.
 *
 * Integrates:
 *  - console API (stdout / stderr)
 *
 * @module utils/logger
 * ----------------------------------------
 */

type LogLevel = "info" | "warn" | "error" | "debug";

/* ----------------------------------------
 * ANSI Colors
 * ----------------------------------------
 *
 * Terminal color codes mapped by log level.
 */
const colors = {
  reset: "\x1b[0m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  debug: "\x1b[90m",
};

/**
 * ----------------------------------------
 * Internal Log Dispatch
 * ----------------------------------------
 *
 * Normalizes formatting, timestamping and level prefixing.
 * Debug logs are only printed in development mode.
 */
function log(level: LogLevel, ...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  const color = colors[level] ?? colors.reset;
  const prefix = `${color}[${level.toUpperCase()}]${colors.reset} ${timestamp}`;

  if (level === "debug" && process.env.NODE_ENV !== "development") return;

  const formattedArgs = args.map((arg) => {
    if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
    if (typeof arg === "object") return JSON.stringify(arg, null, 2);
    return String(arg);
  });

  const consoleMethod =
    level === "error" ? "error" : level === "warn" ? "warn" : "log";

  // eslint-disable-next-line no-console
  console[consoleMethod](prefix, ...formattedArgs);
}

/* ----------------------------------------
 * Public Logger API
 * ----------------------------------------
 */
export const logger = {
  info: (...args: unknown[]) => log("info", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  error: (...args: unknown[]) => log("error", ...args),
  debug: (...args: unknown[]) => log("debug", ...args),
};

export default logger;
