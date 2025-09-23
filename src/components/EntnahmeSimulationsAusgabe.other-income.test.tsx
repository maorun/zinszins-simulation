import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EntnahmeSimulationsAusgabe } from './EntnahmeSimulationsAusgabe'

// Mock the simulation context
const mockUseSimulation = vi.fn()
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => mockUseSimulation(),
}))

// Mock the hooks
const mockUseWithdrawalConfig = vi.fn()
const mockUseWithdrawalCalculations = vi.fn()
const mockUseWithdrawalModals = vi.fn()

vi.mock('../hooks/useWithdrawalConfig', () => ({
  useWithdrawalConfig: () => mockUseWithdrawalConfig(),
}))

vi.mock('../hooks/useWithdrawalCalculations', () => ({
  useWithdrawalCalculations: () => mockUseWithdrawalCalculations(),
}))

vi.mock('../hooks/useWithdrawalModals', () => ({
  useWithdrawalModals: () => mockUseWithdrawalModals(),
}))

describe('EntnahmeSimulationsAusgabe - Other Income Integration', () => {
  // Helper function to expand Variables section and Other Income section
  const expandVariablesAndOtherIncome = async () => {
    // Step 1: Expand the Variables section
    const variablesSection = screen.getByText('Variablen')
    fireEvent.click(variablesSection)

    // Step 2: Wait for and expand the Other Income section
    await waitFor(() => {
      expect(screen.getByText('💰 Andere Einkünfte')).toBeInTheDocument()
    })

    const otherIncomeSection = screen.getByText('💰 Andere Einkünfte')
    fireEvent.click(otherIncomeSection)
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Setup default mock returns
    mockUseSimulation.mockReturnValue({
      grundfreibetragAktiv: false,
      grundfreibetragBetrag: 12000,
    })

    const mockCurrentConfig = {
      formValue: {
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 2,
      },
      withdrawalReturnMode: 'fixed' as const,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      otherIncomeConfig: {
        enabled: false,
        sources: [],
      },
    }

    mockUseWithdrawalConfig.mockReturnValue({
      currentConfig: mockCurrentConfig,
      updateConfig: vi.fn(),
      updateFormValue: vi.fn(),
    })

    mockUseWithdrawalCalculations.mockReturnValue({
      withdrawalData: null,
      isCalculating: false,
    })

    mockUseWithdrawalModals.mockReturnValue({
      showCalculationModal: false,
      setShowCalculationModal: vi.fn(),
      calculationDetails: null,
      handleCalculationInfoClick: vi.fn(),
      selectedVorabDetails: null,
      setSelectedVorabDetails: vi.fn(),
      showVorabModal: false,
      setShowVorabModal: vi.fn(),
    })
  })

  it('should render other income section', async () => {
    render(
      <EntnahmeSimulationsAusgabe
        startEnd={[2025, 2080]}
        elemente={[]}
        dispatchEnd={vi.fn()}
        steuerlast={0.26375}
        teilfreistellungsquote={0.30}
      />,
    )

    // Navigate to other income section
    await expandVariablesAndOtherIncome()

    // Check that the other income section is rendered
    await waitFor(() => {
      expect(screen.getByText(/Hier können Sie zusätzliche Einkünfte/)).toBeInTheDocument()
    })
  })

  it('should show other income configuration when enabled', async () => {
    // Override mock to enable other income
    const mockCurrentConfigEnabled = {
      formValue: {
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 2,
      },
      withdrawalReturnMode: 'fixed' as const,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      otherIncomeConfig: {
        enabled: true,
        sources: [],
      },
    }

    mockUseWithdrawalConfig.mockReturnValue({
      currentConfig: mockCurrentConfigEnabled,
      updateConfig: vi.fn(),
      updateFormValue: vi.fn(),
    })

    render(
      <EntnahmeSimulationsAusgabe
        startEnd={[2025, 2080]}
        elemente={[]}
        dispatchEnd={vi.fn()}
        steuerlast={0.26375}
        teilfreistellungsquote={0.30}
      />,
    )

    // Navigate to other income section
    await expandVariablesAndOtherIncome()

    // Check that the enable toggle exists and is visible
    await waitFor(() => {
      expect(screen.getByText('Andere Einkünfte aktivieren')).toBeInTheDocument()
    })

    // Should also show the add button when enabled
    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })
  })

  it('should display income sources when configured', async () => {
    // Override mock to show configured income sources
    const mockCurrentConfigWithSources = {
      formValue: {
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 2,
      },
      withdrawalReturnMode: 'fixed' as const,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      otherIncomeConfig: {
        enabled: true,
        sources: [
          {
            id: 'test-rental',
            name: 'Rental Property Income',
            type: 'rental',
            amountType: 'net',
            monthlyAmount: 1200,
            startYear: 2025,
            endYear: 2080,
            inflationRate: 0.02,
            taxRate: 0.25,
            enabled: true,
            notes: 'Monthly rental income',
          },
        ],
      },
    }

    mockUseWithdrawalConfig.mockReturnValue({
      currentConfig: mockCurrentConfigWithSources,
      updateConfig: vi.fn(),
      updateFormValue: vi.fn(),
    })

    render(
      <EntnahmeSimulationsAusgabe
        startEnd={[2025, 2080]}
        elemente={[]}
        dispatchEnd={vi.fn()}
        steuerlast={0.26375}
        teilfreistellungsquote={0.30}
      />,
    )

    // Navigate to other income section
    await expandVariablesAndOtherIncome()

    // Check that the configured income source is displayed
    await waitFor(() => {
      expect(screen.getByText('Rental Property Income')).toBeInTheDocument()
    })
  })
})
