import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthCareInsuranceConfiguration } from './HealthCareInsuranceConfiguration'

describe('HealthCareInsuranceConfiguration', () => {
  const defaultValues = {
    enabled: false,
    insuranceType: 'statutory' as const,
    includeEmployerContribution: true,
    statutoryHealthInsuranceRate: 14.6,
    statutoryCareInsuranceRate: 3.05,
    statutoryMinimumIncomeBase: 13230,
    statutoryMaximumIncomeBase: 62550,
    privateHealthInsuranceMonthly: 400,
    privateCareInsuranceMonthly: 100,
    privateInsuranceInflationRate: 2,
    retirementStartYear: 2041,
    additionalCareInsuranceForChildless: false,
    additionalCareInsuranceAge: 23,
  }

  const mockHandlers = {
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
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without errors', () => {
    render(
      <HealthCareInsuranceConfiguration
        values={defaultValues}
        onChange={mockHandlers}
      />,
    )

    // Component should render the title
    expect(screen.getByText(/Kranken- und Pflegeversicherung/)).toBeInTheDocument()
  })

  it('displays correct mode in title for statutory insurance', () => {
    const statutoryValues = { ...defaultValues, insuranceType: 'statutory' as const }

    render(
      <HealthCareInsuranceConfiguration
        values={statutoryValues}
        onChange={mockHandlers}
      />,
    )

    expect(screen.getByText('(Gesetzlich)')).toBeInTheDocument()
  })

  it('displays correct mode in title for private insurance', () => {
    const privateValues = { ...defaultValues, insuranceType: 'private' as const }

    render(
      <HealthCareInsuranceConfiguration
        values={privateValues}
        onChange={mockHandlers}
      />,
    )

    expect(screen.getByText('(Privat)')).toBeInTheDocument()
  })

  it('handles basic enabled state correctly', () => {
    const enabledValues = { ...defaultValues, enabled: true }

    render(
      <HealthCareInsuranceConfiguration
        values={enabledValues}
        onChange={mockHandlers}
      />,
    )

    // Should render without throwing errors when enabled
    expect(screen.getByText(/Kranken- und Pflegeversicherung/)).toBeInTheDocument()
  })

  it('handles disabled state correctly', () => {
    render(
      <HealthCareInsuranceConfiguration
        values={defaultValues}
        onChange={mockHandlers}
      />,
    )

    // Should render without throwing errors when disabled
    expect(screen.getByText(/Kranken- und Pflegeversicherung/)).toBeInTheDocument()
  })
})
