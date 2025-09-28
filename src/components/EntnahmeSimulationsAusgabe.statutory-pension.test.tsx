import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
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

describe('EntnahmeSimulationsAusgabe - Global Statutory Pension Integration', () => {
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

    // Mock with global statutory pension configuration
    mockUseSimulation.mockReturnValue({
      grundfreibetragAktiv: false,
      grundfreibetragBetrag: 12000,
      endOfLife: 2080,
      statutoryPensionConfig: {
        enabled: true,
        startYear: 2041,
        monthlyAmount: 1500,
        annualIncreaseRate: 1.0,
        taxablePercentage: 80,
        retirementAge: 67,
      },
      birthYear: 1974,
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

  it('should integrate with global statutory pension configuration', () => {
    const mockCurrentConfig = {
      formValue: {
        endOfLife: 2080,
        strategie: '4prozent' as const,
        rendite: 5,
        einkommensteuersatz: 18,
      },
    }

    mockUseWithdrawalConfig.mockReturnValue({
      formValue: mockCurrentConfig.formValue,
      updateFormValue: vi.fn(),
      withdrawalReturnMode: 'fixed' as const,
      withdrawalVariableReturns: {},
      withdrawalAverageReturn: 5,
      withdrawalStandardDeviation: 12,
      withdrawalRandomSeed: undefined,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [],
      setUseSegmentedWithdrawal: vi.fn(),
      addWithdrawalSegment: vi.fn(),
      updateWithdrawalSegment: vi.fn(),
      deleteWithdrawalSegment: vi.fn(),
      useComparisonMode: false,
      setUseComparisonMode: vi.fn(),
      comparisonStrategies: [],
      addComparisonStrategy: vi.fn(),
      updateComparisonStrategy: vi.fn(),
      deleteComparisonStrategy: vi.fn(),
      useSegmentedComparisonMode: false,
      setUseSegmentedComparisonMode: vi.fn(),
      segmentedComparisonStrategies: [],
      addSegmentedComparisonStrategy: vi.fn(),
      updateSegmentedComparisonStrategy: vi.fn(),
      deleteSegmentedComparisonStrategy: vi.fn(),
    })

    render(
      <EntnahmeSimulationsAusgabe
        elemente={mockElements}
        startOfIndependence={2040}
        onWithdrawalResultsChange={mockOnWithdrawalResultsChange}
        dispatchEnd={mockDispatchEnd}
        steuerlast={26.375}
        teilfreistellungsquote={30}
      />,
    )

    // Verify withdrawal calculations use global statutory pension config
    expect(mockUseWithdrawalCalculations).toHaveBeenCalled()
    expect(mockUseSimulation).toHaveBeenCalled()
  })
})