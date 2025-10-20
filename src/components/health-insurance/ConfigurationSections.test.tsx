import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfigurationSections } from './ConfigurationSections'

describe('ConfigurationSections', () => {
  const defaultProps = {
    planningMode: 'individual' as const,
    insuranceType: 'statutory' as const,
    includeEmployerContribution: true,
    statutoryHealthInsuranceRate: 14.6,
    statutoryCareInsuranceRate: 3.05,
    statutoryMinimumIncomeBase: 13230,
    statutoryMaximumIncomeBase: 62550,
    onIncludeEmployerContributionChange: vi.fn(),
    onStatutoryMinimumIncomeBaseChange: vi.fn(),
    onStatutoryMaximumIncomeBaseChange: vi.fn(),
    privateHealthInsuranceMonthly: 400,
    privateCareInsuranceMonthly: 100,
    privateInsuranceInflationRate: 2,
    onPrivateHealthInsuranceMonthlyChange: vi.fn(),
    onPrivateCareInsuranceMonthlyChange: vi.fn(),
    onPrivateInsuranceInflationRateChange: vi.fn(),
    additionalCareInsuranceForChildless: false,
    additionalCareInsuranceAge: 23,
    onAdditionalCareInsuranceForChildlessChange: vi.fn(),
    onAdditionalCareInsuranceAgeChange: vi.fn(),
  }

  it('renders statutory insurance config when insurance type is statutory', () => {
    render(<ConfigurationSections {...defaultProps} />)

    // Should render statutory insurance configuration
    expect(screen.getByText(/Gesetzliche Beitragssätze/)).toBeInTheDocument()
  })

  it('renders private insurance config when insurance type is private', () => {
    render(<ConfigurationSections {...defaultProps} insuranceType="private" />)

    // Should render private insurance configuration
    expect(screen.getByText(/Private Versicherungsbeiträge/)).toBeInTheDocument()
  })

  it('renders additional care insurance for individual mode', () => {
    render(<ConfigurationSections {...defaultProps} />)

    // Should render additional care insurance section
    expect(screen.getByText(/Zusätzlicher Pflegeversicherungsbeitrag für Kinderlose/)).toBeInTheDocument()
  })

  it('does not render additional care insurance for couple mode', () => {
    render(<ConfigurationSections {...defaultProps} planningMode="couple" />)

    // Should NOT render additional care insurance section in couple mode
    expect(screen.queryByText(/Zusätzlicher Pflegeversicherungsbeitrag für Kinderlose/)).not.toBeInTheDocument()
  })

  it('renders couple configuration when planning mode is couple and insurance type is statutory', () => {
    const coupleProps = {
      ...defaultProps,
      planningMode: 'couple' as const,
      onCoupleStrategyChange: vi.fn(),
      onFamilyInsuranceThresholdRegularChange: vi.fn(),
      onFamilyInsuranceThresholdMiniJobChange: vi.fn(),
      onPerson1NameChange: vi.fn(),
      onPerson1WithdrawalShareChange: vi.fn(),
      onPerson1OtherIncomeAnnualChange: vi.fn(),
      onPerson1AdditionalCareInsuranceForChildlessChange: vi.fn(),
      onPerson2NameChange: vi.fn(),
      onPerson2WithdrawalShareChange: vi.fn(),
      onPerson2OtherIncomeAnnualChange: vi.fn(),
      onPerson2AdditionalCareInsuranceForChildlessChange: vi.fn(),
    }

    render(<ConfigurationSections {...coupleProps} />)

    // Should render couple configuration
    expect(screen.getByText(/Familienversicherung für Paare/)).toBeInTheDocument()
  })

  it('does not render couple configuration for private insurance', () => {
    const coupleProps = {
      ...defaultProps,
      planningMode: 'couple' as const,
      insuranceType: 'private' as const,
      onCoupleStrategyChange: vi.fn(),
    }

    render(<ConfigurationSections {...coupleProps} />)

    // Should NOT render couple configuration for private insurance
    expect(screen.queryByText(/Familienversicherung für Paare/)).not.toBeInTheDocument()
  })
})
