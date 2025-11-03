import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WithdrawalModeContent } from './WithdrawalModeContent'

// Mock the child components
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

describe('WithdrawalModeContent', () => {
  const baseProps = {
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
    withdrawalSegments: [],
    onWithdrawalSegmentsChange: vi.fn(),
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
  }

  it('should render segmented withdrawal form when useSegmentedWithdrawal is true', () => {
    render(
      <WithdrawalModeContent
        {...baseProps}
        useSegmentedWithdrawal={true}
        useComparisonMode={false}
        useSegmentedComparisonMode={false}
      />,
    )

    expect(screen.getByText('Withdrawal Segment Form')).toBeInTheDocument()
  })

  it('should render comparison strategy config when useComparisonMode is true', () => {
    render(
      <WithdrawalModeContent
        {...baseProps}
        useSegmentedWithdrawal={false}
        useComparisonMode={true}
        useSegmentedComparisonMode={false}
      />,
    )

    expect(screen.getByText('Comparison Strategy Config')).toBeInTheDocument()
  })

  it('should render segmented comparison config when useSegmentedComparisonMode is true', () => {
    render(
      <WithdrawalModeContent
        {...baseProps}
        useSegmentedWithdrawal={false}
        useComparisonMode={false}
        useSegmentedComparisonMode={true}
      />,
    )

    expect(screen.getByText('Segmented Comparison Config')).toBeInTheDocument()
  })

  it('should render single strategy config when all mode flags are false', () => {
    render(
      <WithdrawalModeContent
        {...baseProps}
        useSegmentedWithdrawal={false}
        useComparisonMode={false}
        useSegmentedComparisonMode={false}
      />,
    )

    expect(screen.getByText('Single Strategy Config')).toBeInTheDocument()
  })
})
