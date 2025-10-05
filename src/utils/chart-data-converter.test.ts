import { describe, it, expect } from 'vitest'
import {
  convertSparplanElementsToSimulationResult,
  hasInflationAdjustedValues,
  convertWithdrawalResultToSimulationResult,
  hasWithdrawalInflationAdjustedValues,
} from './chart-data-converter'
import type { SparplanElement } from './sparplan-utils'

describe('chart-data-converter', () => {
  describe('convertSparplanElementsToSimulationResult', () => {
    it('returns empty object for undefined or empty elements', () => {
      expect(convertSparplanElementsToSimulationResult(undefined)).toEqual({})
      expect(convertSparplanElementsToSimulationResult([])).toEqual({})
    })

    it('converts single element correctly', () => {
      const mockElement: SparplanElement = {
        start: '2025-01-01',
        type: 'sparplan',
        einzahlung: 1000,
        simulation: {
          2025: {
            startkapital: 1000,
            zinsen: 50,
            endkapital: 1050,
            bezahlteSteuer: 10,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          },
          2026: {
            startkapital: 2050,
            zinsen: 102.5,
            endkapital: 2152.5,
            bezahlteSteuer: 20,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          },
        },
      }

      const result = convertSparplanElementsToSimulationResult([mockElement])

      expect(result).toEqual({
        2025: {
          startkapital: 1000,
          zinsen: 50,
          endkapital: 1050,
          bezahlteSteuer: 10,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
        2026: {
          startkapital: 2050,
          zinsen: 102.5,
          endkapital: 2152.5,
          bezahlteSteuer: 20,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      })
    })

    it('accumulates values from multiple elements', () => {
      const mockElements: SparplanElement[] = [
        {
          start: '2025-01-01',
          type: 'sparplan',
          einzahlung: 1000,
          simulation: {
            2025: {
              startkapital: 1000,
              zinsen: 50,
              endkapital: 1050,
              bezahlteSteuer: 10,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
          },
        },
        {
          start: '2025-01-01',
          type: 'sparplan',
          einzahlung: 500,
          simulation: {
            2025: {
              startkapital: 500,
              zinsen: 25,
              endkapital: 525,
              bezahlteSteuer: 5,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
          },
        },
      ]

      const result = convertSparplanElementsToSimulationResult(mockElements)

      expect(result[2025]).toEqual({
        startkapital: 1500,
        zinsen: 75,
        endkapital: 1575,
        bezahlteSteuer: 15,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      })
    })

    it('handles inflation-adjusted values correctly', () => {
      const mockElement: SparplanElement = {
        start: '2025-01-01',
        type: 'sparplan',
        einzahlung: 1000,
        simulation: {
          2025: {
            startkapital: 1000,
            zinsen: 50,
            endkapital: 1050,
            bezahlteSteuer: 10,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
            startkapitalReal: 950,
            zinsenReal: 45,
            endkapitalReal: 995,
          },
        },
      }

      const result = convertSparplanElementsToSimulationResult([mockElement])

      expect(result[2025].startkapitalReal).toBe(950)
      expect(result[2025].zinsenReal).toBe(45)
      expect(result[2025].endkapitalReal).toBe(995)
    })
  })

  describe('hasInflationAdjustedValues', () => {
    it('returns true when real values are present', () => {
      const simulationResult = {
        2025: {
          startkapital: 1000,
          zinsen: 50,
          endkapital: 1050,
          bezahlteSteuer: 10,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
          startkapitalReal: 950,
          endkapitalReal: 995,
        },
      }

      expect(hasInflationAdjustedValues(simulationResult)).toBe(true)
    })

    it('returns false when no real values are present', () => {
      const simulationResult = {
        2025: {
          startkapital: 1000,
          zinsen: 50,
          endkapital: 1050,
          bezahlteSteuer: 10,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      }

      expect(hasInflationAdjustedValues(simulationResult)).toBe(false)
    })

    it('returns false for empty simulation result', () => {
      expect(hasInflationAdjustedValues({})).toBe(false)
    })
  })

  describe('convertWithdrawalResultToSimulationResult', () => {
    it('returns empty object for undefined or invalid input', () => {
      expect(convertWithdrawalResultToSimulationResult(undefined)).toEqual({})
      expect(convertWithdrawalResultToSimulationResult(null)).toEqual({})
      expect(convertWithdrawalResultToSimulationResult('invalid')).toEqual({})
    })

    it('converts withdrawal result correctly', () => {
      const mockWithdrawalResult = {
        2041: {
          startkapital: 400000,
          entnahme: 16000,
          endkapital: 396000,
          bezahlteSteuer: 1000,
          genutzterFreibetrag: 2000,
          zinsen: 12000,
          vorabpauschale: 500,
          einkommensteuer: 200,
          genutzterGrundfreibetrag: 5000,
        },
        2042: {
          startkapital: 396000,
          entnahme: 16500,
          endkapital: 390000,
          bezahlteSteuer: 1100,
          genutzterFreibetrag: 1900,
          zinsen: 10500,
        },
      }

      const result = convertWithdrawalResultToSimulationResult(mockWithdrawalResult)

      expect(result).toEqual({
        2041: {
          startkapital: 400000,
          zinsen: 12000,
          endkapital: 396000,
          bezahlteSteuer: 1000,
          genutzterFreibetrag: 2000,
          vorabpauschale: 500,
          vorabpauschaleAccumulated: 0,
        },
        2042: {
          startkapital: 396000,
          zinsen: 10500,
          endkapital: 390000,
          bezahlteSteuer: 1100,
          genutzterFreibetrag: 1900,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      })
    })

    it('handles missing fields gracefully', () => {
      const mockWithdrawalResult = {
        2041: {
          startkapital: 400000,
          endkapital: 396000,
          // Missing other fields
        },
      }

      const result = convertWithdrawalResultToSimulationResult(mockWithdrawalResult)

      expect(result[2041]).toEqual({
        startkapital: 400000,
        zinsen: 0,
        endkapital: 396000,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      })
    })
  })

  describe('hasWithdrawalInflationAdjustedValues', () => {
    it('returns false for withdrawal results (no separate real values)', () => {
      const mockWithdrawalResult = {
        2041: {
          startkapital: 400000,
          entnahme: 16000,
          endkapital: 396000,
        },
      }

      expect(hasWithdrawalInflationAdjustedValues(mockWithdrawalResult)).toBe(false)
    })
  })
})
