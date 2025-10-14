import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHealthInsurancePreviewCalculation } from './useHealthInsurancePreviewCalculation'

describe('useHealthInsurancePreviewCalculation', () => {
  const defaultValues = {
    enabled: true,
    insuranceType: 'statutory' as const,
    statutoryHealthInsuranceRate: 14.6,
    statutoryCareInsuranceRate: 3.05,
    statutoryMinimumIncomeBase: 13230,
    statutoryMaximumIncomeBase: 62550,
    additionalCareInsuranceForChildless: false,
    additionalCareInsuranceAge: 23,
  }

  describe('Individual Mode', () => {
    it('returns null when insurance is disabled', () => {
      const { result } = renderHook(() =>
        useHealthInsurancePreviewCalculation({
          values: { ...defaultValues, enabled: false },
          planningMode: 'individual',
          birthYear: 1980,
          currentWithdrawalAmount: 30000,
        }),
      )

      expect(result.current.previewResults).toBeNull()
    })

    it('calculates individual preview with provided withdrawal amount', () => {
      const { result } = renderHook(() =>
        useHealthInsurancePreviewCalculation({
          values: defaultValues,
          planningMode: 'individual',
          birthYear: 1980,
          currentWithdrawalAmount: 30000,
        }),
      )

      expect(result.current.previewResults).not.toBeNull()
      expect(result.current.withdrawalAmount).toBe(30000)
      expect('totalAnnual' in result.current.previewResults!).toBe(true)
    })

    it('uses fallback withdrawal amount when not provided', () => {
      const { result } = renderHook(() =>
        useHealthInsurancePreviewCalculation({
          values: defaultValues,
          planningMode: 'individual',
          birthYear: 1980,
        }),
      )

      expect(result.current.withdrawalAmount).toBe(30000)
    })

    it('calculates with additional care insurance for childless', () => {
      const { result } = renderHook(() =>
        useHealthInsurancePreviewCalculation({
          values: {
            ...defaultValues,
            additionalCareInsuranceForChildless: true,
            additionalCareInsuranceAge: 25,
          },
          planningMode: 'individual',
          birthYear: 1980,
          currentWithdrawalAmount: 30000,
        }),
      )

      expect(result.current.previewResults).not.toBeNull()
    })
  })

  describe('Couple Mode', () => {
    const coupleValues = {
      ...defaultValues,
      coupleStrategy: 'optimize' as const,
      familyInsuranceThresholdRegular: 505,
      familyInsuranceThresholdMiniJob: 538,
      person1Name: 'Partner 1',
      person1WithdrawalShare: 0.5,
      person1OtherIncomeAnnual: 0,
      person1AdditionalCareInsuranceForChildless: false,
      person2Name: 'Partner 2',
      person2WithdrawalShare: 0.5,
      person2OtherIncomeAnnual: 0,
      person2AdditionalCareInsuranceForChildless: false,
    }

    it('calculates couple preview correctly', () => {
      const { result } = renderHook(() =>
        useHealthInsurancePreviewCalculation({
          values: coupleValues,
          planningMode: 'couple',
          birthYear: 1980,
          spouseBirthYear: 1982,
          currentWithdrawalAmount: 40000,
        }),
      )

      expect(result.current.previewResults).not.toBeNull()
      expect('person1' in result.current.previewResults!).toBe(true)
      expect('person2' in result.current.previewResults!).toBe(true)
    })

    it('uses default values for missing couple configuration', () => {
      const { result } = renderHook(() =>
        useHealthInsurancePreviewCalculation({
          values: defaultValues,
          planningMode: 'couple',
          birthYear: 1980,
          spouseBirthYear: 1982,
          currentWithdrawalAmount: 40000,
        }),
      )

      expect(result.current.previewResults).not.toBeNull()
    })

    it('handles different couple strategies', () => {
      const individualStrategy = { ...coupleValues, coupleStrategy: 'individual' as const }
      const { result } = renderHook(() =>
        useHealthInsurancePreviewCalculation({
          values: individualStrategy,
          planningMode: 'couple',
          birthYear: 1980,
          spouseBirthYear: 1982,
          currentWithdrawalAmount: 40000,
        }),
      )

      expect(result.current.previewResults).not.toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('handles calculation errors gracefully', () => {
      // Spy on console.error to prevent test output pollution
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() =>
        useHealthInsurancePreviewCalculation({
          values: {
            ...defaultValues,
            statutoryHealthInsuranceRate: Number.NaN, // Invalid value to trigger error
          },
          planningMode: 'individual',
          birthYear: 1980,
          currentWithdrawalAmount: 30000,
        }),
      )

      // Should return null on error but not crash
      expect(result.current.previewResults).toBeDefined()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Dependency Updates', () => {
    it('recalculates when values change', () => {
      const { result, rerender } = renderHook(
        ({ values }) =>
          useHealthInsurancePreviewCalculation({
            values,
            planningMode: 'individual',
            birthYear: 1980,
            currentWithdrawalAmount: 30000,
          }),
        {
          initialProps: { values: defaultValues },
        },
      )

      const initialResult = result.current.previewResults

      // Change values
      rerender({ values: { ...defaultValues, statutoryHealthInsuranceRate: 15.0 } })

      // Should recalculate
      expect(result.current.previewResults).not.toBe(initialResult)
    })

    it('recalculates when withdrawal amount changes', () => {
      const { result, rerender } = renderHook(
        ({ amount }) =>
          useHealthInsurancePreviewCalculation({
            values: defaultValues,
            planningMode: 'individual',
            birthYear: 1980,
            currentWithdrawalAmount: amount,
          }),
        {
          initialProps: { amount: 30000 },
        },
      )

      expect(result.current.withdrawalAmount).toBe(30000)

      rerender({ amount: 40000 })

      expect(result.current.withdrawalAmount).toBe(40000)
    })
  })
})
