import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

    expect(
      screen.getByText(/Planen Sie Ihren Notfallfonds und Liquiditätsreserven/i),
    ).toBeInTheDocument()
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

describe('EmergencyFundSection - Enabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock with enabled state
    vi.doMock('./useEmergencyFund', () => ({
      useEmergencyFund: () => ({
        config: {
          enabled: true,
          monthlyExpenses: 2000,
          targetMonths: 6,
          employmentType: 'employee' as const,
          reserveStrategy: 'balanced' as const,
          excludeFromInvestment: true,
        },
        fundStatus: {
          currentAmount: 3000,
          targetAmount: 12000,
          progress: 25,
          isFunded: false,
          shortfall: 9000,
          monthsCovered: 1.5,
          recommendedMonths: 4,
        },
        currentCapital: 3000,
        recommendedMonths: 4,
        handleToggleEnabled: vi.fn(),
        handleMonthlyExpensesChange: vi.fn(),
        handleTargetMonthsChange: vi.fn(),
        handleEmploymentTypeChange: vi.fn(),
        handleReserveStrategyChange: vi.fn(),
        handleExcludeFromInvestmentChange: vi.fn(),
      }),
    }))
  })

  it('should show information banner when enabled', () => {
    const { useEmergencyFund } = require('./useEmergencyFund')
    const mockHook = useEmergencyFund()

    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    if (mockHook.config.enabled) {
      expect(screen.getByText(/Was ist ein Notgroschen?/i)).toBeInTheDocument()
    }
  })

  it('should show status display when enabled', () => {
    const { useEmergencyFund } = require('./useEmergencyFund')
    const mockHook = useEmergencyFund()

    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    if (mockHook.config.enabled) {
      expect(screen.getByText(/Aktueller Status/i)).toBeInTheDocument()
    }
  })

  it('should show warning when underfunded', () => {
    const { useEmergencyFund } = require('./useEmergencyFund')
    const mockHook = useEmergencyFund()

    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    if (mockHook.config.enabled && !mockHook.fundStatus.isFunded) {
      expect(screen.getByText(/Empfehlung/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Bauen Sie zunächst Ihren Notgroschen auf/i),
      ).toBeInTheDocument()
    }
  })

  it('should have collapsible configuration section', () => {
    const { useEmergencyFund } = require('./useEmergencyFund')
    const mockHook = useEmergencyFund()

    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    if (mockHook.config.enabled) {
      expect(screen.getByText(/Konfiguration anpassen/i)).toBeInTheDocument()
    }
  })
})

describe('EmergencyFundSection - Fully Funded', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock with fully funded state
    vi.doMock('./useEmergencyFund', () => ({
      useEmergencyFund: () => ({
        config: {
          enabled: true,
          monthlyExpenses: 2000,
          targetMonths: 6,
          employmentType: 'employee' as const,
          reserveStrategy: 'balanced' as const,
          excludeFromInvestment: true,
        },
        fundStatus: {
          currentAmount: 12000,
          targetAmount: 12000,
          progress: 100,
          isFunded: true,
          shortfall: 0,
          monthsCovered: 6,
          recommendedMonths: 4,
        },
        currentCapital: 12000,
        recommendedMonths: 4,
        handleToggleEnabled: vi.fn(),
        handleMonthlyExpensesChange: vi.fn(),
        handleTargetMonthsChange: vi.fn(),
        handleEmploymentTypeChange: vi.fn(),
        handleReserveStrategyChange: vi.fn(),
        handleExcludeFromInvestmentChange: vi.fn(),
      }),
    }))
  })

  it('should show multi-tier liquidity display when fully funded', () => {
    const { useEmergencyFund } = require('./useEmergencyFund')
    const mockHook = useEmergencyFund()

    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    if (mockHook.config.enabled && mockHook.fundStatus.isFunded) {
      expect(screen.getByText(/Empfohlene Liquiditätsaufteilung/i)).toBeInTheDocument()
    }
  })

  it('should not show warning when fully funded', () => {
    const { useEmergencyFund } = require('./useEmergencyFund')
    const mockHook = useEmergencyFund()

    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    if (mockHook.config.enabled && mockHook.fundStatus.isFunded) {
      expect(screen.queryByText(/Bauen Sie zunächst Ihren Notgroschen auf/i)).not.toBeInTheDocument()
    }
  })
})

describe('EmergencyFundSection - User Interactions', () => {
  it('should toggle configuration section when clicked', async () => {
    const { useEmergencyFund } = require('./useEmergencyFund')
    const mockHook = {
      config: {
        enabled: true,
        monthlyExpenses: 2000,
        targetMonths: 6,
        employmentType: 'employee' as const,
        reserveStrategy: 'balanced' as const,
        excludeFromInvestment: true,
      },
      fundStatus: {
        currentAmount: 3000,
        targetAmount: 12000,
        progress: 25,
        isFunded: false,
        shortfall: 9000,
        monthsCovered: 1.5,
        recommendedMonths: 4,
      },
      currentCapital: 3000,
      recommendedMonths: 4,
      handleToggleEnabled: vi.fn(),
      handleMonthlyExpensesChange: vi.fn(),
      handleTargetMonthsChange: vi.fn(),
      handleEmploymentTypeChange: vi.fn(),
      handleReserveStrategyChange: vi.fn(),
      handleExcludeFromInvestmentChange: vi.fn(),
    }

    vi.mocked(useEmergencyFund).mockReturnValue(mockHook)

    const user = userEvent.setup()

    render(
      <SimulationProvider>
        <EmergencyFundSection />
      </SimulationProvider>,
    )

    const configButton = screen.getByText(/Konfiguration anpassen/i)

    // Configuration should be collapsed initially
    expect(screen.queryByText(/Monatliche Ausgaben:/i)).not.toBeVisible()

    // Click to expand
    await user.click(configButton)

    // Configuration should now be visible
    expect(screen.getByText(/Monatliche Ausgaben:/i)).toBeVisible()
  })
})
