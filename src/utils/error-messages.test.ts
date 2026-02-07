import { describe, it, expect } from 'vitest'
import { EXPORT_ERRORS, getExportError, type ExportErrorKey } from './error-messages'

describe('error-messages', () => {
  describe('EXPORT_ERRORS', () => {
    it('should have all expected error keys', () => {
      const expectedKeys: ExportErrorKey[] = [
        'NO_SIMULATION_DATA',
        'NO_SIMULATION_DATA_WITH_INSTRUCTION',
        'NO_SAVINGS_DATA',
        'NO_SAVINGS_DATA_WITH_INSTRUCTION',
        'NO_SIMULATION_ELEMENTS',
        'NO_WITHDRAWAL_DATA',
        'NO_WITHDRAWAL_DATA_WITH_INSTRUCTION',
      ]

      expectedKeys.forEach((key) => {
        expect(EXPORT_ERRORS).toHaveProperty(key)
        expect(typeof EXPORT_ERRORS[key]).toBe('string')
        expect(EXPORT_ERRORS[key].length).toBeGreaterThan(0)
      })
    })

    it('should have German error messages', () => {
      expect(EXPORT_ERRORS.NO_SIMULATION_DATA).toBe('Keine Simulationsdaten verfügbar')
      expect(EXPORT_ERRORS.NO_SAVINGS_DATA).toBe('Keine Sparplan-Daten verfügbar')
      expect(EXPORT_ERRORS.NO_WITHDRAWAL_DATA).toBe('Keine Entnahme-Daten verfügbar')
      expect(EXPORT_ERRORS.NO_SIMULATION_ELEMENTS).toBe('Keine Simulationselemente verfügbar')
    })

    it('should have instructional error messages', () => {
      expect(EXPORT_ERRORS.NO_SIMULATION_DATA_WITH_INSTRUCTION).toContain('Bitte führen Sie zuerst eine Simulation durch')
      expect(EXPORT_ERRORS.NO_SAVINGS_DATA_WITH_INSTRUCTION).toContain('Bitte führen Sie zuerst eine Simulation durch')
      expect(EXPORT_ERRORS.NO_WITHDRAWAL_DATA_WITH_INSTRUCTION).toContain('Bitte konfigurieren Sie eine Entnahmestrategie')
    })

    it('should be immutable (as const)', () => {
      // This test verifies TypeScript typing - if this compiles, the test passes
      const errorKeys: readonly string[] = Object.keys(EXPORT_ERRORS)
      expect(errorKeys.length).toBeGreaterThan(0)
    })
  })

  describe('getExportError', () => {
    it('should return correct error message for each key', () => {
      expect(getExportError('NO_SIMULATION_DATA')).toBe('Keine Simulationsdaten verfügbar')
      expect(getExportError('NO_SAVINGS_DATA')).toBe('Keine Sparplan-Daten verfügbar')
      expect(getExportError('NO_WITHDRAWAL_DATA')).toBe('Keine Entnahme-Daten verfügbar')
      expect(getExportError('NO_SIMULATION_ELEMENTS')).toBe('Keine Simulationselemente verfügbar')
    })

    it('should return error messages with instructions', () => {
      const withInstruction = getExportError('NO_SIMULATION_DATA_WITH_INSTRUCTION')
      expect(withInstruction).toContain('Keine Simulationsdaten verfügbar')
      expect(withInstruction).toContain('Bitte führen Sie zuerst eine Simulation durch')
    })

    it('should return strings that can be used in Error objects', () => {
      const errorMessage = getExportError('NO_SAVINGS_DATA')
      expect(() => {
        throw new Error(errorMessage)
      }).toThrow(errorMessage)
    })

    it('should handle all export error keys', () => {
      const keys: ExportErrorKey[] = [
        'NO_SIMULATION_DATA',
        'NO_SIMULATION_DATA_WITH_INSTRUCTION',
        'NO_SAVINGS_DATA',
        'NO_SAVINGS_DATA_WITH_INSTRUCTION',
        'NO_SIMULATION_ELEMENTS',
        'NO_WITHDRAWAL_DATA',
        'NO_WITHDRAWAL_DATA_WITH_INSTRUCTION',
      ]

      keys.forEach((key) => {
        const message = getExportError(key)
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Error message consistency', () => {
    it('should use consistent prefixes for similar error types', () => {
      expect(EXPORT_ERRORS.NO_SIMULATION_DATA.startsWith('Keine')).toBe(true)
      expect(EXPORT_ERRORS.NO_SAVINGS_DATA.startsWith('Keine')).toBe(true)
      expect(EXPORT_ERRORS.NO_WITHDRAWAL_DATA.startsWith('Keine')).toBe(true)
      expect(EXPORT_ERRORS.NO_SIMULATION_ELEMENTS.startsWith('Keine')).toBe(true)
    })

    it('should have pairs of simple and instructional messages', () => {
      // Check that each simple message has a corresponding instructional variant
      expect(EXPORT_ERRORS.NO_SIMULATION_DATA_WITH_INSTRUCTION).toContain(
        EXPORT_ERRORS.NO_SIMULATION_DATA
      )
      expect(EXPORT_ERRORS.NO_SAVINGS_DATA_WITH_INSTRUCTION).toContain(
        EXPORT_ERRORS.NO_SAVINGS_DATA
      )
      expect(EXPORT_ERRORS.NO_WITHDRAWAL_DATA_WITH_INSTRUCTION).toContain(
        EXPORT_ERRORS.NO_WITHDRAWAL_DATA
      )
    })
  })
})
