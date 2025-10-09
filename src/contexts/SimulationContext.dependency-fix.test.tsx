/// <reference types="@testing-library/jest-dom" />
import React from 'react'
import { render, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SimulationProvider } from './SimulationContext'
import { useSimulation } from './useSimulation'

// Test component to track startEnd state changes
const StartEndTracker = ({ onStartEndChange }: { onStartEndChange: (startEnd: [number, number]) => void }) => {
  const { startEnd, setStartEnd, endOfLife } = useSimulation()

  React.useEffect(() => {
    onStartEndChange(startEnd)
  }, [startEnd, onStartEndChange])

  return (
    <div>
      <div data-testid="start-end">
        {startEnd[0]}
        -
        {startEnd[1]}
      </div>
      <div data-testid="end-of-life">{endOfLife}</div>
      <button
        data-testid="change-start-end"
        onClick={() => setStartEnd([startEnd[0] + 1, startEnd[1]])}
      >
        Change Start End
      </button>
    </div>
  )
}

describe('SimulationContext Dependency Fix', () => {
  it('should not override manual startEnd changes when endOfLife synchronization runs', async () => {
    const startEndChanges: Array<[number, number]> = []

    const { getByTestId } = render(
      <SimulationProvider>
        <StartEndTracker onStartEndChange={startEnd => startEndChanges.push(startEnd)} />
      </SimulationProvider>,
    )

    // Wait for initial render and clear initial state changes
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    const initialChangesLength = startEndChanges.length
    const initialStartEnd = startEndChanges[startEndChanges.length - 1]

    expect(getByTestId('start-end')).toHaveTextContent(`${initialStartEnd[0]}-${initialStartEnd[1]}`)

    // Manually change startEnd[0] (savings phase end)
    await act(async () => {
      getByTestId('change-start-end').click()
    })

    // Give time for any effects to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20))
    })

    // Verify the change persisted and wasn't overridden
    const finalStartEnd = startEndChanges[startEndChanges.length - 1]
    expect(finalStartEnd[0]).toBe(initialStartEnd[0] + 1)
    expect(finalStartEnd[1]).toBe(initialStartEnd[1]) // End year should remain the same
    expect(getByTestId('start-end')).toHaveTextContent(`${finalStartEnd[0]}-${finalStartEnd[1]}`)

    // Should have had at least one new change (the manual change)
    expect(startEndChanges.length).toBeGreaterThan(initialChangesLength)
  })

  it('should still synchronize startEnd[1] with endOfLife changes', async () => {
    const startEndChanges: Array<[number, number]> = []

    const TestComponent = () => {
      const { startEnd, setEndOfLife, endOfLife } = useSimulation()

      React.useEffect(() => {
        startEndChanges.push(startEnd)
      }, [startEnd])

      return (
        <div>
          <div data-testid="start-end">
            {startEnd[0]}
            -
            {startEnd[1]}
          </div>
          <div data-testid="end-of-life">{endOfLife}</div>
          <button
            data-testid="change-end-of-life"
            onClick={() => setEndOfLife(endOfLife + 5)}
          >
            Change End Of Life
          </button>
        </div>
      )
    }

    const { getByTestId } = render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>,
    )

    // Wait for initial render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    const initialStartEnd = startEndChanges[startEndChanges.length - 1]
    const initialEndOfLife = parseInt(getByTestId('end-of-life').textContent || '0')

    // Change endOfLife
    await act(async () => {
      getByTestId('change-end-of-life').click()
    })

    // Give time for synchronization effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20))
    })

    // Verify that startEnd[1] was synchronized with the new endOfLife
    const finalStartEnd = startEndChanges[startEndChanges.length - 1]
    expect(finalStartEnd[0]).toBe(initialStartEnd[0]) // Start year should remain the same
    expect(finalStartEnd[1]).toBe(initialEndOfLife + 5) // End year should match new endOfLife
    expect(getByTestId('start-end')).toHaveTextContent(`${finalStartEnd[0]}-${finalStartEnd[1]}`)
  })
})
