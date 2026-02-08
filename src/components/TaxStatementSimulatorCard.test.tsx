/**
 * Tests for TaxStatementSimulatorCard component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaxStatementSimulatorCard } from './TaxStatementSimulatorCard'
import { SimulationProvider } from '../contexts/SimulationContext'

// Mock useSimulation hook with proper return value
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
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
  }),
}))

describe('TaxStatementSimulatorCard', () => {
  const renderComponent = () => {
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

    it('should render without crashing when simulation data is available', () => {
      const { container } = renderComponent()
      expect(container).toBeInTheDocument()
    })
  })
})
