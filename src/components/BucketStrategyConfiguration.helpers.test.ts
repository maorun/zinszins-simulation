import { describe, it, expect, vi } from 'vitest'
import {
  getDefaultValues,
  getCurrentValuesFromForm,
  getCurrentValuesFromDirect,
  createFormUpdateHandler,
  type BucketStrategyFormValues,
  type BucketStrategyConfigValues,
} from './BucketStrategyConfiguration.helpers'

describe('BucketStrategyConfiguration.helpers', () => {
  describe('getDefaultValues', () => {
    it('returns default configuration values', () => {
      const defaults = getDefaultValues()
      
      expect(defaults).toEqual({
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

    it('returns a new object each time', () => {
      const defaults1 = getDefaultValues()
      const defaults2 = getDefaultValues()
      
      expect(defaults1).not.toBe(defaults2)
      expect(defaults1).toEqual(defaults2)
    })
  })

  describe('getCurrentValuesFromForm', () => {
    it('returns default values when bucketConfig is undefined', () => {
      const formValue: BucketStrategyFormValues = {}
      const result = getCurrentValuesFromForm(formValue)
      
      expect(result).toEqual(getDefaultValues())
    })

    it('merges form values with defaults', () => {
      const formValue: BucketStrategyFormValues = {
        bucketConfig: {
          initialCashCushion: 30000,
          refillThreshold: 10000,
          refillPercentage: 0.7,
          baseWithdrawalRate: 0.05,
        },
      }
      
      const result = getCurrentValuesFromForm(formValue)
      
      expect(result.initialCashCushion).toBe(30000)
      expect(result.refillThreshold).toBe(10000)
      expect(result.refillPercentage).toBe(0.7)
      expect(result.baseWithdrawalRate).toBe(0.05)
      expect(result.subStrategy).toBe('4prozent') // default
    })

    it('handles partial bucket config', () => {
      const formValue: BucketStrategyFormValues = {
        bucketConfig: {
          initialCashCushion: 25000,
          refillThreshold: 5000,
          refillPercentage: 0.5,
          baseWithdrawalRate: 0.04,
          subStrategy: 'variabel_prozent',
        },
      }
      
      const result = getCurrentValuesFromForm(formValue)
      
      expect(result.initialCashCushion).toBe(25000)
      expect(result.subStrategy).toBe('variabel_prozent')
      expect(result.variabelProzent).toBe(4) // default
    })
  })

  describe('getCurrentValuesFromDirect', () => {
    it('returns default values when given empty object', () => {
      const result = getCurrentValuesFromDirect({})
      
      expect(result).toEqual(getDefaultValues())
    })

    it('merges provided values with defaults', () => {
      const values = {
        initialCashCushion: 35000,
        subStrategy: '3prozent' as const,
      }
      
      const result = getCurrentValuesFromDirect(values)
      
      expect(result.initialCashCushion).toBe(35000)
      expect(result.subStrategy).toBe('3prozent')
      expect(result.refillThreshold).toBe(5000) // default
    })

    it('overrides all default values when provided', () => {
      const values: BucketStrategyConfigValues = {
        initialCashCushion: 40000,
        refillThreshold: 8000,
        refillPercentage: 0.8,
        baseWithdrawalRate: 0.06,
        subStrategy: 'monatlich_fest',
        variabelProzent: 5,
        monatlicheBetrag: 3000,
        dynamischBasisrate: 5,
        dynamischObereSchwell: 10,
        dynamischObereAnpassung: 8,
        dynamischUntereSchwell: 3,
        dynamischUntereAnpassung: -8,
      }
      
      const result = getCurrentValuesFromDirect(values)
      
      expect(result).toEqual(values)
    })
  })

  describe('createFormUpdateHandler', () => {
    it('creates a function that updates form value', () => {
      const formValue: BucketStrategyFormValues = {
        bucketConfig: {
          initialCashCushion: 20000,
          refillThreshold: 5000,
          refillPercentage: 0.5,
          baseWithdrawalRate: 0.04,
        },
      }
      const updateFormValue = vi.fn()
      const currentValues = getCurrentValuesFromForm(formValue)
      
      const updateHandler = createFormUpdateHandler({
        formValue,
        updateFormValue,
        currentValues,
      })
      
      updateHandler({ initialCashCushion: 30000 })
      
      expect(updateFormValue).toHaveBeenCalledWith({
        bucketConfig: {
          ...currentValues,
          initialCashCushion: 30000,
        },
      })
    })

    it('merges multiple updates', () => {
      const formValue: BucketStrategyFormValues = {
        bucketConfig: {
          initialCashCushion: 20000,
          refillThreshold: 5000,
          refillPercentage: 0.5,
          baseWithdrawalRate: 0.04,
        },
      }
      const updateFormValue = vi.fn()
      const currentValues = getCurrentValuesFromForm(formValue)
      
      const updateHandler = createFormUpdateHandler({
        formValue,
        updateFormValue,
        currentValues,
      })
      
      updateHandler({
        initialCashCushion: 30000,
        refillThreshold: 10000,
        subStrategy: 'variabel_prozent',
      })
      
      expect(updateFormValue).toHaveBeenCalledWith({
        bucketConfig: {
          ...currentValues,
          initialCashCushion: 30000,
          refillThreshold: 10000,
          subStrategy: 'variabel_prozent',
        },
      })
    })
  })
})
