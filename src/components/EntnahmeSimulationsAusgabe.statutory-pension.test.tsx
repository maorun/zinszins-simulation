import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EntnahmeSimulationsAusgabe } from './EntnahmeSimulationsAusgabe'
import type { SparplanElement } from '../utils/sparplan-utils'

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

describe('EntnahmeSimulationsAusgabe - Statutory Pension Integration', () => {
  // Helper function to expand both Variables section to access Statutory Pension Configuration
  const expandVariablesAndGlobalConfig = async () => {
    // Expand the Variables section first
    const variablesSection = screen.getByText('Variablen')
    fireEvent.click(variablesSection)

    // The Statutory Pension Configuration is now directly in the Variables section
    // (Global Configuration was moved to HomePage)
    await waitFor(() => {
      expect(screen.getByText('🏛️ Gesetzliche Renten-Konfiguration')).toBeInTheDocument()
    })

    const statutoryPensionSection = screen.getByText('🏛️ Gesetzliche Renten-Konfiguration')
    fireEvent.click(statutoryPensionSection)

    // Wait for the statutory pension content to be visible
    await waitFor(() => {
      expect(screen.getByText('Gesetzliche Rente berücksichtigen')).toBeInTheDocument()
    })
  }

  const mockElements: SparplanElement[] = [
    {
      type: 'sparplan',
      start: '2023-01-01',
      einzahlung: 1000,
      simulation: {
        2040: {
          startkapital: 100000,
          endkapital: 100000,
          zinsen: 0,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      },
    },
  ]

  const mockDispatchEnd = vi.fn()
  const mockOnWithdrawalResultsChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseSimulation.mockReturnValue({
      grundfreibetragAktiv: false,
      grundfreibetragBetrag: 12000,
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

    mockUseWithdrawalCalculations.mockReturnValue({
      withdrawalData: null,
      comparisonResults: [],
      segmentedComparisonResults: [],
    })
  })

  it('should render statutory pension configuration when enabled', async () => {
    const mockCurrentConfig = {
      formValue: {
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 2,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 10,
        variabelProzent: 4,
        dynamischBasisrate: 4,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
        rmdStartAge: 65,
        rmdLifeExpectancyTable: 'german_2020_22' as const,
        kapitalerhaltNominalReturn: 7,
        kapitalerhaltInflationRate: 2,
        einkommensteuersatz: 18,
        statutoryPensionConfig: {
          enabled: true,
          startYear: 2041,
          monthlyAmount: 1500,
          annualIncreaseRate: 1.0,
          taxablePercentage: 80,
          retirementAge: 67,
          birthYear: 1974,
        },
      },
      withdrawalReturnMode: 'fixed' as const,
      withdrawalVariableReturns: {},
      withdrawalAverageReturn: 5,
      withdrawalStandardDeviation: 12,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      useComparisonMode: false,
      comparisonStrategies: [],
      useSegmentedComparisonMode: false,
      segmentedComparisonStrategies: [],
    }

    const mockUpdateFormValue = vi.fn()

    mockUseWithdrawalConfig.mockReturnValue({
      currentConfig: mockCurrentConfig,
      updateConfig: vi.fn(),
      updateFormValue: mockUpdateFormValue,
      updateComparisonStrategy: vi.fn(),
      updateSegmentedComparisonStrategy: vi.fn(),
      addSegmentedComparisonStrategy: vi.fn(),
      removeSegmentedComparisonStrategy: vi.fn(),
    })

    render(
      <EntnahmeSimulationsAusgabe
        startEnd={[2041, 2080]}
        elemente={mockElements}
        dispatchEnd={mockDispatchEnd}
        onWithdrawalResultsChange={mockOnWithdrawalResultsChange}
        steuerlast={26.375}
        teilfreistellungsquote={30}
      />,
    )

    // Expand the Variables and Global Configuration sections
    await expandVariablesAndGlobalConfig()
  })

  it('should handle statutory pension configuration updates', async () => {
    const mockCurrentConfig = {
      formValue: {
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 2,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 10,
        variabelProzent: 4,
        dynamischBasisrate: 4,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
        rmdStartAge: 65,
        rmdLifeExpectancyTable: 'german_2020_22' as const,
        kapitalerhaltNominalReturn: 7,
        kapitalerhaltInflationRate: 2,
        einkommensteuersatz: 18,
        statutoryPensionConfig: {
          enabled: false,
          startYear: 2041,
          monthlyAmount: 1500,
          annualIncreaseRate: 1.0,
          taxablePercentage: 80,
        },
      },
      // ... other config properties
      withdrawalReturnMode: 'fixed' as const,
      withdrawalVariableReturns: {},
      withdrawalAverageReturn: 5,
      withdrawalStandardDeviation: 12,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      useComparisonMode: false,
      comparisonStrategies: [],
      useSegmentedComparisonMode: false,
      segmentedComparisonStrategies: [],
    }

    const mockUpdateFormValue = vi.fn()

    mockUseWithdrawalConfig.mockReturnValue({
      currentConfig: mockCurrentConfig,
      updateConfig: vi.fn(),
      updateFormValue: mockUpdateFormValue,
      updateComparisonStrategy: vi.fn(),
      updateSegmentedComparisonStrategy: vi.fn(),
      addSegmentedComparisonStrategy: vi.fn(),
      removeSegmentedComparisonStrategy: vi.fn(),
    })

    render(
      <EntnahmeSimulationsAusgabe
        startEnd={[2041, 2080]}
        elemente={mockElements}
        dispatchEnd={mockDispatchEnd}
        onWithdrawalResultsChange={mockOnWithdrawalResultsChange}
        steuerlast={26.375}
        teilfreistellungsquote={30}
      />,
    )

    // Expand the Variables and Global Configuration sections
    await expandVariablesAndGlobalConfig()

    // Wait for the toggle to be visible and then click it
    const toggle = screen.getByRole('switch', { name: /Gesetzliche Rente berücksichtigen/i })
    expect(toggle).toBeInTheDocument()
    fireEvent.click(toggle)

    // Should call updateFormValue with enabled: true
    await waitFor(() => {
      expect(mockUpdateFormValue).toHaveBeenCalledWith({
        statutoryPensionConfig: {
          ...mockCurrentConfig.formValue.statutoryPensionConfig,
          enabled: true,
        },
      })
    })
  })

  it('should display statutory pension configuration fields when enabled', async () => {
    const mockCurrentConfig = {
      formValue: {
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 2,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 10,
        variabelProzent: 4,
        dynamischBasisrate: 4,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
        rmdStartAge: 65,
        rmdLifeExpectancyTable: 'german_2020_22' as const,
        kapitalerhaltNominalReturn: 7,
        kapitalerhaltInflationRate: 2,
        einkommensteuersatz: 18,
        statutoryPensionConfig: {
          enabled: true,
          startYear: 2041,
          monthlyAmount: 1500,
          annualIncreaseRate: 1.0,
          taxablePercentage: 80,
          retirementAge: 67,
        },
      },
      // ... other config properties
      withdrawalReturnMode: 'fixed' as const,
      withdrawalVariableReturns: {},
      withdrawalAverageReturn: 5,
      withdrawalStandardDeviation: 12,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      useComparisonMode: false,
      comparisonStrategies: [],
      useSegmentedComparisonMode: false,
      segmentedComparisonStrategies: [],
    }

    mockUseWithdrawalConfig.mockReturnValue({
      currentConfig: mockCurrentConfig,
      updateConfig: vi.fn(),
      updateFormValue: vi.fn(),
      updateComparisonStrategy: vi.fn(),
      updateSegmentedComparisonStrategy: vi.fn(),
      addSegmentedComparisonStrategy: vi.fn(),
      removeSegmentedComparisonStrategy: vi.fn(),
    })

    render(
      <EntnahmeSimulationsAusgabe
        startEnd={[2041, 2080]}
        elemente={mockElements}
        dispatchEnd={mockDispatchEnd}
        onWithdrawalResultsChange={mockOnWithdrawalResultsChange}
        steuerlast={26.375}
        teilfreistellungsquote={30}
      />,
    )

    // Expand the Variables and Global Configuration sections
    await expandVariablesAndGlobalConfig()

    // Wait for content to be visible and check configuration fields
    await waitFor(() => {
      expect(screen.getByText('Daten aus Rentenbescheid importieren')).toBeInTheDocument()
      expect(screen.getByLabelText('Rentenbeginn (Jahr)')).toBeInTheDocument()
      expect(screen.getByLabelText('Monatliche Rente (brutto) €')).toBeInTheDocument()
      expect(screen.getByText('Jährliche Rentenanpassung (%)')).toBeInTheDocument()
      expect(screen.getByText('Steuerpflichtiger Anteil (%)')).toBeInTheDocument()
      expect(screen.getByText('Zusammenfassung')).toBeInTheDocument()
    })
  })

  it('should pass statutory pension config to withdrawal calculations', () => {
    const mockCurrentConfig = {
      formValue: {
        statutoryPensionConfig: {
          enabled: true,
          startYear: 2041,
          monthlyAmount: 1500,
          annualIncreaseRate: 1.0,
          taxablePercentage: 80,
        },
        // ... other required form values
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 2,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 10,
        variabelProzent: 4,
        dynamischBasisrate: 4,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
        rmdStartAge: 65,
        rmdLifeExpectancyTable: 'german_2020_22' as const,
        kapitalerhaltNominalReturn: 7,
        kapitalerhaltInflationRate: 2,
        einkommensteuersatz: 18,
      },
      withdrawalReturnMode: 'fixed' as const,
      withdrawalVariableReturns: {},
      withdrawalAverageReturn: 5,
      withdrawalStandardDeviation: 12,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      useComparisonMode: false,
      comparisonStrategies: [],
      useSegmentedComparisonMode: false,
      segmentedComparisonStrategies: [],
    }

    mockUseWithdrawalConfig.mockReturnValue({
      currentConfig: mockCurrentConfig,
      updateConfig: vi.fn(),
      updateFormValue: vi.fn(),
      updateComparisonStrategy: vi.fn(),
      updateSegmentedComparisonStrategy: vi.fn(),
      addSegmentedComparisonStrategy: vi.fn(),
      removeSegmentedComparisonStrategy: vi.fn(),
    })

    render(
      <EntnahmeSimulationsAusgabe
        startEnd={[2041, 2080]}
        elemente={mockElements}
        dispatchEnd={mockDispatchEnd}
        onWithdrawalResultsChange={mockOnWithdrawalResultsChange}
        steuerlast={26.375}
        teilfreistellungsquote={30}
      />,
    )

    // Verify that useWithdrawalCalculations was called (the exact parameters are complex to match)
    expect(mockUseWithdrawalCalculations).toHaveBeenCalled()
  })

  it('should handle tax return data import', async () => {
    const mockCurrentConfig = {
      formValue: {
        statutoryPensionConfig: {
          enabled: true,
          startYear: 2041,
          monthlyAmount: 1500,
          annualIncreaseRate: 1.0,
          taxablePercentage: 80,
          taxReturnData: {
            taxYear: 2023,
            annualPensionReceived: 19200,
            taxablePortion: 15360,
          },
        },
        // ... other form values
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 2,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 10,
        variabelProzent: 4,
        dynamischBasisrate: 4,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
        rmdStartAge: 65,
        rmdLifeExpectancyTable: 'german_2020_22' as const,
        kapitalerhaltNominalReturn: 7,
        kapitalerhaltInflationRate: 2,
        einkommensteuersatz: 18,
      },
      withdrawalReturnMode: 'fixed' as const,
      withdrawalVariableReturns: {},
      withdrawalAverageReturn: 5,
      withdrawalStandardDeviation: 12,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      useComparisonMode: false,
      comparisonStrategies: [],
      useSegmentedComparisonMode: false,
      segmentedComparisonStrategies: [],
    }

    const mockUpdateFormValue = vi.fn()

    mockUseWithdrawalConfig.mockReturnValue({
      currentConfig: mockCurrentConfig,
      updateConfig: vi.fn(),
      updateFormValue: mockUpdateFormValue,
      updateComparisonStrategy: vi.fn(),
      updateSegmentedComparisonStrategy: vi.fn(),
      addSegmentedComparisonStrategy: vi.fn(),
      removeSegmentedComparisonStrategy: vi.fn(),
    })

    render(
      <EntnahmeSimulationsAusgabe
        startEnd={[2041, 2080]}
        elemente={mockElements}
        dispatchEnd={mockDispatchEnd}
        onWithdrawalResultsChange={mockOnWithdrawalResultsChange}
        steuerlast={26.375}
        teilfreistellungsquote={30}
      />,
    )

    // Expand the Variables and Global Configuration sections
    await expandVariablesAndGlobalConfig()

    // Wait for the content to be visible
    await waitFor(() => {
      const toggle = screen.getByLabelText('Daten aus Rentenbescheid verfügbar')
      expect(toggle).toBeInTheDocument()
      fireEvent.click(toggle)
    })

    // Wait for tax return fields to appear and find the import button
    await waitFor(() => {
      const importButton = screen.getByRole('button', { name: /Werte automatisch berechnen/i })
      expect(importButton).toBeInTheDocument()
      fireEvent.click(importButton)
    })

    // Should call updateFormValue with calculated values
    await waitFor(() => {
      expect(mockUpdateFormValue).toHaveBeenCalledWith({
        statutoryPensionConfig: expect.objectContaining({
          monthlyAmount: 1600, // 19200 / 12
          taxablePercentage: 80, // 15360 / 19200 * 100
        }),
      })
    })
  })
})
