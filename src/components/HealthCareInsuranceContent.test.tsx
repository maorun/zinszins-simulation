import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthCareInsuranceContent } from './HealthCareInsuranceContent'

// Mock the HealthCareInsuranceConfiguration component
vi.mock('./HealthCareInsuranceConfiguration', () => ({
  HealthCareInsuranceConfiguration: () => <div>Health Care Insurance Config</div>,
}))

describe('HealthCareInsuranceContent', () => {
  const defaultProps = {
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
    planningMode: 'individual' as const,
    startOfIndependence: 2040,
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

  it('should render health care insurance configuration', () => {
    render(<HealthCareInsuranceContent {...defaultProps} />)

    expect(screen.getByText('Health Care Insurance Config')).toBeInTheDocument()
  })

  it('should wrap configuration in a div with proper margin', () => {
    const { container } = render(<HealthCareInsuranceContent {...defaultProps} />)

    const wrapper = container.querySelector('div.mb-6')
    expect(wrapper).toBeInTheDocument()
  })
})
