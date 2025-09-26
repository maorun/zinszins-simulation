import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthCareInsuranceConfiguration } from './HealthCareInsuranceConfiguration'

describe('HealthCareInsuranceConfiguration', () => {
  const defaultValues = {
    enabled: false,
    healthInsuranceRatePreRetirement: 14.6,
    careInsuranceRatePreRetirement: 3.05,
    healthInsuranceRateRetirement: 7.3,
    careInsuranceRateRetirement: 3.05,
    retirementStartYear: 2041,
    useFixedAmounts: false,
    fixedHealthInsuranceMonthly: undefined,
    fixedCareInsuranceMonthly: undefined,
    healthInsuranceIncomeThreshold: undefined,
    careInsuranceIncomeThreshold: undefined,
    additionalCareInsuranceForChildless: false,
    additionalCareInsuranceAge: 23,
  }

  const mockHandlers = {
    onEnabledChange: vi.fn(),
    onHealthInsuranceRatePreRetirementChange: vi.fn(),
    onCareInsuranceRatePreRetirementChange: vi.fn(),
    onHealthInsuranceRateRetirementChange: vi.fn(),
    onCareInsuranceRateRetirementChange: vi.fn(),
    onRetirementStartYearChange: vi.fn(),
    onUseFixedAmountsChange: vi.fn(),
    onFixedHealthInsuranceMonthlyChange: vi.fn(),
    onFixedCareInsuranceMonthlyChange: vi.fn(),
    onHealthInsuranceIncomeThresholdChange: vi.fn(),
    onCareInsuranceIncomeThresholdChange: vi.fn(),
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

  it('displays correct mode in title for percentage configuration', () => {
    const percentageValues = { ...defaultValues, enabled: true, useFixedAmounts: false }

    render(
      <HealthCareInsuranceConfiguration
        values={percentageValues}
        onChange={mockHandlers}
      />,
    )

    expect(screen.getByText('(Prozentuale Beiträge)')).toBeInTheDocument()
  })

  it('displays correct mode in title for fixed amounts configuration', () => {
    const fixedValues = { ...defaultValues, enabled: true, useFixedAmounts: true }

    render(
      <HealthCareInsuranceConfiguration
        values={fixedValues}
        onChange={mockHandlers}
      />,
    )

    expect(screen.getByText('(Feste Beiträge)')).toBeInTheDocument()
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