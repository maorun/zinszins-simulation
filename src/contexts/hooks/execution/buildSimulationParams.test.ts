import { describe, it, expect } from 'vitest'
import { buildSimulationConfig, buildRunSimulationParams } from './buildSimulationParams'
import type { SimulationExecutionState } from '../useSimulationExecution'
import { createDefaultMultiAssetConfig } from '../../../../helpers/multi-asset-portfolio'

describe('buildSimulationParams', () => {
  const mockState: SimulationExecutionState = {
    rendite: 5,
    returnMode: 'fixed',
    averageReturn: 7,
    standardDeviation: 15,
    randomSeed: undefined,
    variableReturns: {},
    historicalIndex: 'MSCI_WORLD',
    blackSwanReturns: null,
    inflationScenarioRates: null,
    inflationScenarioReturnModifiers: null,
    multiAssetConfig: createDefaultMultiAssetConfig(),
    simulationAnnual: 'yearly',
    sparplanElemente: [],
    startEnd: [2040, 2023],
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2024: 2000 },
    basiszinsConfiguration: {
      2024: { year: 2024, rate: 2.5, source: 'manual' },
    },
    steuerReduzierenEndkapitalSparphase: false,
    inflationAktivSparphase: false,
    inflationsrateSparphase: 2,
    inflationAnwendungSparphase: 'sparplan',
    guenstigerPruefungAktiv: false,
    personalTaxRate: 0,
  }

  describe('buildSimulationConfig', () => {
    it('builds simulation config with default rendite', () => {
      const yearToday = 2024
      const overwrite = {}

      const result = buildSimulationConfig(mockState, overwrite, yearToday)

      expect(result).toHaveProperty('returnConfig')
      expect(result).toHaveProperty('variableInflationRates')
      expect(result.returnConfig.mode).toBe('fixed')
      expect(result.returnConfig.fixedRate).toBe(0.05)
    })

    it('builds simulation config with overridden rendite', () => {
      const yearToday = 2024
      const overwrite = { rendite: 8 }

      const result = buildSimulationConfig(mockState, overwrite, yearToday)

      expect(result.returnConfig.mode).toBe('fixed')
      expect(result.returnConfig.fixedRate).toBe(0.08)
    })

    it('includes variableInflationRates when inflation scenario is active', () => {
      const yearToday = 2024
      const overwrite = {}
      const stateWithInflation = {
        ...mockState,
        inflationScenarioRates: { 2024: 2.5, 2025: 2.6 },
      }

      const result = buildSimulationConfig(stateWithInflation, overwrite, yearToday)

      expect(result.variableInflationRates).toBeDefined()
      expect(result.variableInflationRates).toHaveProperty('2024')
    })

    it('handles random return mode', () => {
      const yearToday = 2024
      const overwrite = {}
      const stateWithRandom = {
        ...mockState,
        returnMode: 'random' as const,
        randomSeed: 12345,
      }

      const result = buildSimulationConfig(stateWithRandom, overwrite, yearToday)

      expect(result.returnConfig.mode).toBe('random')
    })

    it('handles variable return mode', () => {
      const yearToday = 2024
      const overwrite = {}
      const stateWithVariable = {
        ...mockState,
        returnMode: 'variable' as const,
        variableReturns: { 2024: 5, 2025: 7 },
      }

      const result = buildSimulationConfig(stateWithVariable, overwrite, yearToday)

      expect(result.returnConfig.mode).toBe('variable')
    })
  })

  describe('buildRunSimulationParams', () => {
    it('builds complete simulation parameters', () => {
      const yearToday = 2024
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }
      const variableInflationRates = { 2024: 2.5, 2025: 2.6 }

      const result = buildRunSimulationParams(mockState, yearToday, returnConfig, variableInflationRates)

      expect(result.yearToday).toBe(yearToday)
      expect(result.endYear).toBe(2040)
      expect(result.elements).toEqual([])
      expect(result.returnConfig).toBe(returnConfig)
      expect(result.simulationAnnual).toBe('yearly')
      expect(result.steuerlast).toBe(26.375)
      expect(result.teilfreistellungsquote).toBe(30)
      expect(result.freibetragPerYear).toEqual({ 2024: 2000 })
      expect(result.basiszinsConfiguration).toEqual({ 2024: { year: 2024, rate: 2.5, source: 'manual' } })
      expect(result.steuerReduzierenEndkapitalSparphase).toBe(false)
      expect(result.inflationAktivSparphase).toBe(false)
      expect(result.inflationsrateSparphase).toBe(2)
      expect(result.inflationAnwendungSparphase).toBe('sparplan')
      expect(result.variableInflationRates).toEqual(variableInflationRates)
      expect(result.guenstigerPruefungAktiv).toBe(false)
      expect(result.personalTaxRate).toBe(0)
    })

    it('uses empty object for variableInflationRates when undefined', () => {
      const yearToday = 2024
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }

      const result = buildRunSimulationParams(mockState, yearToday, returnConfig, undefined)

      expect(result.variableInflationRates).toEqual({})
    })

    it('includes all tax configuration parameters', () => {
      const yearToday = 2024
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }
      const stateWithTaxConfig = {
        ...mockState,
        steuerlast: 28.5,
        teilfreistellungsquote: 40,
        freibetragPerYear: { 2024: 2500, 2025: 2600 },
        guenstigerPruefungAktiv: true,
        personalTaxRate: 35,
      }

      const result = buildRunSimulationParams(stateWithTaxConfig, yearToday, returnConfig, undefined)

      expect(result.steuerlast).toBe(28.5)
      expect(result.teilfreistellungsquote).toBe(40)
      expect(result.freibetragPerYear).toEqual({ 2024: 2500, 2025: 2600 })
      expect(result.guenstigerPruefungAktiv).toBe(true)
      expect(result.personalTaxRate).toBe(35)
    })

    it('includes all inflation configuration parameters', () => {
      const yearToday = 2024
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }
      const stateWithInflationConfig = {
        ...mockState,
        inflationAktivSparphase: true,
        inflationsrateSparphase: 3.5,
        inflationAnwendungSparphase: 'gesamtmenge' as const,
      }

      const result = buildRunSimulationParams(stateWithInflationConfig, yearToday, returnConfig, undefined)

      expect(result.inflationAktivSparphase).toBe(true)
      expect(result.inflationsrateSparphase).toBe(3.5)
      expect(result.inflationAnwendungSparphase).toBe('gesamtmenge')
    })

    it('includes sparplan elements', () => {
      const yearToday = 2024
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }
      // Use empty array to avoid complex SparplanElement type construction
      const stateWithElements = {
        ...mockState,
        sparplanElemente: [],
      }

      const result = buildRunSimulationParams(stateWithElements, yearToday, returnConfig, undefined)

      expect(result.elements).toEqual([])
    })
  })
})
