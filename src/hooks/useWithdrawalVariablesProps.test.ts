import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWithdrawalVariablesProps } from './useWithdrawalVariablesProps'
import type { WithdrawalFormValue } from '../utils/config-storage'

// Mock withdrawal form value helper
const createMockFormValue = (): WithdrawalFormValue => ({
  strategie: '4prozent',
  rendite: 5,
  withdrawalFrequency: 'yearly',
  inflationAktiv: false,
  inflationsrate: 2,
  monatlicheBetrag: 2000,
  guardrailsAktiv: false,
  guardrailsSchwelle: 20,
  variabelProzent: 4,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 150,
  dynamischObereAnpassung: 10,
  dynamischUntereSchwell: 80,
  dynamischUntereAnpassung: 10,
  rmdStartAge: 72,
  kapitalerhaltNominalReturn: 5,
  kapitalerhaltInflationRate: 2,
  steueroptimierteEntnahmeBaseWithdrawalRate: 4,
  steueroptimierteEntnahmeTargetTaxRate: 25,
  steueroptimierteEntnahmeOptimizationMode: 'balanced',
  steueroptimierteEntnahmeFreibetragUtilizationTarget: 80,
  steueroptimierteEntnahmeRebalanceFrequency: 'yearly',
  einkommensteuersatz: 25,
})

describe('useWithdrawalVariablesProps', () => {
  const mockUpdateConfig = vi.fn()
  const mockUpdateFormValue = vi.fn()
  const mockUpdateComparisonStrategy = vi.fn()
  const mockAddSegmentedComparisonStrategy = vi.fn((_strategy: unknown) => {})
  const mockUpdateSegmentedComparisonStrategy = vi.fn()
  const mockRemoveSegmentedComparisonStrategy = vi.fn()
  const mockSetWithdrawalMultiAssetConfig = vi.fn()
  const mockDispatchEnd = vi.fn()

  // Mock health care insurance handlers with all required functions
  const mockHealthCareInsuranceHandlers = {
    onEnabledChange: vi.fn(),
    onInsuranceTypeChange: vi.fn(),
    onIncludeEmployerContributionChange: vi.fn(),
    onStatutoryHealthInsuranceRateChange: vi.fn(),
    onStatutoryCareInsuranceRateChange: vi.fn(),
    onStatutoryMinimumIncomeBaseChange: vi.fn(),
    onStatutoryMaximumIncomeBaseChange: vi.fn(),
    onPrivateHealthInsuranceMonthlyChange: vi.fn(),
    onPrivateCareInsuranceMonthlyChange: vi.fn(),
    onPrivateInsuranceInflationRateChange: vi.fn(),
    onRetirementStartYearChange: vi.fn(),
    onAdditionalCareInsuranceForChildlessChange: vi.fn(),
    onAdditionalCareInsuranceAgeChange: vi.fn(),
    onPerson2EnabledChange: vi.fn(),
    onPerson2InsuranceTypeChange: vi.fn(),
    onPerson2StatutoryHealthInsuranceRateChange: vi.fn(),
    onPerson2StatutoryCareInsuranceRateChange: vi.fn(),
    onPerson2AdditionalCareInsuranceForChildlessChange: vi.fn(),
  } as const

  const defaultParams = {
    currentConfig: {
      otherIncomeConfig: undefined,
      withdrawalSegments: [],
      comparisonStrategies: [],
      segmentedComparisonStrategies: [],
    },
    updateConfig: mockUpdateConfig,
    updateFormValue: mockUpdateFormValue,
    updateComparisonStrategy: mockUpdateComparisonStrategy,
    addSegmentedComparisonStrategy: mockAddSegmentedComparisonStrategy,
    updateSegmentedComparisonStrategy: mockUpdateSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy: mockRemoveSegmentedComparisonStrategy,
    formValue: createMockFormValue(),
    withdrawalReturnMode: 'fixed' as const,
    withdrawalAverageReturn: 5,
    withdrawalStandardDeviation: 10,
    withdrawalRandomSeed: 123,
    withdrawalVariableReturns: {},
    withdrawalMultiAssetConfig: null,
    setWithdrawalMultiAssetConfig: mockSetWithdrawalMultiAssetConfig,
    useSegmentedWithdrawal: false,
    useComparisonMode: false,
    useSegmentedComparisonMode: false,
    dispatchEnd: mockDispatchEnd,
    startOfIndependence: 2040,
    globalEndOfLife: 2060,
    planningMode: 'individual' as const,
    birthYear: 1990,
    spouseBirthYear: undefined,
    withdrawalData: null,
    healthCareInsuranceHandlers: mockHealthCareInsuranceHandlers,
  }

  it('should return properly formatted props for WithdrawalVariablesCard', () => {
    const { result } = renderHook(() => useWithdrawalVariablesProps(defaultParams))

    expect(result.current).toHaveProperty('otherIncomeConfig')
    expect(result.current).toHaveProperty('onOtherIncomeConfigChange')
    expect(result.current).toHaveProperty('useSegmentedWithdrawal')
    expect(result.current).toHaveProperty('useComparisonMode')
    expect(result.current).toHaveProperty('formValue')
    expect(result.current).toHaveProperty('comparisonStrategies')
    expect(result.current).toHaveProperty('onComparisonStrategyAdd')
    expect(result.current).toHaveProperty('onComparisonStrategyRemove')
  })

  it('should calculate currentWithdrawalAmount from withdrawal data', () => {
    const params = {
      ...defaultParams,
      withdrawalData: {
        withdrawalArray: [
          { entnahme: 1000 },
          { entnahme: 2000 },
          { entnahme: 3000 },
        ],
      },
    }

    const { result } = renderHook(() => useWithdrawalVariablesProps(params))

    expect(result.current.currentWithdrawalAmount).toBe(3000)
  })

  it('should return undefined for currentWithdrawalAmount when no withdrawal data', () => {
    const { result } = renderHook(() => useWithdrawalVariablesProps(defaultParams))

    expect(result.current.currentWithdrawalAmount).toBeUndefined()
  })

  it('should handle empty withdrawal array', () => {
    const params = {
      ...defaultParams,
      withdrawalData: {
        withdrawalArray: [],
      },
    }

    const { result } = renderHook(() => useWithdrawalVariablesProps(params))

    expect(result.current.currentWithdrawalAmount).toBeUndefined()
  })

  it('should include all withdrawal configuration props', () => {
    const { result } = renderHook(() => useWithdrawalVariablesProps(defaultParams))

    expect(result.current.withdrawalReturnMode).toBe('fixed')
    expect(result.current.withdrawalAverageReturn).toBe(5)
    expect(result.current.withdrawalStandardDeviation).toBe(10)
    expect(result.current.withdrawalRandomSeed).toBe(123)
    expect(result.current.withdrawalVariableReturns).toEqual({})
  })

  it('should include global configuration props', () => {
    const { result } = renderHook(() => useWithdrawalVariablesProps(defaultParams))

    expect(result.current.startOfIndependence).toBe(2040)
    expect(result.current.globalEndOfLife).toBe(2060)
    expect(result.current.planningMode).toBe('individual')
    expect(result.current.birthYear).toBe(1990)
    expect(result.current.spouseBirthYear).toBeUndefined()
  })

  it('should include spouse birth year when provided', () => {
    const params = {
      ...defaultParams,
      spouseBirthYear: 1992,
    }

    const { result } = renderHook(() => useWithdrawalVariablesProps(params))

    expect(result.current.spouseBirthYear).toBe(1992)
  })

  it('should pass through health care insurance handlers', () => {
    const { result } = renderHook(() => useWithdrawalVariablesProps(defaultParams))

    expect(result.current.onHealthCareInsuranceChange).toBe(mockHealthCareInsuranceHandlers)
  })
})
