/**
 * Centralized logging utility for the application
 * 
 * This module provides a consistent interface for logging throughout the application.
 * It centralizes error handling and makes it easier to integrate external logging
 * services (like Sentry, LogRocket, etc.) in the future.
 */

/**
 * Log levels for categorizing messages
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  error?: Error
  timestamp: Date
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  /** Whether to output to console in development */
  consoleEnabled: boolean
  /** Minimum log level to output */
  minLevel: LogLevel
  /** External logging service handler (e.g., Sentry) */
  externalHandler?: (entry: LogEntry) => void
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  consoleEnabled: true,
  minLevel: 'warn',
}

let config: LoggerConfig = { ...defaultConfig }

/**
 * Log level priorities for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Configure the logger
 * @param newConfig - Partial configuration to update
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig }
}

/**
 * Check if a log level should be output based on configuration
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel]
}

/**
 * Format log message with context
 */
function formatMessage(message: string, context?: string): string {
  const contextPrefix = context ? `[${context}] ` : ''
  return `${contextPrefix}${message}`
}

/**
 * Output log entry to console
 */
function outputToConsole(level: LogLevel, fullMessage: string, error?: Error): void {
  switch (level) {
    case 'error':
      if (error) {
        console.error(fullMessage, error)
      } else {
        console.error(fullMessage)
      }
      break
    case 'warn':
      console.warn(fullMessage)
      break
    case 'info':
      console.info(fullMessage)
      break
    case 'debug':
      console.debug(fullMessage)
      break
  }
}

/**
 * Internal logging function
 */
function log(level: LogLevel, message: string, context?: string, error?: Error): void {
  if (!shouldLog(level)) {
    return
  }

  const entry: LogEntry = {
    level,
    message,
    context,
    error,
    timestamp: new Date(),
  }

  // Output to console if enabled
  if (config.consoleEnabled) {
    const fullMessage = formatMessage(message, context)
    outputToConsole(level, fullMessage, error)
  }

  // Send to external handler if configured
  if (config.externalHandler) {
    config.externalHandler(entry)
  }
}

/**
 * Log an error message
 * @param message - Error message
 * @param context - Optional context (e.g., component name, function name)
 * @param error - Optional Error object
 */
export function logError(message: string, context?: string, error?: Error): void {
  log('error', message, context, error)
}

/**
 * Log a warning message
 * @param message - Warning message
 * @param context - Optional context
 */
export function logWarning(message: string, context?: string): void {
  log('warn', message, context)
}

/**
 * Log an info message
 * @param message - Info message
 * @param context - Optional context
 */
export function logInfo(message: string, context?: string): void {
  log('info', message, context)
}

/**
 * Log a debug message
 * @param message - Debug message
 * @param context - Optional context
 */
export function logDebug(message: string, context?: string): void {
  log('debug', message, context)
}

/**
 * Reset logger configuration to defaults
 * Useful for testing
 */
export function resetLogger(): void {
  config = { ...defaultConfig }
}
