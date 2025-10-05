import { describe, it, expect } from 'vitest'
import { convertSparplanElementsToSimulationResult, hasInflationAdjustedValues } from './chart-data-converter'
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
})
