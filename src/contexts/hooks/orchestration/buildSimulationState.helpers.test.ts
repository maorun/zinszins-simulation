import { describe, it, expect } from 'vitest'
import type { useSimulationState } from '../useSimulationState'
import {
  extractReturnConfig,
  extractTaxConfig,
  extractInflationConfig,
  extractSimulationBasics,
  extractDependencies,
} from './buildSimulationState.helpers'
import { createDefaultMultiAssetConfig } from '../../../../helpers/multi-asset-portfolio'

// Mock state with all required properties
const createMockState = (): ReturnType<typeof useSimulationState> =>
  ({
    rendite: 5,
    returnMode: 'fixed' as const,
    averageReturn: 7,
    standardDeviation: 15,
    randomSeed: 12345,
    variableReturns: { 2024: 5.5, 2025: 6.0 },
    historicalIndex: 'MSCI_WORLD',
    blackSwanReturns: { 2030: -30 },
    inflationScenarioRates: { 2024: 2.5 },
    inflationScenarioReturnModifiers: { 2024: 0.5 },
    multiAssetConfig: createDefaultMultiAssetConfig(),
    simulationAnnual: 'yearly' as const,
    sparplanElemente: [],
    startEnd: [2023, 2040] as [number, number],
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2024: 2000, 2025: 2100 },
    basiszinsConfiguration: {
      2024: { year: 2024, rate: 2.5, source: 'manual' as const },
    },
    steuerReduzierenEndkapitalSparphase: true,
    inflationAktivSparphase: true,
    inflationsrateSparphase: 2.5,
    inflationAnwendungSparphase: 'sparplan' as const,
    guenstigerPruefungAktiv: true,
    personalTaxRate: 42,
  }) as any

describe('buildSimulationState.helpers', () => {
  describe('extractReturnConfig', () => {
    it('extracts all return-related properties', () => {
      const mockState = createMockState()
      const result = extractReturnConfig(mockState)

      expect(result).toEqual({
        rendite: 5,
        returnMode: 'fixed',
        averageReturn: 7,
        standardDeviation: 15,
        randomSeed: 12345,
        variableReturns: { 2024: 5.5, 2025: 6.0 },
        historicalIndex: 'MSCI_WORLD',
        blackSwanReturns: { 2030: -30 },
        inflationScenarioRates: { 2024: 2.5 },
        inflationScenarioReturnModifiers: { 2024: 0.5 },
        multiAssetConfig: expect.any(Object),
      })
    })

    it('handles null/undefined values', () => {
      const mockState = createMockState()
      mockState.blackSwanReturns = null
      mockState.inflationScenarioRates = null
      mockState.randomSeed = undefined

      const result = extractReturnConfig(mockState)

      expect(result.blackSwanReturns).toBeNull()
      expect(result.inflationScenarioRates).toBeNull()
      expect(result.randomSeed).toBeUndefined()
    })
  })

  describe('extractTaxConfig', () => {
    it('extracts all tax-related properties', () => {
      const mockState = createMockState()
      const result = extractTaxConfig(mockState)

      expect(result).toEqual({
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { 2024: 2000, 2025: 2100 },
        basiszinsConfiguration: {
          2024: { year: 2024, rate: 2.5, source: 'manual' },
        },
        steuerReduzierenEndkapitalSparphase: true,
        guenstigerPruefungAktiv: true,
        personalTaxRate: 42,
      })
    })

    it('handles false boolean values', () => {
      const mockState = createMockState()
      mockState.steuerReduzierenEndkapitalSparphase = false
      mockState.guenstigerPruefungAktiv = false

      const result = extractTaxConfig(mockState)

      expect(result.steuerReduzierenEndkapitalSparphase).toBe(false)
      expect(result.guenstigerPruefungAktiv).toBe(false)
    })

    it('handles empty freibetragPerYear', () => {
      const mockState = createMockState()
      mockState.freibetragPerYear = {}

      const result = extractTaxConfig(mockState)

      expect(result.freibetragPerYear).toEqual({})
    })
  })

  describe('extractInflationConfig', () => {
    it('extracts all inflation-related properties', () => {
      const mockState = createMockState()
      const result = extractInflationConfig(mockState)

      expect(result).toEqual({
        inflationAktivSparphase: true,
        inflationsrateSparphase: 2.5,
        inflationAnwendungSparphase: 'sparplan',
      })
    })

    it('handles gesamtmenge inflation mode', () => {
      const mockState = createMockState()
      mockState.inflationAnwendungSparphase = 'gesamtmenge'

      const result = extractInflationConfig(mockState)

      expect(result.inflationAnwendungSparphase).toBe('gesamtmenge')
    })

    it('handles inactive inflation', () => {
      const mockState = createMockState()
      mockState.inflationAktivSparphase = false
      mockState.inflationsrateSparphase = 0

      const result = extractInflationConfig(mockState)

      expect(result.inflationAktivSparphase).toBe(false)
      expect(result.inflationsrateSparphase).toBe(0)
    })
  })

  describe('extractSimulationBasics', () => {
    it('extracts basic simulation properties', () => {
      const mockState = createMockState()
      const result = extractSimulationBasics(mockState)

      expect(result).toEqual({
        simulationAnnual: 'yearly',
        sparplanElemente: [],
        startEnd: [2023, 2040],
      })
    })

    it('handles monthly simulation mode', () => {
      const mockState = createMockState()
      mockState.simulationAnnual = 'monthly'

      const result = extractSimulationBasics(mockState)

      expect(result.simulationAnnual).toBe('monthly')
    })

    it('handles non-empty sparplan elements', () => {
      const mockState = createMockState()
      mockState.sparplanElemente = [
        { typ: 'sparplan', jahr: 2024, monat: 1, betrag: 1000 },
      ] as any

      const result = extractSimulationBasics(mockState)

      expect(result.sparplanElemente).toHaveLength(1)
      expect(result.sparplanElemente[0]).toMatchObject({
        typ: 'sparplan',
        jahr: 2024,
        betrag: 1000,
      })
    })
  })

  describe('extractDependencies', () => {
    it('returns array with all state properties', () => {
      const mockState = createMockState()
      const result = extractDependencies(mockState)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(24)
    })

    it('includes all properties in correct order', () => {
      const mockState = createMockState()
      const result = extractDependencies(mockState)

      // Check first few properties
      expect(result[0]).toBe(5) // rendite
      expect(result[1]).toBe('fixed') // returnMode
      expect(result[2]).toBe(7) // averageReturn
      expect(result[3]).toBe(15) // standardDeviation

      // Check last few properties
      expect(result[20]).toBe(2.5) // inflationsrateSparphase
      expect(result[21]).toBe('sparplan') // inflationAnwendungSparphase
      expect(result[22]).toBe(true) // guenstigerPruefungAktiv
      expect(result[23]).toBe(42) // personalTaxRate
    })

    it('reflects state changes in dependency array', () => {
      const mockState = createMockState()
      const result1 = extractDependencies(mockState)

      mockState.rendite = 10
      mockState.steuerlast = 30

      const result2 = extractDependencies(mockState)

      expect(result2[0]).toBe(10)
      expect(result2[0]).not.toBe(result1[0])
    })
  })

  describe('integration - all extractors work together', () => {
    it('extracts all properties exactly once when combined', () => {
      const mockState = createMockState()

      const returnConfig = extractReturnConfig(mockState)
      const taxConfig = extractTaxConfig(mockState)
      const inflationConfig = extractInflationConfig(mockState)
      const simulationBasics = extractSimulationBasics(mockState)

      const combined = {
        ...returnConfig,
        ...taxConfig,
        ...inflationConfig,
        ...simulationBasics,
      }

      // Verify all 24 properties are present
      expect(Object.keys(combined)).toHaveLength(24)

      // Verify no duplicate keys
      const allKeys = [
        ...Object.keys(returnConfig),
        ...Object.keys(taxConfig),
        ...Object.keys(inflationConfig),
        ...Object.keys(simulationBasics),
      ]
      const uniqueKeys = new Set(allKeys)
      expect(allKeys.length).toBe(uniqueKeys.size)
    })

    it('combined result matches dependency array values', () => {
      const mockState = createMockState()

      const returnConfig = extractReturnConfig(mockState)
      const taxConfig = extractTaxConfig(mockState)
      const inflationConfig = extractInflationConfig(mockState)
      const simulationBasics = extractSimulationBasics(mockState)

      const combined = {
        ...returnConfig,
        ...taxConfig,
        ...inflationConfig,
        ...simulationBasics,
      }

      const dependencies = extractDependencies(mockState)

      // Verify key properties match
      expect(combined.rendite).toBe(dependencies[0])
      expect(combined.returnMode).toBe(dependencies[1])
      expect(combined.personalTaxRate).toBe(dependencies[23])
    })
  })
})
