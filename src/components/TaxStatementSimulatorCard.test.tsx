/**
 * Tests for TaxStatementSimulatorCard component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaxStatementSimulatorCard } from './TaxStatementSimulatorCard'
import { SimulationProvider } from '../contexts/SimulationContext'

// Mock useSimulation hook
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn(),
}))

describe('TaxStatementSimulatorCard', () => {
  const mockUseSimulation = () => {
    const { useSimulation } = require('../contexts/useSimulation')
    useSimulation.mockReturnValue({
      simulationData: {
        sparplanElements: [
          {
            type: 'sparplan',
            start: '2024-01-01',
            einzahlung: 1000,
            simulation: {
              2024: {
                startkapital: 100000,
                zinsen: 5000,
                endkapital: 105000,
                bezahlteSteuer: 789.375,
                genutzterFreibetrag: 1000,
                vorabpauschale: 245.5,
                vorabpauschaleAccumulated: 245.5,
              },
              2025: {
                startkapital: 105000,
                zinsen: 5250,
                endkapital: 110250,
                bezahlteSteuer: 855.46875,
                genutzterFreibetrag: 1000,
                vorabpauschale: 257.775,
                vorabpauschaleAccumulated: 503.275,
              },
            },
          },
        ],
      },
      steuerlast: 0.26375,
      teilfreistellungsquote: 0.3,
      kirchensteuerAktiv: false,
      kirchensteuersatz: 0,
      freibetragPerYear: { 2024: 1000, 2025: 1000 },
    })
  }

  const renderComponent = () => {
    mockUseSimulation()
    return render(
      <SimulationProvider>
        <TaxStatementSimulatorCard />
      </SimulationProvider>,
    )
  }

  describe('Component Rendering', () => {
    it('should render card header with title', () => {
      renderComponent()

      expect(screen.getByText(/Steuerbescheinigung-Simulator/)).toBeInTheDocument()
    })

    it('should show year input field', () => {
      renderComponent()

      expect(screen.getByText('Jahr auswählen:')).toBeInTheDocument()
      const input = screen.getByRole('spinbutton')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Tax Statement Display', () => {
    it('should display capital summary section', () => {
      renderComponent()

      expect(screen.getByText(/Kapitalübersicht/)).toBeInTheDocument()
      expect(screen.getByText('Anfangskapital:')).toBeInTheDocument()
      expect(screen.getByText('Endkapital:')).toBeInTheDocument()
    })

    it('should display tax calculation section', () => {
      renderComponent()

      expect(screen.getByText(/Steuerberechnung/)).toBeInTheDocument()
      expect(screen.getByText('Genutzter Freibetrag:')).toBeInTheDocument()
      expect(screen.getByText('Verbleibender Freibetrag:')).toBeInTheDocument()
    })

    it('should display tax paid section', () => {
      renderComponent()

      expect(screen.getByText(/Gezahlte Steuern/)).toBeInTheDocument()
      expect(screen.getByText(/Kapitalertragsteuer/)).toBeInTheDocument()
    })

    it('should show Vorabpauschale when present', () => {
      renderComponent()

      expect(screen.getByText('Vorabpauschale:')).toBeInTheDocument()
    })
  })

  describe('Year Selection', () => {
    it('should allow entering a year in the input field', async () => {
      renderComponent()

      const input = screen.getByRole('spinbutton') as HTMLInputElement
      expect(input).toBeInTheDocument()

      await userEvent.clear(input)
      await userEvent.type(input, '2024')

      expect(input.value).toBe('2024')
    })
  })

  describe('Church Tax Display', () => {
    it('should not show church tax section by default', () => {
      renderComponent()

      // Church tax should not be in the paid taxes section by default
      expect(screen.queryByText(/Kirchensteuer:/)).not.toBeInTheDocument()
    })
  })

  describe('Loss Carryforward Display', () => {
    it('should not show loss section when no losses exist', () => {
      renderComponent()

      expect(screen.queryByText(/Verlusttöpfe/)).not.toBeInTheDocument()
    })
  })

  describe('Export Functionality', () => {
    it('should show export button', () => {
      renderComponent()

      const exportButton = screen.getByText(/Steuerbescheinigung exportieren/)
      expect(exportButton).toBeInTheDocument()
    })
  })

  describe('Info and Disclaimer', () => {
    it('should show info box explaining the feature', () => {
      renderComponent()

      expect(screen.getByText(/Steuerbescheinigung-Simulator:/)).toBeInTheDocument()
    })

    it('should show legal disclaimer', () => {
      renderComponent()

      expect(screen.getByText(/Hinweis:/)).toBeInTheDocument()
      expect(screen.getByText(/Diese Steuerbescheinigung ist eine Simulation/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible form elements', () => {
      renderComponent()

      const yearInput = screen.getByRole('spinbutton')
      expect(yearInput).toHaveAccessibleName('Jahr auswählen:')
    })

    it('should have accessible buttons', () => {
      renderComponent()

      const exportButton = screen.getByRole('button', { name: /Steuerbescheinigung exportieren/ })
      expect(exportButton).toBeInTheDocument()
    })
  })
})
