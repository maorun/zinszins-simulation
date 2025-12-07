import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmergencyFundSection } from './EmergencyFundSection'
import { SimulationProvider } from '../../contexts/SimulationContext'

// Mock the useEmergencyFund hook
vi.mock('./useEmergencyFund', () => ({
  useEmergencyFund: () => ({
    config: {
      enabled: false,
      monthlyExpenses: 2000,
      targetMonths: 3,
      employmentType: 'employee' as const,
      reserveStrategy: 'balanced' as const,
      excludeFromInvestment: true,
    },
    fundStatus: {
      currentAmount: 0,
      targetAmount: 6000,
      progress: 0,
      isFunded: false,
      shortfall: 6000,
      monthsCovered: 0,
      recommendedMonths: 4,
    },
    currentCapital: 0,
    recommendedMonths: 4,
    handleToggleEnabled: vi.fn(),
    handleMonthlyExpensesChange: vi.fn(),
    handleTargetMonthsChange: vi.fn(),
    handleEmploymentTypeChange: vi.fn(),
    handleReserveStrategyChange: vi.fn(),
    handleExcludeFromInvestmentChange: vi.fn(),
  }),
}))

describe('EmergencyFundSection', () => {
  it('should render the section with correct title', () => {
    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    expect(screen.getByText(/Notgroschen & Liquiditätsplanung/i)).toBeInTheDocument()
  })

  it('should render description', () => {
    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    expect(screen.getByText(/Planen Sie Ihren Notfallfonds und Liquiditätsreserven/i)).toBeInTheDocument()
  })

  it('should have an enable switch', () => {
    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBeGreaterThan(0)
  })

  it('should not show configuration when disabled', () => {
    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    // Should not show the information banner when disabled
    expect(screen.queryByText(/Was ist ein Notgroschen?/i)).not.toBeInTheDocument()
  })
})
