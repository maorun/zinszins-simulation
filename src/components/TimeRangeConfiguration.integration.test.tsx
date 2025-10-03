/// <reference types="@testing-library/jest-dom" />
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SimulationProvider } from '../contexts/SimulationContext'
import TimeRangeConfiguration from './TimeRangeConfiguration'
import { useSimulation } from '../contexts/useSimulation'

// Create a test component that shows current startEnd values
const StartEndDisplay = () => {
  const { startEnd } = useSimulation()
  return (
    <div data-testid="start-end-display">
      Savings Phase:
      {' '}
      {startEnd[0]}
      {' '}
      - Withdrawal Phase:
      {' '}
      {startEnd[1]}
    </div>
  )
}

describe('TimeRangeConfiguration Integration', () => {
  it('should persist startEnd changes and trigger simulation updates', async () => {
    render(
      <SimulationProvider>
        <TimeRangeConfiguration />
        <StartEndDisplay />
      </SimulationProvider>,
    )

    // Check initial values
    const display = screen.getByTestId('start-end-display')
    expect(display).toHaveTextContent('Savings Phase: 2040')

    // Expand the configuration section
    const expandButton = screen.getAllByText(/Sparphase-Ende/)[0].closest('button')
    if (expandButton) {
      fireEvent.click(expandButton)
    }

    // Wait for the section to expand
    await waitFor(() => {
      expect(screen.getByText(/Jahr 2040/)).toBeInTheDocument()
    })

    // Find all buttons and identify the plus button (second button with SVG)
    const buttons = screen.getAllByRole('button')
    const yearButtons = buttons.filter(button =>
      button.querySelector('svg') && !button.closest('[role="tablist"]'),
    )

    // The plus button should be the second one (after minus button)
    const plusButton = yearButtons[1]
    expect(plusButton).toBeTruthy()

    // Click the plus button to increase the year
    fireEvent.click(plusButton)

    // Wait for the state to update and check if the change persisted
    await waitFor(() => {
      const updatedDisplay = screen.getByTestId('start-end-display')
      expect(updatedDisplay).toHaveTextContent('Savings Phase: 2041')
    }, { timeout: 1000 })

    // Verify the UI also updated
    expect(screen.getByText(/Jahr 2041/)).toBeInTheDocument()
  })

  it('should trigger simulation when startEnd changes', async () => {
    let simulationCallCount = 0
    const TestWrapper = () => {
      const { startEnd } = useSimulation()

      // Track simulation calls by monitoring startEnd changes
      React.useEffect(() => {
        simulationCallCount++
      }, [startEnd])

      return (
        <div>
          <TimeRangeConfiguration />
          <div data-testid="simulation-calls">
            Calls:
            {' '}
            {simulationCallCount}
          </div>
        </div>
      )
    }

    render(
      <SimulationProvider>
        <TestWrapper />
      </SimulationProvider>,
    )

    const initialCalls = simulationCallCount

    // Expand and click plus button
    const expandButton = screen.getAllByText(/Sparphase-Ende/)[0].closest('button')
    if (expandButton) {
      fireEvent.click(expandButton)
    }

    await waitFor(() => {
      expect(screen.getByText(/Jahr 2040/)).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const yearButtons = buttons.filter(button =>
      button.querySelector('svg') && !button.closest('[role="tablist"]'),
    )
    const plusButton = yearButtons[1]

    fireEvent.click(plusButton)

    // Wait and verify simulation was triggered
    await waitFor(() => {
      expect(simulationCallCount).toBeGreaterThan(initialCalls)
    }, { timeout: 1000 })
  })
})
