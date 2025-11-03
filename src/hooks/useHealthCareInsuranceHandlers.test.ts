import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useHealthCareInsuranceHandlers } from './useHealthCareInsuranceHandlers'
import type { WithdrawalFormValue } from '../utils/config-storage'

const createMockFormValue = (): WithdrawalFormValue => ({
  strategie: '4prozent' as const,
  rendite: 5,
  withdrawalFrequency: 'yearly' as const,
  variabelProzent: 4,
  monatlicheBetrag: 1667,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 7,
  dynamischObereAnpassung: 1,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -1,
  inflationAktiv: true,
  inflationsrate: 2,
  guardrailsAktiv: false,
  guardrailsSchwelle: 80,
  rmdStartAge: 65,
  kapitalerhaltNominalReturn: 7,
  kapitalerhaltInflationRate: 2,
  steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
  steueroptimierteEntnahmeTargetTaxRate: 0.26375,
  steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
  steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
  steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
  grundfreibetragAktiv: false,
  grundfreibetragBetrag: 10908,
  einkommensteuersatz: 18,
})

describe('useHealthCareInsuranceHandlers', () => {
  it('provides all handler functions', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    // Base handlers
    expect(typeof result.current.onEnabledChange).toBe('function')
    expect(typeof result.current.onInsuranceTypeChange).toBe('function')
    expect(typeof result.current.onIncludeEmployerContributionChange).toBe('function')

    // Statutory handlers
    expect(typeof result.current.onStatutoryHealthInsuranceRateChange).toBe('function')
    expect(typeof result.current.onStatutoryCareInsuranceRateChange).toBe('function')
    expect(typeof result.current.onStatutoryMinimumIncomeBaseChange).toBe('function')
    expect(typeof result.current.onStatutoryMaximumIncomeBaseChange).toBe('function')

    // Private handlers
    expect(typeof result.current.onPrivateHealthInsuranceMonthlyChange).toBe('function')
    expect(typeof result.current.onPrivateCareInsuranceMonthlyChange).toBe('function')
    expect(typeof result.current.onPrivateInsuranceInflationRateChange).toBe('function')

    // General handlers
    expect(typeof result.current.onRetirementStartYearChange).toBe('function')
    expect(typeof result.current.onAdditionalCareInsuranceForChildlessChange).toBe('function')
    expect(typeof result.current.onAdditionalCareInsuranceAgeChange).toBe('function')

    // Couple handlers
    expect(typeof result.current.onCoupleStrategyChange).toBe('function')
    expect(typeof result.current.onFamilyInsuranceThresholdRegularChange).toBe('function')
    expect(typeof result.current.onFamilyInsuranceThresholdMiniJobChange).toBe('function')
    expect(typeof result.current.onPerson1NameChange).toBe('function')
    expect(typeof result.current.onPerson1WithdrawalShareChange).toBe('function')
    expect(typeof result.current.onPerson1OtherIncomeAnnualChange).toBe('function')
    expect(typeof result.current.onPerson1AdditionalCareInsuranceForChildlessChange).toBe('function')
    expect(typeof result.current.onPerson2NameChange).toBe('function')
    expect(typeof result.current.onPerson2WithdrawalShareChange).toBe('function')
    expect(typeof result.current.onPerson2OtherIncomeAnnualChange).toBe('function')
    expect(typeof result.current.onPerson2AdditionalCareInsuranceForChildlessChange).toBe('function')
  })

  it('calls updateFormValue when onEnabledChange is invoked', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    act(() => {
      result.current.onEnabledChange(true)
    })

    expect(updateFormValue).toHaveBeenCalledTimes(1)
    const callArg = updateFormValue.mock.calls[0][0] as Partial<WithdrawalFormValue>
    expect(callArg.healthCareInsuranceConfig?.enabled).toBe(true)
  })

  it('calls updateFormValue when onInsuranceTypeChange is invoked', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    act(() => {
      result.current.onInsuranceTypeChange('private')
    })

    expect(updateFormValue).toHaveBeenCalledTimes(1)
    const callArg = updateFormValue.mock.calls[0][0] as Partial<WithdrawalFormValue>
    expect(callArg.healthCareInsuranceConfig?.insuranceType).toBe('private')
  })

  it('calls updateFormValue when onStatutoryHealthInsuranceRateChange is invoked', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    act(() => {
      result.current.onStatutoryHealthInsuranceRateChange(15.5)
    })

    expect(updateFormValue).toHaveBeenCalledTimes(1)
    const callArg = updateFormValue.mock.calls[0][0] as Partial<WithdrawalFormValue>
    expect(callArg.healthCareInsuranceConfig?.statutoryHealthInsuranceRate).toBe(15.5)
  })

  it('calls updateFormValue when onPrivateHealthInsuranceMonthlyChange is invoked', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    act(() => {
      result.current.onPrivateHealthInsuranceMonthlyChange(500)
    })

    expect(updateFormValue).toHaveBeenCalledTimes(1)
    const callArg = updateFormValue.mock.calls[0][0] as Partial<WithdrawalFormValue>
    expect(callArg.healthCareInsuranceConfig?.privateHealthInsuranceMonthly).toBe(500)
  })

  it('calls updateFormValue when onCoupleStrategyChange is invoked', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    act(() => {
      result.current.onCoupleStrategyChange('family')
    })

    expect(updateFormValue).toHaveBeenCalledTimes(1)
    const callArg = updateFormValue.mock.calls[0][0] as Partial<WithdrawalFormValue>
    expect(callArg.healthCareInsuranceConfig?.coupleConfig?.strategy).toBe('family')
  })

  it('calls updateFormValue when onPerson1NameChange is invoked', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    act(() => {
      result.current.onPerson1NameChange('Alice')
    })

    expect(updateFormValue).toHaveBeenCalledTimes(1)
    const callArg = updateFormValue.mock.calls[0][0] as Partial<WithdrawalFormValue>
    expect(callArg.healthCareInsuranceConfig?.coupleConfig?.person1?.name).toBe('Alice')
  })

  it('updates withdrawal shares correctly when onPerson1WithdrawalShareChange is invoked', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    act(() => {
      result.current.onPerson1WithdrawalShareChange(0.6)
    })

    expect(updateFormValue).toHaveBeenCalledTimes(1)
    const callArg = updateFormValue.mock.calls[0][0] as Partial<WithdrawalFormValue>
    expect(callArg.healthCareInsuranceConfig?.coupleConfig?.person1?.withdrawalShare).toBe(0.6)
    expect(callArg.healthCareInsuranceConfig?.coupleConfig?.person2?.withdrawalShare).toBe(0.4)
  })

  it('updates withdrawal shares correctly when onPerson2WithdrawalShareChange is invoked', () => {
    const formValue = createMockFormValue()
    const updateFormValue = vi.fn()

    const { result } = renderHook(() =>
      useHealthCareInsuranceHandlers(formValue, updateFormValue),
    )

    act(() => {
      result.current.onPerson2WithdrawalShareChange(0.7)
    })

    expect(updateFormValue).toHaveBeenCalledTimes(1)
    const callArg = updateFormValue.mock.calls[0][0] as Partial<WithdrawalFormValue>
    expect(callArg.healthCareInsuranceConfig?.coupleConfig?.person1?.withdrawalShare).toBeCloseTo(0.3, 5)
    expect(callArg.healthCareInsuranceConfig?.coupleConfig?.person2?.withdrawalShare).toBe(0.7)
  })
})
