/**
 * Tests for Configuration Mapping Utilities
 */

import { describe, it, expect } from 'vitest'
import { mapSimulationContextToConfig } from './config-mappers'
import type { SimulationContextState } from '../contexts/SimulationContext'

describe('config-mappers', () => {
  describe('mapSimulationContextToConfig', () => {
    it('should map all required fields from SimulationContextState', () => {
      // Create a minimal valid SimulationContextState
      const mockContext: SimulationContextState = {
        rendite: 0.05,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: { 2023: 1000, 2024: 1000 },
        returnMode: 'fixed',
        averageReturn: 0.07,
        standardDeviation: 0.15,
        variableReturns: {},
        startEnd: [2023, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'jährlich',
      } as unknown as SimulationContextState

      const result = mapSimulationContextToConfig(mockContext)

      // Verify all required fields are mapped
      expect(result.rendite).toBe(0.05)
      expect(result.steuerlast).toBe(0.26375)
      expect(result.teilfreistellungsquote).toBe(0.3)
      expect(result.freibetragPerYear).toEqual({ 2023: 1000, 2024: 1000 })
      expect(result.returnMode).toBe('fixed')
      expect(result.averageReturn).toBe(0.07)
      expect(result.standardDeviation).toBe(0.15)
      expect(result.variableReturns).toEqual({})
      expect(result.startEnd).toEqual([2023, 2040])
      expect(result.sparplan).toEqual([])
      expect(result.simulationAnnual).toBe('jährlich')
    })

    it('should map optional tax configuration fields', () => {
      const mockContext: SimulationContextState = {
        rendite: 0.05,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: {},
        returnMode: 'fixed',
        averageReturn: 0.07,
        standardDeviation: 0.15,
        variableReturns: {},
        startEnd: [2023, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'jährlich',
        grundfreibetragAktiv: true,
        grundfreibetragBetrag: 10908,
        personalTaxRate: 0.25,
        guenstigerPruefungAktiv: true,
        kirchensteuerAktiv: true,
        kirchensteuersatz: 0.08,
      } as unknown as SimulationContextState

      const result = mapSimulationContextToConfig(mockContext)

      expect(result.grundfreibetragAktiv).toBe(true)
      expect(result.grundfreibetragBetrag).toBe(10908)
      expect(result.personalTaxRate).toBe(0.25)
      expect(result.guenstigerPruefungAktiv).toBe(true)
      expect(result.kirchensteuerAktiv).toBe(true)
      expect(result.kirchensteuersatz).toBe(0.08)
    })

    it('should map asset configuration fields', () => {
      const mockContext: SimulationContextState = {
        rendite: 0.05,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: {},
        returnMode: 'fixed',
        averageReturn: 0.07,
        standardDeviation: 0.15,
        variableReturns: {},
        startEnd: [2023, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'jährlich',
        assetClass: 'equity_fund',
        customTeilfreistellungsquote: 0.35,
        freistellungsauftragAccounts: [
          { id: '1', name: 'Bank A', allocation: 0.5 },
          { id: '2', name: 'Bank B', allocation: 0.5 },
        ],
      } as unknown as SimulationContextState

      const result = mapSimulationContextToConfig(mockContext)

      expect(result.assetClass).toBe('equity_fund')
      expect(result.customTeilfreistellungsquote).toBe(0.35)
      expect(result.freistellungsauftragAccounts).toHaveLength(2)
      expect(result.freistellungsauftragAccounts?.[0].name).toBe('Bank A')
    })

    it('should map inflation configuration fields', () => {
      const mockContext: SimulationContextState = {
        rendite: 0.05,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: {},
        returnMode: 'fixed',
        averageReturn: 0.07,
        standardDeviation: 0.15,
        variableReturns: {},
        startEnd: [2023, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'jährlich',
        inflationAktivSparphase: true,
        inflationsrateSparphase: 0.02,
        inflationAnwendungSparphase: 'gesamtmenge',
      } as unknown as SimulationContextState

      const result = mapSimulationContextToConfig(mockContext)

      expect(result.inflationAktivSparphase).toBe(true)
      expect(result.inflationsrateSparphase).toBe(0.02)
      expect(result.inflationAnwendungSparphase).toBe('gesamtmenge')
    })

    it('should map life planning configuration fields', () => {
      const mockContext: SimulationContextState = {
        rendite: 0.05,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: {},
        returnMode: 'fixed',
        averageReturn: 0.07,
        standardDeviation: 0.15,
        variableReturns: {},
        startEnd: [2023, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'jährlich',
        endOfLife: 2090,
        lifeExpectancyTable: 'german_male_2020_22',
        customLifeExpectancy: 85,
        planningMode: 'couple',
        gender: 'male',
        spouse: { birthYear: 1985, gender: 'female' },
        birthYear: 1980,
        expectedLifespan: 90,
        useAutomaticCalculation: true,
      } as unknown as SimulationContextState

      const result = mapSimulationContextToConfig(mockContext)

      expect(result.endOfLife).toBe(2090)
      expect(result.lifeExpectancyTable).toBe('german_male_2020_22')
      expect(result.customLifeExpectancy).toBe(85)
      expect(result.planningMode).toBe('couple')
      expect(result.gender).toBe('male')
      expect(result.spouse).toEqual({ birthYear: 1985, gender: 'female' })
      expect(result.birthYear).toBe(1980)
      expect(result.expectedLifespan).toBe(90)
      expect(result.useAutomaticCalculation).toBe(true)
    })

    it('should convert null/undefined optional configs to undefined', () => {
      const mockContext: SimulationContextState = {
        rendite: 0.05,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: {},
        returnMode: 'fixed',
        averageReturn: 0.07,
        standardDeviation: 0.15,
        variableReturns: {},
        startEnd: [2023, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'jährlich',
        withdrawalConfig: null,
        statutoryPensionConfig: null,
        termLifeInsuranceConfig: null,
        careInsuranceConfig: null,
        emRenteConfig: null,
      } as unknown as SimulationContextState

      const result = mapSimulationContextToConfig(mockContext)

      expect(result.withdrawal).toBeUndefined()
      expect(result.statutoryPensionConfig).toBeUndefined()
      expect(result.termLifeInsuranceConfig).toBeUndefined()
      expect(result.careInsuranceConfig).toBeUndefined()
      expect(result.emRenteConfig).toBeUndefined()
    })

    it('should preserve complex object structures', () => {
      const mockMultiAssetConfig = {
        enabled: true,
        assetClasses: {},
        rebalancing: { frequency: 'annually' as const },
      }

      const mockContext: SimulationContextState = {
        rendite: 0.05,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: {},
        returnMode: 'multi-asset',
        averageReturn: 0.07,
        standardDeviation: 0.15,
        variableReturns: {},
        startEnd: [2023, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'jährlich',
        multiAssetConfig: mockMultiAssetConfig,
      } as unknown as SimulationContextState

      const result = mapSimulationContextToConfig(mockContext)

      expect(result.multiAssetConfig).toEqual(mockMultiAssetConfig)
      expect(result.multiAssetConfig?.enabled).toBe(true)
    })

    it('should handle complete context with all optional fields', () => {
      const completeContext: SimulationContextState = {
        rendite: 0.05,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        freibetragPerYear: { 2023: 1000 },
        basiszinsConfiguration: { year: 2023, rate: 0.025 },
        steuerReduzierenEndkapitalSparphase: true,
        grundfreibetragAktiv: true,
        grundfreibetragBetrag: 10908,
        personalTaxRate: 0.25,
        guenstigerPruefungAktiv: true,
        kirchensteuerAktiv: true,
        kirchensteuersatz: 0.08,
        assetClass: 'equity_fund',
        customTeilfreistellungsquote: 0.35,
        freistellungsauftragAccounts: [],
        returnMode: 'fixed',
        averageReturn: 0.07,
        standardDeviation: 0.15,
        randomSeed: 12345,
        variableReturns: { 2024: 0.08, 2025: 0.06 },
        historicalIndex: 'msci_world',
        multiAssetConfig: { allocations: [] },
        inflationAktivSparphase: true,
        inflationsrateSparphase: 0.02,
        inflationAnwendungSparphase: 'gesamtmenge',
        startEnd: [2023, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'jährlich',
        endOfLife: 2090,
        lifeExpectancyTable: 'german_2020_22',
        customLifeExpectancy: 85,
        planningMode: 'individual',
        gender: 'male',
        spouse: { birthYear: 1985, gender: 'female' },
        birthYear: 1980,
        expectedLifespan: 90,
        useAutomaticCalculation: true,
        withdrawalConfig: { type: 'fixed_percentage', percentage: 0.04 },
        statutoryPensionConfig: { monthlyAmount: 1500 },
        coupleStatutoryPensionConfig: { primaryPension: 1500, spousePension: 1000 },
        careCostConfiguration: { enabled: true },
        financialGoals: [],
        emergencyFundConfig: { targetMonths: 6 },
        termLifeInsuranceConfig: { coverageAmount: 200000 },
        careInsuranceConfig: { dailyBenefit: 50 },
        alimonyConfig: { monthlyAmount: 500 },
        emRenteConfig: { monthlyAmount: 800 },
      } as unknown as SimulationContextState

      const result = mapSimulationContextToConfig(completeContext)

      // Verify that all fields are present in result
      expect(result).toBeDefined()
      expect(result.rendite).toBe(0.05)
      expect(result.basiszinsConfiguration).toEqual({ year: 2023, rate: 0.025 })
      expect(result.withdrawal).toEqual({ type: 'fixed_percentage', percentage: 0.04 })
      expect(result.statutoryPensionConfig).toEqual({ monthlyAmount: 1500 })
      expect(result.emergencyFundConfig).toEqual({ targetMonths: 6 })
    })
  })
})
