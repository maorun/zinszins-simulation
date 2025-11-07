import { describe, it, expect } from 'vitest'
import { getStrategyDefaults } from './withdrawal-strategy-defaults'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

// Helper to create a minimal segment for testing
const createTestSegment = (overrides: Partial<WithdrawalSegment>): WithdrawalSegment => ({
  id: 'test-segment',
  name: 'Test Segment',
  startYear: 2025,
  endYear: 2035,
  strategy: '4prozent',
  withdrawalFrequency: 'yearly',
  returnConfig: { mode: 'fixed', fixedRate: 0.05 },
  ...overrides,
})

describe('withdrawal-strategy-defaults', () => {
  describe('getStrategyDefaults', () => {
    describe('monatlich_fest strategy', () => {
      it('should return default monthly config when not present', () => {
        const segment = createTestSegment({
          strategy: 'monatlich_fest',
        })

        const result = getStrategyDefaults({
          strategy: 'monatlich_fest',
          currentSegment: segment,
        })

        expect(result.monthlyConfig).toEqual({
          monthlyAmount: 2000,
          enableGuardrails: false,
          guardrailsThreshold: 0.1,
        })
      })

      it('should return empty object when monthly config already exists', () => {
        const segment = createTestSegment({
          strategy: 'monatlich_fest',
          monthlyConfig: {
            monthlyAmount: 3000,
            enableGuardrails: true,
            guardrailsThreshold: 0.15,
          },
        })

        const result = getStrategyDefaults({
          strategy: 'monatlich_fest',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })
    })

    describe('variabel_prozent strategy', () => {
      it('should return default custom percentage when not present', () => {
        const segment = createTestSegment({
          strategy: 'variabel_prozent',
        })

        const result = getStrategyDefaults({
          strategy: 'variabel_prozent',
          currentSegment: segment,
        })

        expect(result.customPercentage).toBe(0.05)
      })

      it('should return empty object when custom percentage already exists', () => {
        const segment = createTestSegment({
          strategy: 'variabel_prozent',
          customPercentage: 0.07,
        })

        const result = getStrategyDefaults({
          strategy: 'variabel_prozent',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })

      it('should handle zero percentage as existing config', () => {
        const segment = createTestSegment({
          strategy: 'variabel_prozent',
          customPercentage: 0,
        })

        const result = getStrategyDefaults({
          strategy: 'variabel_prozent',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })
    })

    describe('dynamisch strategy', () => {
      it('should return default dynamic config when not present', () => {
        const segment = createTestSegment({
          strategy: 'dynamisch',
        })

        const result = getStrategyDefaults({
          strategy: 'dynamisch',
          currentSegment: segment,
        })

        expect(result.dynamicConfig).toEqual({
          baseWithdrawalRate: 0.04,
          upperThresholdReturn: 0.08,
          upperThresholdAdjustment: 0.05,
          lowerThresholdReturn: 0.02,
          lowerThresholdAdjustment: -0.05,
        })
      })

      it('should return empty object when dynamic config already exists', () => {
        const segment = createTestSegment({
          strategy: 'dynamisch',
          dynamicConfig: {
            baseWithdrawalRate: 0.05,
            upperThresholdReturn: 0.1,
            upperThresholdAdjustment: 0.1,
            lowerThresholdReturn: 0.03,
            lowerThresholdAdjustment: -0.1,
          },
        })

        const result = getStrategyDefaults({
          strategy: 'dynamisch',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })
    })

    describe('bucket_strategie strategy', () => {
      it('should return default bucket config when not present', () => {
        const segment = createTestSegment({
          strategy: 'bucket_strategie',
        })

        const result = getStrategyDefaults({
          strategy: 'bucket_strategie',
          currentSegment: segment,
        })

        expect(result.bucketConfig).toEqual({
          initialCashCushion: 20000,
          refillThreshold: 5000,
          refillPercentage: 0.5,
          baseWithdrawalRate: 0.04,
          subStrategy: '4prozent',
          variabelProzent: 4,
          monatlicheBetrag: 2000,
          dynamischBasisrate: 4,
          dynamischObereSchwell: 8,
          dynamischObereAnpassung: 5,
          dynamischUntereSchwell: 2,
          dynamischUntereAnpassung: -5,
        })
      })

      it('should return empty object when bucket config already exists', () => {
        const segment = createTestSegment({
          strategy: 'bucket_strategie',
          bucketConfig: {
            initialCashCushion: 30000,
            refillThreshold: 10000,
            refillPercentage: 0.7,
            baseWithdrawalRate: 0.05,
            subStrategy: '3prozent',
            variabelProzent: 3,
            monatlicheBetrag: 2500,
            dynamischBasisrate: 5,
            dynamischObereSchwell: 10,
            dynamischObereAnpassung: 7,
            dynamischUntereSchwell: 3,
            dynamischUntereAnpassung: -7,
          },
        })

        const result = getStrategyDefaults({
          strategy: 'bucket_strategie',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })
    })

    describe('rmd strategy', () => {
      it('should return default RMD config when not present', () => {
        const segment = createTestSegment({
          strategy: 'rmd',
        })

        const result = getStrategyDefaults({
          strategy: 'rmd',
          currentSegment: segment,
        })

        expect(result.rmdConfig).toEqual({
          startAge: 65,
          lifeExpectancyTable: 'german_2020_22',
          customLifeExpectancy: undefined,
        })
      })

      it('should return empty object when RMD config already exists', () => {
        const segment = createTestSegment({
          strategy: 'rmd',
          rmdConfig: {
            startAge: 70,
            lifeExpectancyTable: 'german_male_2020_22',
            customLifeExpectancy: 15,
          },
        })

        const result = getStrategyDefaults({
          strategy: 'rmd',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })
    })

    describe('strategies without specific defaults', () => {
      it('should return empty object for 4prozent strategy', () => {
        const segment = createTestSegment({
          strategy: '4prozent',
        })

        const result = getStrategyDefaults({
          strategy: '4prozent',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })

      it('should return empty object for 3prozent strategy', () => {
        const segment = createTestSegment({
          strategy: '3prozent',
        })

        const result = getStrategyDefaults({
          strategy: '3prozent',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })

      it('should return empty object for kapitalerhalt strategy', () => {
        const segment = createTestSegment({
          strategy: 'kapitalerhalt',
        })

        const result = getStrategyDefaults({
          strategy: 'kapitalerhalt',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })

      it('should return empty object for steueroptimiert strategy', () => {
        const segment = createTestSegment({
          strategy: 'steueroptimiert',
        })

        const result = getStrategyDefaults({
          strategy: 'steueroptimiert',
          currentSegment: segment,
        })

        expect(result).toEqual({})
      })
    })
  })
})
