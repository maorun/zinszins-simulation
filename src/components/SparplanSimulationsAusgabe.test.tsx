import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe'
import type { SparplanElement } from '../utils/sparplan-utils'

// Mock the simulation context
const mockUseSimulation = vi.fn()
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => mockUseSimulation(),
}))

describe('SparplanSimulationsAusgabe', () => {
  beforeEach(() => {
    mockUseSimulation.mockReturnValue({
      inflationAktivSparphase: false,
      inflationAnwendungSparphase: 'sparplan',
      inflationsrateSparphase: 2,
    })
  })

  describe('component behavior without elements', () => {
    it('should render without crashing when no elements provided', () => {
      render(<SparplanSimulationsAusgabe elemente={undefined} />)

      // Component should render without crashing
      expect(screen.getByText('📈 Sparplan-Verlauf')).toBeInTheDocument()
    })

    it('should render without crashing when empty elements array provided', () => {
      render(<SparplanSimulationsAusgabe elemente={[]} />)

      // Component should render without crashing
      expect(screen.getByText('📈 Sparplan-Verlauf')).toBeInTheDocument()
    })
  })

  describe('component behavior with elements', () => {
    it('should render successfully with inflation-adjusted data', () => {
      const testElements: SparplanElement[] = [
        {
          start: '2023-01-01',
          einzahlung: 10000,
          type: 'sparplan',
          simulation: {
            2023: {
              startkapital: 10000,
              endkapital: 10290, // 5% return then 2% inflation reduction: 10000 * 1.05 * 0.98
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

      // The component should render successfully with inflation-adjusted values
      expect(screen.getByText('📈 Sparplan-Verlauf')).toBeInTheDocument()
    })
  })
})
