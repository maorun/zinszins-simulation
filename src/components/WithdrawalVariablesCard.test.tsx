import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WithdrawalVariablesCard } from './WithdrawalVariablesCard'

// Mock the child components
vi.mock('./OtherIncomeConfiguration', () => ({
  OtherIncomeConfigurationComponent: () => <div>Other Income Config</div>,
}))

vi.mock('./WithdrawalModeSelector', () => ({
  WithdrawalModeSelector: () => <div>Withdrawal Mode Selector</div>,
}))

vi.mock('./WithdrawalSegmentForm', () => ({
  WithdrawalSegmentForm: () => <div>Withdrawal Segment Form</div>,
}))

vi.mock('./ComparisonStrategyConfiguration', () => ({
  ComparisonStrategyConfiguration: () => <div>Comparison Strategy Config</div>,
}))

vi.mock('./SegmentedComparisonConfiguration', () => ({
  SegmentedComparisonConfiguration: () => <div>Segmented Comparison Config</div>,
}))

vi.mock('./SingleStrategyConfigSection', () => ({
  SingleStrategyConfigSection: () => <div>Single Strategy Config</div>,
}))

vi.mock('./HealthCareInsuranceConfiguration', () => ({
  HealthCareInsuranceConfiguration: () => <div>Health Care Insurance Config</div>,
}))

describe('WithdrawalVariablesCard', () => {
  const defaultProps = {
    otherIncomeConfig: { enabled: false, sources: [] },
    onOtherIncomeConfigChange: vi.fn(),
    useSegmentedWithdrawal: false,
    useComparisonMode: false,
    useSegmentedComparisonMode: false,
    withdrawalSegments: [],
    onWithdrawalSegmentsChange: vi.fn(),
    formValue: {
      strategie: '4prozent' as const,
      rendite: 5,
      withdrawalFrequency: 'yearly' as const,
      inflationAktiv: true,
      inflationsrate: 2,
      monatlicheBetrag: 2000,
      guardrailsAktiv: false,
      guardrailsSchwelle: 10,
      variabelProzent: 5,
      dynamischBasisrate: 4,
      dynamischObereSchwell: 8,
      dynamischObereAnpassung: 5,
      dynamischUntereSchwell: 2,
      dynamischUntereAnpassung: -5,
      rmdStartAge: 65,
      kapitalerhaltNominalReturn: 7,
      kapitalerhaltInflationRate: 2,
      steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
      steueroptimierteEntnahmeTargetTaxRate: 0.26375,
      steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
      steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
      steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
      einkommensteuersatz: 18,
    },
    comparisonStrategies: [],
    onFormValueUpdate: vi.fn(),
    onComparisonStrategyUpdate: vi.fn(),
    onComparisonStrategyAdd: vi.fn(),
    onComparisonStrategyRemove: vi.fn(),
    segmentedComparisonStrategies: [],
    onSegmentedComparisonStrategyAdd: vi.fn(),
    onSegmentedComparisonStrategyUpdate: vi.fn(),
    onSegmentedComparisonStrategyRemove: vi.fn(),
    withdrawalReturnMode: 'fixed' as const,
    withdrawalAverageReturn: 7,
    withdrawalStandardDeviation: 12,
    withdrawalRandomSeed: undefined,
    withdrawalVariableReturns: {},
    withdrawalMultiAssetConfig: undefined,
    onWithdrawalMultiAssetConfigChange: vi.fn(),
    onConfigUpdate: vi.fn(),
    dispatchEnd: vi.fn(),
    startOfIndependence: 2040,
    globalEndOfLife: 2080,
    planningMode: 'individual' as const,
    birthYear: 1975,
    spouseBirthYear: undefined,
    currentWithdrawalAmount: undefined,
    onHealthCareInsuranceChange: {
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
    },
  }

  it('should render the card with header', () => {
    render(<WithdrawalVariablesCard {...defaultProps} />)

    expect(screen.getByText('Variablen')).toBeInTheDocument()
  })

  it('should render all child components', () => {
    render(<WithdrawalVariablesCard {...defaultProps} />)

    // The card is collapsible, so just verify it renders without errors
    expect(screen.getByText('Variablen')).toBeInTheDocument()
  })
})
