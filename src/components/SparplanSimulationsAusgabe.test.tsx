import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe'
import type { SparplanElement } from '../utils/sparplan-utils'
import * as useSimulation from '../contexts/useSimulation'

// Mock the other components
vi.mock('./VorabpauschaleExplanationModal', () => ({
  default: () => <div data-testid="vorabpauschale-modal">Mocked Modal</div>,
}))

vi.mock('./CalculationExplanationModal', () => ({
  default: () => <div data-testid="calculation-modal">Mocked Modal</div>,
}))

describe('SparplanSimulationsAusgabe', () => {
  let useSimulationSpy: any

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    useSimulationSpy = vi.spyOn(useSimulation, 'useSimulation')
  })

  afterEach(() => {
    useSimulationSpy.mockRestore()
  })

  describe('inflation display in gesamtmenge mode', () => {
    it('should show both nominal and real values when inflation is active in gesamtmenge mode', () => {
      // Mock simulation context for gesamtmenge inflation mode
      useSimulationSpy.mockReturnValue({
        inflationAktivSparphase: true,
        inflationAnwendungSparphase: 'gesamtmenge',
        inflationsrateSparphase: 2,
      })

      // Create test data with both nominal and real values
      const testElements: SparplanElement[] = [
        {
          start: '2023-01-01',
          einzahlung: 10000,
          type: 'sparplan',
          simulation: {
            2023: {
              startkapital: 10000,
              endkapital: 10500, // 5% return
              endkapitalReal: 10294.12, // Real value after 2% inflation
              zinsen: 500,
              zinsenReal: 490.20, // Real interest after inflation
              bezahlteSteuer: 0,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
            2024: {
              startkapital: 20500,
              endkapital: 21525, // After second year
              endkapitalReal: 20694.69, // Real value after 2 years of inflation
              zinsen: 1025,
              zinsenReal: 985.93, // Real interest after inflation
              bezahlteSteuer: 0,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
          },
        },
      ]

      render(<SparplanSimulationsAusgabe elemente={testElements} />)

      // Check that inflation explanation is shown
      expect(screen.getByText(/💰 Inflation berücksichtigt:/)).toBeInTheDocument()
      expect(screen.getByText(/Die "Kaufkraft"-Werte zeigen die reale Kaufkraft nach 2% jährlicher Inflation/)).toBeInTheDocument()

      // Check that both nominal and real values are displayed for endkapital
      expect(screen.getByText('21.525,00 €')).toBeInTheDocument() // Nominal value
      expect(screen.getByText('(nominal)')).toBeInTheDocument()
      expect(screen.getByText(/Kaufkraft: 20.694,69 €/)).toBeInTheDocument() // Real value
      expect(screen.getByText('(2% Inflation)')).toBeInTheDocument()

      // Check that both nominal and real values are displayed for interest
      expect(screen.getByText('1.025,00 €')).toBeInTheDocument() // Nominal interest
      expect(screen.getByText(/Kaufkraft: 985,93 €/)).toBeInTheDocument() // Real interest

      // Check summary section shows both values
      expect(screen.getByText(/💡 Die Kaufkraft-Werte zeigen die reale Kaufkraft nach 2% jährlicher Inflation/)).toBeInTheDocument()
    })

    it('should NOT show real values when inflation is disabled', () => {
      // Mock simulation context with inflation disabled
      useSimulationSpy.mockReturnValue({
        inflationAktivSparphase: false,
        inflationAnwendungSparphase: 'gesamtmenge',
        inflationsrateSparphase: 2,
      })

      const testElements: SparplanElement[] = [
        {
          start: '2023-01-01',
          einzahlung: 10000,
          type: 'sparplan',
          simulation: {
            2023: {
              startkapital: 10000,
              endkapital: 10500,
              zinsen: 500,
              bezahlteSteuer: 0,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
          },
        },
      ]

      render(<SparplanSimulationsAusgabe elemente={testElements} />)

      // Should NOT show inflation-related text
      expect(screen.queryByText(/💰 Inflation berücksichtigt:/)).not.toBeInTheDocument()
      expect(screen.queryByText('(nominal)')).not.toBeInTheDocument()
      expect(screen.queryByText(/Kaufkraft:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/jährlicher Inflation/)).not.toBeInTheDocument()

      // Should only show nominal values
      expect(screen.getByText('10.500,00 €')).toBeInTheDocument()
      expect(screen.getByText('500,00 €')).toBeInTheDocument()
    })

    it('should NOT show real values when inflation is active but in sparplan mode', () => {
      // Mock simulation context for sparplan inflation mode
      useSimulationSpy.mockReturnValue({
        inflationAktivSparphase: true,
        inflationAnwendungSparphase: 'sparplan',
        inflationsrateSparphase: 2,
      })

      const testElements: SparplanElement[] = [
        {
          start: '2023-01-01',
          einzahlung: 10000,
          type: 'sparplan',
          simulation: {
            2023: {
              startkapital: 10000,
              endkapital: 10500,
              zinsen: 500,
              bezahlteSteuer: 0,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
          },
        },
      ]

      render(<SparplanSimulationsAusgabe elemente={testElements} />)

      // Should NOT show real values in sparplan mode (inflation is applied differently)
      expect(screen.queryByText(/💰 Inflation berücksichtigt:/)).not.toBeInTheDocument()
      expect(screen.queryByText('(nominal)')).not.toBeInTheDocument()
      expect(screen.queryByText(/Kaufkraft:/)).not.toBeInTheDocument()

      // Should only show nominal values
      expect(screen.getByText('10.500,00 €')).toBeInTheDocument()
      expect(screen.getByText('500,00 €')).toBeInTheDocument()
    })

    it('should handle missing real values gracefully', () => {
      // Mock simulation context for gesamtmenge inflation mode
      useSimulationSpy.mockReturnValue({
        inflationAktivSparphase: true,
        inflationAnwendungSparphase: 'gesamtmenge',
        inflationsrateSparphase: 2,
      })

      // Test data without real values (shouldn't happen in practice but good to test)
      const testElements: SparplanElement[] = [
        {
          start: '2023-01-01',
          einzahlung: 10000,
          type: 'sparplan',
          simulation: {
            2023: {
              startkapital: 10000,
              endkapital: 10500,
              zinsen: 500,
              bezahlteSteuer: 0,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
              // No endkapitalReal or zinsenReal
            },
          },
        },
      ]

      render(<SparplanSimulationsAusgabe elemente={testElements} />)

      // Should show inflation explanation
      expect(screen.getByText(/💰 Inflation berücksichtigt:/)).toBeInTheDocument()

      // Should show nominal values
      expect(screen.getByText('10.500,00 €')).toBeInTheDocument()
      expect(screen.getByText('(nominal)')).toBeInTheDocument()

      // Should NOT crash but also not show real values
      expect(screen.queryByText(/Kaufkraft: 10.294,12 €/)).not.toBeInTheDocument()
    })

    it('should display correct inflation rate in explanations', () => {
      // Mock simulation context with 3% inflation
      useSimulationSpy.mockReturnValue({
        inflationAktivSparphase: true,
        inflationAnwendungSparphase: 'gesamtmenge',
        inflationsrateSparphase: 3,
      })

      const testElements: SparplanElement[] = [
        {
          start: '2023-01-01',
          einzahlung: 10000,
          type: 'sparplan',
          simulation: {
            2023: {
              startkapital: 10000,
              endkapital: 10500,
              endkapitalReal: 10194.17,
              zinsen: 500,
              zinsenReal: 485.44,
              bezahlteSteuer: 0,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
          },
        },
      ]

      render(<SparplanSimulationsAusgabe elemente={testElements} />)

      // Check that the correct inflation rate is displayed
      expect(screen.getByText(/nach 3% jährlicher Inflation/)).toBeInTheDocument()
      expect(screen.getByText('(3% Inflation)')).toBeInTheDocument()
    })
  })

  describe('component behavior without elements', () => {
    it('should render without crashing when no elements provided', () => {
      useSimulationSpy.mockReturnValue({
        inflationAktivSparphase: false,
        inflationAnwendungSparphase: 'sparplan',
        inflationsrateSparphase: 2,
      })

      render(<SparplanSimulationsAusgabe elemente={undefined} />)

      // Should not crash and should show empty state or basic structure
      expect(screen.getByText('📊 Gesamtübersicht')).toBeInTheDocument()
    })

    it('should render without crashing when empty elements array provided', () => {
      useSimulationSpy.mockReturnValue({
        inflationAktivSparphase: false,
        inflationAnwendungSparphase: 'sparplan',
        inflationsrateSparphase: 2,
      })

      render(<SparplanSimulationsAusgabe elemente={[]} />)

      // Should not crash and should show empty state or basic structure
      expect(screen.getByText('📊 Gesamtübersicht')).toBeInTheDocument()
    })
  })
})
