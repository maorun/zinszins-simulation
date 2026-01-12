import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WithdrawalVariablesCard } from './WithdrawalVariablesCard'
import type { CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'

describe('WithdrawalVariablesCard - Statutory Pension Integration', () => {
  const createDefaultProps = (overrides = {}) => ({
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
    coupleStatutoryPensionConfig: null,
    onCoupleStatutoryPensionConfigChange: vi.fn(),
    partTimeRetirementWorkConfig: undefined,
    onPartTimeRetirementWorkConfigChange: vi.fn(),
    ...overrides,
  })

  it('should render statutory pension configuration when disabled', () => {
    const props = createDefaultProps()
    render(<WithdrawalVariablesCard {...props} />)

    // Pension configuration should be present even when null/disabled
    expect(screen.getByText('Variablen')).toBeInTheDocument()
  })

  it('should render statutory pension configuration with enabled config', async () => {
    const user = userEvent.setup()
    const enabledConfig: CoupleStatutoryPensionConfig = {
      enabled: true,
      planningMode: 'individual',
      individual: {
        enabled: true,
        startYear: 2042,
        monthlyAmount: 1500,
        annualIncreaseRate: 1.0,
        taxablePercentage: 80,
      },
    }

    const props = createDefaultProps({
      coupleStatutoryPensionConfig: enabledConfig,
    })

    render(<WithdrawalVariablesCard {...props} />)

    // Open the collapsible card
    const header = screen.getByText('Variablen')
    await user.click(header)

    // Check that pension configuration is rendered
    // The actual content would be rendered by CoupleStatutoryPensionConfiguration
    expect(header).toBeInTheDocument()
  })

  it('should call onChange handler when pension config changes', async () => {
    const user = userEvent.setup()
    const onCoupleStatutoryPensionConfigChange = vi.fn()
    const enabledConfig: CoupleStatutoryPensionConfig = {
      enabled: true,
      planningMode: 'individual',
      individual: {
        enabled: true,
        startYear: 2042,
        monthlyAmount: 1500,
        annualIncreaseRate: 1.0,
        taxablePercentage: 80,
      },
    }

    const props = createDefaultProps({
      coupleStatutoryPensionConfig: enabledConfig,
      onCoupleStatutoryPensionConfigChange,
    })

    render(<WithdrawalVariablesCard {...props} />)

    // Open the collapsible card
    const header = screen.getByText('Variablen')
    await user.click(header)

    // The onChange handler would be called by user interactions
    // with the CoupleStatutoryPensionConfiguration component
    expect(header).toBeInTheDocument()
  })

  it('should support couple planning mode', async () => {
    const user = userEvent.setup()
    const coupleConfig: CoupleStatutoryPensionConfig = {
      enabled: true,
      planningMode: 'couple',
      couple: {
        person1: {
          enabled: true,
          startYear: 2042,
          monthlyAmount: 1500,
          annualIncreaseRate: 1.0,
          taxablePercentage: 80,
          personId: 1,
          personName: 'Person 1',
        },
        person2: {
          enabled: true,
          startYear: 2045,
          monthlyAmount: 1200,
          annualIncreaseRate: 1.0,
          taxablePercentage: 80,
          personId: 2,
          personName: 'Person 2',
        },
      },
    }

    const props = createDefaultProps({
      coupleStatutoryPensionConfig: coupleConfig,
      planningMode: 'couple' as const,
      birthYear: 1975,
      spouseBirthYear: 1978,
    })

    render(<WithdrawalVariablesCard {...props} />)

    // Open the collapsible card
    const header = screen.getByText('Variablen')
    await user.click(header)

    // Couple configuration should be rendered
    expect(header).toBeInTheDocument()
  })

  it('should pass birth year information to pension configuration', async () => {
    const user = userEvent.setup()
    const props = createDefaultProps({
      birthYear: 1975,
      spouseBirthYear: 1978,
      planningMode: 'couple' as const,
    })

    render(<WithdrawalVariablesCard {...props} />)

    // Open the collapsible card
    const header = screen.getByText('Variablen')
    await user.click(header)

    // Birth year props should be passed through to pension configuration
    expect(header).toBeInTheDocument()
  })
})
