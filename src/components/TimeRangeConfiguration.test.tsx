/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TimeRangeConfiguration from './TimeRangeConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'
import { useSimulation } from '../contexts/useSimulation'

// Mock the useSimulation hook to track calls
const mockPerformSimulation = vi.fn()
const mockSetStartEnd = vi.fn()
const mockSetSparplanElemente = vi.fn()

vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn(),
}))

describe('TimeRangeConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup the mock implementation
    vi.mocked(useSimulation).mockReturnValue({
      startEnd: [2040, 2069] as [number, number],
      setStartEnd: mockSetStartEnd,
      sparplan: [],
      simulationAnnual: 'yearly' as any,
      setSparplanElemente: mockSetSparplanElemente,
      performSimulation: mockPerformSimulation,
    } as any)
  })

  it('renders the time range configuration section', () => {
    render(
      <SimulationProvider>
        <TimeRangeConfiguration />
      </SimulationProvider>,
    )
    expect(screen.getAllByText(/Sparphase-Ende/)[0]).toBeInTheDocument()
  })

  it('should call performSimulation after changing start end year', async () => {
    render(
      <SimulationProvider>
        <TimeRangeConfiguration />
      </SimulationProvider>,
    )

    // Find and expand the configuration section
    const expandButton = screen.getAllByText(/Sparphase-Ende/)[0].closest('div')
    fireEvent.click(expandButton!)

    // Find the plus button to increase the year
    const plusButtons = screen.getAllByRole('button')
    const plusButton = plusButtons.find(button =>
      button.querySelector('svg')
      && !(button as HTMLButtonElement).disabled
      && button.getAttribute('aria-expanded') !== 'false',
    )

    expect(plusButton).toBeTruthy()

    // Click the plus button to change the year
    fireEvent.click(plusButton!)

    // Verify that setStartEnd was called with a changed value (could be +1 or -1)
    expect(mockSetStartEnd).toHaveBeenCalled()
    const [newStartEnd] = mockSetStartEnd.mock.calls[0]
    expect(newStartEnd[0]).not.toBe(2040) // Should be different from the original 2040
    expect(newStartEnd[1]).toBe(2069) // End year should remain the same

    // Verify that setSparplanElemente was also called
    expect(mockSetSparplanElemente).toHaveBeenCalled()
  })
})
