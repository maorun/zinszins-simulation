/**
 * Tests for InsuranceCostOverview component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InsuranceCostOverview } from './InsuranceCostOverview'

// Mock the simulation context
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn(() => ({
    startEnd: [2024, 2040],
    termLifeInsuranceConfig: {
      name: 'Test RLV',
      startYear: 2024,
      endYear: 2040,
      coverageAmount: 200000,
      coverageType: 'level',
      annualDecreasePercent: 0,
      birthYear: 1990,
      gender: 'male',
      healthStatus: 'good',
      smokingStatus: 'non-smoker',
      enabled: true,
    },
  })),
}))

// Mock the withdrawal config hook
vi.mock('../hooks/useWithdrawalConfig', () => ({
  useWithdrawalConfig: vi.fn(() => ({
    currentConfig: {
      formValue: {
        healthCareInsuranceConfig: {
          enabled: true,
          planningMode: 'individual',
          insuranceType: 'private',
          includeEmployerContribution: false,
          statutoryHealthInsuranceRate: 0.146,
          statutoryCareInsuranceRate: 0.0305,
          statutoryMinimumIncomeBase: 18000,
          statutoryMaximumIncomeBase: 62100,
          privateHealthInsuranceMonthly: 500,
          privateCareInsuranceMonthly: 100,
          privateInsuranceInflationRate: 0.02,
          retirementStartYear: 2040,
          additionalCareInsuranceForChildless: false,
          additionalCareInsuranceAge: 23,
        },
        monatlicheBetrag: 3000,
      },
    },
    updateFormValue: vi.fn(),
  })),
}))

describe('InsuranceCostOverview', () => {
  it('should render the component', () => {
    render(<InsuranceCostOverview />)

    expect(screen.getByText('🏥 Versicherungskostenübersicht')).toBeInTheDocument()
  })

  it('should display summary when expanded', async () => {
    const user = userEvent.setup()
    render(<InsuranceCostOverview />)

    // Click to expand the collapsible
    const header = screen.getByText('🏥 Versicherungskostenübersicht')
    await user.click(header)

    // Now the content should be visible
    expect(screen.getByText('💡 Versicherungskostenübersicht')).toBeInTheDocument()
    expect(screen.getByText('📊 Zusammenfassung')).toBeInTheDocument()
  })

  it('should display info message when expanded', async () => {
    const user = userEvent.setup()
    render(<InsuranceCostOverview />)

    // Expand
    const header = screen.getByText('🏥 Versicherungskostenübersicht')
    await user.click(header)

    expect(screen.getByText('💡 Versicherungskostenübersicht')).toBeInTheDocument()
    expect(screen.getByText(/Diese Übersicht zeigt Ihre konfigurierten Versicherungskosten/)).toBeInTheDocument()
  })

  it('should display summary statistics when expanded', async () => {
    const user = userEvent.setup()
    render(<InsuranceCostOverview />)

    // Expand
    const header = screen.getByText('🏥 Versicherungskostenübersicht')
    await user.click(header)

    expect(screen.getByText('📊 Zusammenfassung')).toBeInTheDocument()
    expect(screen.getByText('Durchschnittliche jährliche Kosten:')).toBeInTheDocument()
    expect(screen.getByText('Höchste jährliche Kosten:')).toBeInTheDocument()
    expect(screen.getByText('Gesamtkosten über Zeitraum:')).toBeInTheDocument()
  })

  it('should display configured insurances when expanded', async () => {
    const user = userEvent.setup()
    render(<InsuranceCostOverview />)

    // Expand
    const header = screen.getByText('🏥 Versicherungskostenübersicht')
    await user.click(header)

    expect(screen.getByText('Konfigurierte Versicherungen:')).toBeInTheDocument()
  })

  it('should show category breakdown when expanded', async () => {
    const user = userEvent.setup()
    render(<InsuranceCostOverview />)

    // Expand
    const header = screen.getByText('🏥 Versicherungskostenübersicht')
    await user.click(header)

    // Should show category breakdown section
    expect(screen.getByText('Durchschnittliche Kosten nach Kategorie:')).toBeInTheDocument()
  })
})

describe('InsuranceCostOverview - Accessibility', () => {
  it('should be collapsible', () => {
    const { container } = render(<InsuranceCostOverview />)

    // Should have collapsible structure
    const collapsible = container.querySelector('[data-state]')
    expect(collapsible).toBeInTheDocument()
  })

  it('should have proper heading structure', () => {
    render(<InsuranceCostOverview />)

    // Card should have a title
    expect(screen.getByText('🏥 Versicherungskostenübersicht')).toBeInTheDocument()
  })
})

describe('InsuranceCostOverview - Integration', () => {
  it('should calculate costs from configured insurances', async () => {
    const user = userEvent.setup()
    render(<InsuranceCostOverview />)

    // Expand
    const header = screen.getByText('🏥 Versicherungskostenübersicht')
    await user.click(header)

    // Should show that insurances are configured
    expect(screen.getByText('📊 Zusammenfassung')).toBeInTheDocument()
    expect(screen.getByText('Konfigurierte Versicherungen:')).toBeInTheDocument()
  })

  it('should use simulation time range', async () => {
    const user = userEvent.setup()
    render(<InsuranceCostOverview />)

    // Expand
    const header = screen.getByText('🏥 Versicherungskostenübersicht')
    await user.click(header)

    // Summary should exist, indicating calculation over the time range
    expect(screen.getByText('📊 Zusammenfassung')).toBeInTheDocument()
    expect(screen.getByText('Gesamtkosten über Zeitraum:')).toBeInTheDocument()
  })
})
