import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CouplePreviewDisplay } from './CouplePreviewDisplay'
import type { CoupleHealthInsuranceYearResult } from '../../../helpers/health-care-insurance'

describe('CouplePreviewDisplay', () => {
  const mockCoupleResults: CoupleHealthInsuranceYearResult = {
    person1: {
      personId: 1,
      name: 'Partner 1',
      healthInsuranceResult: {
        totalAnnual: 3000,
        totalMonthly: 250,
        healthInsuranceAnnual: 2000,
        healthInsuranceMonthly: 166.67,
        careInsuranceAnnual: 1000,
        careInsuranceMonthly: 83.33,
        insuranceType: 'statutory',
        isRetirementPhase: true,
        appliedAdditionalCareInsurance: false,
      },
      coveredByFamilyInsurance: false,
      allocatedIncome: 30000,
      otherIncome: 0,
      totalIncome: 30000,
      qualifiesForFamilyInsurance: false,
    },
    person2: {
      personId: 2,
      name: 'Partner 2',
      healthInsuranceResult: {
        totalAnnual: 0,
        totalMonthly: 0,
        healthInsuranceAnnual: 0,
        healthInsuranceMonthly: 0,
        careInsuranceAnnual: 0,
        careInsuranceMonthly: 0,
        insuranceType: 'statutory',
        isRetirementPhase: true,
        appliedAdditionalCareInsurance: false,
      },
      coveredByFamilyInsurance: true,
      allocatedIncome: 0,
      otherIncome: 0,
      totalIncome: 0,
      qualifiesForFamilyInsurance: true,
    },
    totalAnnual: 3000,
    totalMonthly: 250,
    strategyUsed: 'optimize',
    strategyComparison: {
      individual: { totalAnnual: 6000, totalMonthly: 500 },
      family: { totalAnnual: 3000, totalMonthly: 250, primaryInsuredPerson: 1 },
      optimized: {
        totalAnnual: 3000,
        totalMonthly: 250,
        recommendedStrategy: 'family',
        savings: 3000,
      },
    },
    familyInsuranceDetails: {
      threshold: 505,
      person1QualifiesForFamily: false,
      person2QualifiesForFamily: true,
      possibleFamilyInsuranceArrangements: [
        {
          primaryPerson: 1,
          familyInsuredPerson: 2,
          totalCost: 3000,
          viable: true,
        },
      ],
    },
  }

  it('renders couple preview with correct header', () => {
    render(<CouplePreviewDisplay coupleResults={mockCoupleResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/💰 Kostenvorschau/)).toBeInTheDocument()
    expect(screen.getByText(/30\.000,00 €/)).toBeInTheDocument()
  })

  it('displays person 1 information correctly', () => {
    render(<CouplePreviewDisplay coupleResults={mockCoupleResults} withdrawalAmount={30000} />)

    expect(screen.getByText('👤 Partner 1')).toBeInTheDocument()
    expect(screen.getAllByText(/3\.000,00 €/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/250,00 €/).length).toBeGreaterThan(0)
    expect(screen.getByText('💳 Eigenversichert')).toBeInTheDocument()
  })

  it('displays person 2 information correctly', () => {
    render(<CouplePreviewDisplay coupleResults={mockCoupleResults} withdrawalAmount={30000} />)

    expect(screen.getByText('👤 Partner 2')).toBeInTheDocument()
    // Person 2 has 0 costs since they are family insured - multiple 0,00 € will appear
    expect(screen.getAllByText(/0,00 €/).length).toBeGreaterThan(0)
    expect(screen.getByText('👨‍👩‍👧‍👦 Familienversichert')).toBeInTheDocument()
  })

  it('displays total costs correctly', () => {
    render(<CouplePreviewDisplay coupleResults={mockCoupleResults} withdrawalAmount={30000} />)

    // Total should appear in the summary section
    const totals = screen.getAllByText(/3\.000,00 €/)
    expect(totals.length).toBeGreaterThan(0)
  })

  it('displays strategy information', () => {
    render(<CouplePreviewDisplay coupleResults={mockCoupleResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/Strategie:/)).toBeInTheDocument()
    expect(screen.getByText(/🎯 Optimiert/)).toBeInTheDocument()
  })

  it('shows family insurance strategy correctly', () => {
    const familyResults = {
      ...mockCoupleResults,
      strategyUsed: 'family' as const,
    }

    render(<CouplePreviewDisplay coupleResults={familyResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/👨‍👩‍👧‍👦 Familienversicherung/)).toBeInTheDocument()
  })

  it('shows individual insurance strategy correctly', () => {
    const individualResults = {
      ...mockCoupleResults,
      strategyUsed: 'individual' as const,
      person2: {
        ...mockCoupleResults.person2,
        coveredByFamilyInsurance: false,
        healthInsuranceResult: {
          totalAnnual: 2500,
          totalMonthly: 208.33,
          healthInsuranceAnnual: 1700,
          healthInsuranceMonthly: 141.67,
          careInsuranceAnnual: 800,
          careInsuranceMonthly: 66.67,
          insuranceType: 'statutory' as const,
          isRetirementPhase: true,
          appliedAdditionalCareInsurance: false,
        },
      },
      totalAnnual: 5500,
      totalMonthly: 458.33,
    }

    render(<CouplePreviewDisplay coupleResults={individualResults} withdrawalAmount={30000} />)

    expect(screen.getByText(/💳 Einzelversicherung/)).toBeInTheDocument()
    // Both should be eigenversichert
    const eigenversichert = screen.getAllByText(/💳 Eigenversichert/)
    expect(eigenversichert).toHaveLength(2)
  })

  it('renders with proper CSS classes for styling', () => {
    const { container } = render(
      <CouplePreviewDisplay coupleResults={mockCoupleResults} withdrawalAmount={30000} />,
    )

    expect(container.querySelector('.bg-green-50')).toBeInTheDocument()
    expect(container.querySelector('.border-green-200')).toBeInTheDocument()
  })

  it('handles large withdrawal amounts correctly', () => {
    render(<CouplePreviewDisplay coupleResults={mockCoupleResults} withdrawalAmount={100000} />)

    expect(screen.getByText(/100\.000,00 €/)).toBeInTheDocument()
  })
})
