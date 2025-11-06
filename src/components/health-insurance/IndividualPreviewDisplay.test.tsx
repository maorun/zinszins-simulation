import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IndividualPreviewDisplay } from './IndividualPreviewDisplay'
import type { HealthCareInsuranceYearResult } from '../../../helpers/health-care-insurance'

describe('IndividualPreviewDisplay', () => {
  const mockIndividualResults: HealthCareInsuranceYearResult = {
    totalAnnual: 3500,
    totalMonthly: 291.67,
    healthInsuranceAnnual: 2300,
    healthInsuranceMonthly: 191.67,
    careInsuranceAnnual: 1200,
    careInsuranceMonthly: 100,
    insuranceType: 'statutory',
    isRetirementPhase: true,
    appliedAdditionalCareInsurance: false,
  }

  it('renders individual preview with correct header', () => {
    render(<IndividualPreviewDisplay individualResults={mockIndividualResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/💰 Kostenvorschau/)).toBeInTheDocument()
    expect(screen.getByText(/30\.000,00 €/)).toBeInTheDocument()
  })

  it('displays annual cost correctly', () => {
    render(<IndividualPreviewDisplay individualResults={mockIndividualResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/Jährlich:/)).toBeInTheDocument()
    expect(screen.getByText(/3\.500,00 €/)).toBeInTheDocument()
  })

  it('displays monthly cost correctly', () => {
    render(<IndividualPreviewDisplay individualResults={mockIndividualResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/Monatlich:/)).toBeInTheDocument()
    expect(screen.getByText(/291,67 €/)).toBeInTheDocument()
  })

  it('displays health insurance breakdown', () => {
    render(<IndividualPreviewDisplay individualResults={mockIndividualResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/Krankenversicherung:/)).toBeInTheDocument()
    expect(screen.getByText(/2\.300,00 €/)).toBeInTheDocument()
  })

  it('displays care insurance breakdown', () => {
    render(<IndividualPreviewDisplay individualResults={mockIndividualResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/Pflegeversicherung:/)).toBeInTheDocument()
    expect(screen.getByText(/1\.200,00 €/)).toBeInTheDocument()
  })

  it('renders with proper CSS classes for styling', () => {
    const { container } = render(
      <IndividualPreviewDisplay individualResults={mockIndividualResults} withdrawalAmount={30000} />,
    )

    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument()
    expect(container.querySelector('.border-blue-200')).toBeInTheDocument()
  })

  it('handles zero costs correctly', () => {
    const zeroCostResults: HealthCareInsuranceYearResult = {
      totalAnnual: 0,
      totalMonthly: 0,
      healthInsuranceAnnual: 0,
      healthInsuranceMonthly: 0,
      careInsuranceAnnual: 0,
      careInsuranceMonthly: 0,
      insuranceType: 'statutory',
      isRetirementPhase: true,
      appliedAdditionalCareInsurance: false,
    }

    render(<IndividualPreviewDisplay individualResults={zeroCostResults} withdrawalAmount={30000} />)

    // Multiple instances of 0,00 € will appear
    expect(screen.getAllByText(/0,00 €/).length).toBeGreaterThan(0)
  })

  it('handles large withdrawal amounts correctly', () => {
    render(<IndividualPreviewDisplay individualResults={mockIndividualResults} withdrawalAmount={100000} />)

    expect(screen.getByText(/100\.000,00 €/)).toBeInTheDocument()
  })

  it('displays all required information sections', () => {
    const { container } = render(
      <IndividualPreviewDisplay individualResults={mockIndividualResults} withdrawalAmount={30000} />,
    )

    // Check that main container and sections are present
    expect(container.querySelector('.space-y-2')).toBeInTheDocument()
    expect(screen.getByText(/Jährlich:/)).toBeInTheDocument()
    expect(screen.getByText(/Monatlich:/)).toBeInTheDocument()
  })
})
