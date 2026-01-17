import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  logError,
  logWarning,
  logInfo,
  logDebug,
  configureLogger,
  resetLogger,
} from './logger'

describe('logger', () => {
  // Spy on console methods
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

  beforeEach(() => {
    // Reset logger and clear console spies before each test
    resetLogger()
    consoleErrorSpy.mockClear()
    consoleWarnSpy.mockClear()
    consoleInfoSpy.mockClear()
    consoleDebugSpy.mockClear()
  })

  afterEach(() => {
    resetLogger()
  })

  describe('logError', () => {
    it('should log error messages to console', () => {
      logError('Test error message')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test error message')
    })

    it('should include context in error messages', () => {
      logError('Test error', 'TestContext')
      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext] Test error')
    })

    it('should include error object in console output', () => {
      const error = new Error('Test error object')
      logError('Test error', 'TestContext', error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext] Test error', error)
    })

    it('should handle error without context', () => {
      const error = new Error('Test error')
      logError('Test error', undefined, error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test error', error)
    })
  })

  describe('logWarning', () => {
    it('should log warning messages to console', () => {
      logWarning('Test warning')
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledWith('Test warning')
    })

    it('should include context in warning messages', () => {
      logWarning('Test warning', 'TestContext')
      expect(consoleWarnSpy).toHaveBeenCalledWith('[TestContext] Test warning')
    })
  })

  describe('logInfo', () => {
    it('should log info messages when configured', () => {
      configureLogger({ minLevel: 'info' })
      logInfo('Test info')
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
      expect(consoleInfoSpy).toHaveBeenCalledWith('Test info')
    })

    it('should not log info when min level is error', () => {
      configureLogger({ minLevel: 'error' })
      logInfo('Test info')
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('should include context in info messages', () => {
      configureLogger({ minLevel: 'info' })
      logInfo('Test info', 'TestContext')
      expect(consoleInfoSpy).toHaveBeenCalledWith('[TestContext] Test info')
    })
  })

  describe('logDebug', () => {
    it('should log debug messages when configured', () => {
      configureLogger({ minLevel: 'debug' })
      logDebug('Test debug')
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1)
      expect(consoleDebugSpy).toHaveBeenCalledWith('Test debug')
    })

    it('should not log debug when min level is error', () => {
      configureLogger({ minLevel: 'error' })
      logDebug('Test debug')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('should include context in debug messages', () => {
      configureLogger({ minLevel: 'debug' })
      logDebug('Test debug', 'TestContext')
      expect(consoleDebugSpy).toHaveBeenCalledWith('[TestContext] Test debug')
    })
  })

  describe('log level filtering', () => {
    it('should respect minLevel configuration for error level', () => {
      configureLogger({ minLevel: 'error' })
      
      logError('Error message')
      logWarning('Warning message')
      logInfo('Info message')
      logDebug('Debug message')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('should respect minLevel configuration for warn level', () => {
      configureLogger({ minLevel: 'warn' })
      
      logError('Error message')
      logWarning('Warning message')
      logInfo('Info message')
      logDebug('Debug message')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('should respect minLevel configuration for info level', () => {
      configureLogger({ minLevel: 'info' })
      
      logError('Error message')
      logWarning('Warning message')
      logInfo('Info message')
      logDebug('Debug message')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('should log all levels when minLevel is debug', () => {
      configureLogger({ minLevel: 'debug' })
      
      logError('Error message')
      logWarning('Warning message')
      logInfo('Info message')
      logDebug('Debug message')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('console output control', () => {
    it('should not output to console when disabled', () => {
      configureLogger({ consoleEnabled: false })
      
      logError('Error message')
      logWarning('Warning message')

      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should output to console when enabled (default)', () => {
      logError('Error message')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('external handler', () => {
    it('should call external handler when configured', () => {
      const externalHandler = vi.fn()
      configureLogger({ externalHandler })

      logError('Test error', 'TestContext')

      expect(externalHandler).toHaveBeenCalledTimes(1)
      expect(externalHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Test error',
          context: 'TestContext',
          timestamp: expect.any(Date),
        })
      )
    })

    it('should pass error object to external handler', () => {
      const externalHandler = vi.fn()
      configureLogger({ externalHandler })

      const error = new Error('Test error')
      logError('Test error', 'TestContext', error)

      expect(externalHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Test error',
          context: 'TestContext',
          error,
        })
      )
    })

    it('should call external handler for all log levels', () => {
      const externalHandler = vi.fn()
      configureLogger({ minLevel: 'debug', externalHandler })

      logError('Error')
      logWarning('Warning')
      logInfo('Info')
      logDebug('Debug')

      expect(externalHandler).toHaveBeenCalledTimes(4)
    })

    it('should not call external handler when consoleEnabled is false but still respect minLevel', () => {
      const externalHandler = vi.fn()
      configureLogger({ consoleEnabled: false, externalHandler, minLevel: 'error' })

      logError('Error')
      logWarning('Warning') // Should not be logged due to minLevel

      expect(externalHandler).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })
  })

  describe('resetLogger', () => {
    it('should reset configuration to defaults', () => {
      configureLogger({ minLevel: 'debug', consoleEnabled: false })
      resetLogger()
      
      logError('Error message')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      
      logDebug('Debug message')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })
  })

  describe('configureLogger', () => {
    it('should allow partial configuration updates', () => {
      configureLogger({ minLevel: 'warn' })
      logWarning('Warning')
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)

      configureLogger({ minLevel: 'error' })
      consoleWarnSpy.mockClear()
      logWarning('Warning')
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should maintain previous configuration when updating', () => {
      const externalHandler = vi.fn()
      configureLogger({ externalHandler, minLevel: 'info' })
      configureLogger({ minLevel: 'debug' })

      logDebug('Debug message')
      expect(externalHandler).toHaveBeenCalledTimes(1)
    })
  })
})
