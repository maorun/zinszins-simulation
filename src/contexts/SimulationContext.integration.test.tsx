/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { SimulationProvider } from '../contexts/SimulationContext'
import { useSimulation } from '../contexts/useSimulation'
import { useEffect } from 'react'
import type { SimulationContextTestData } from '../test-utils/types'

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

// Test component to access simulation context
const TestContextComponent = ({ onContextData }: { onContextData: (data: unknown) => void }) => {
  const simulationContext = useSimulation()

  useEffect(() => {
    onContextData(simulationContext)
  }, [simulationContext, onContextData])

  return (
    <div data-testid="test-context">
      <div data-testid="start-year">{simulationContext.startEnd[0]}</div>
      <div data-testid="end-year">{simulationContext.startEnd[1]}</div>
      <div data-testid="rendite">{simulationContext.rendite}</div>
      <div data-testid="steuerlast">{simulationContext.steuerlast}</div>
      <div data-testid="simulation-annual">{simulationContext.simulationAnnual}</div>
      <div data-testid="elements-count">{simulationContext.simulationData?.sparplanElements?.length || 0}</div>
    </div>
  )
}

describe('Cross-Component State Management Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides consistent simulation context across components', async () => {
    let contextData: unknown = null

    render(
      <SimulationProvider>
        <TestContextComponent
          onContextData={data => {
            contextData = data
          }}
        />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(contextData).toBeTruthy()
        expect((contextData as SimulationContextTestData).startEnd).toBeDefined()
        expect((contextData as SimulationContextTestData).rendite).toBeDefined()
        expect((contextData as SimulationContextTestData).steuerlast).toBeDefined()
        expect((contextData as SimulationContextTestData).simulationAnnual).toBeDefined()
      },
      { timeout: 2000 },
    )

    // Check default values are reasonable
    const data = contextData as SimulationContextTestData
    expect(data.startEnd).toHaveLength(2)
    expect(data.startEnd[0]).toBeGreaterThan(2020)
    expect(data.startEnd[1]).toBeGreaterThan(data.startEnd[0])
    expect(data.rendite).toBeGreaterThan(0)
    expect(data.steuerlast).toBeGreaterThan(0)
  })

  it('maintains state consistency across context updates', async () => {
    let contextData: unknown = null

    render(
      <SimulationProvider>
        <TestContextComponent
          onContextData={data => {
            contextData = data
          }}
        />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(contextData).toBeTruthy()
      },
      { timeout: 2000 },
    )

    const data = contextData as SimulationContextTestData
    const initialStartYear = data.startEnd[0]
    const initialEndYear = data.startEnd[1]
    const initialRendite = data.rendite

    // Values should be stable and meaningful
    expect(initialStartYear).toBeGreaterThan(2020)
    expect(initialEndYear).toBeGreaterThan(initialStartYear)
    expect(initialRendite).toBeGreaterThan(0)
    expect(initialRendite).toBeLessThan(100) // Assuming rendite is in percentage form
  })

  it('handles simulation data updates correctly', async () => {
    let contextData: unknown = null

    render(
      <SimulationProvider>
        <TestContextComponent
          onContextData={data => {
            contextData = data
          }}
        />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(contextData).toBeTruthy()
      },
      { timeout: 3000 },
    )

    // Should have simulation data structure (might be null initially)
    expect(contextData).toHaveProperty('simulationData')
    const data = contextData as SimulationContextTestData
    if (data.simulationData && typeof data.simulationData === 'object') {
      expect(data.simulationData).toHaveProperty('sparplanElements')
      const simData = data.simulationData as { sparplanElements?: unknown[] }
      if (simData.sparplanElements) {
        expect(Array.isArray(simData.sparplanElements)).toBe(true)
      }
    }
  })

  it('provides simulation context values in expected formats', async () => {
    render(
      <SimulationProvider>
        <TestContextComponent onContextData={() => {}} />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(screen.getByTestId('test-context')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )

    // Check that displayed values are in expected formats
    const startYear = screen.getByTestId('start-year').textContent
    const endYear = screen.getByTestId('end-year').textContent
    const rendite = screen.getByTestId('rendite').textContent
    const steuerlast = screen.getByTestId('steuerlast').textContent
    const simulationAnnual = screen.getByTestId('simulation-annual').textContent

    expect(startYear).toMatch(/202\d|204\d/) // Should be a year in 2020s or 2040s
    expect(endYear).toMatch(/202\d|204\d|208\d/) // Should be a year in 2020s, 2040s, or 2080s
    expect(Number(startYear)).toBeLessThan(Number(endYear))

    // Rendite should be a positive number
    expect(Number(rendite)).toBeGreaterThan(0)

    // Steuerlast should be a positive number (tax rate)
    expect(Number(steuerlast)).toBeGreaterThan(0)

    // Simulation annual should be one of the expected values
    expect(['yearly', 'monthly']).toContain(simulationAnnual)
  })

  it('handles context state changes without memory leaks', async () => {
    let renderCount = 0
    const TestComponent = () => {
      useSimulation()
      renderCount++

      return <div data-testid="render-count">{renderCount}</div>
    }

    render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(screen.getByTestId('render-count')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )

    // Should not have excessive re-renders
    expect(renderCount).toBeLessThan(10)
  })

  it('provides required simulation methods and data', async () => {
    let contextData: unknown = null

    render(
      <SimulationProvider>
        <TestContextComponent
          onContextData={data => {
            contextData = data
          }}
        />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(contextData).toBeTruthy()
      },
      { timeout: 2000 },
    )

    const data = contextData as SimulationContextTestData
    // Check that required methods exist
    expect(typeof data.performSimulation).toBe('function')
    expect(typeof data.setSparplanElemente).toBe('function')

    // Check that required data properties exist
    expect(contextData).toHaveProperty('startEnd')
    expect(contextData).toHaveProperty('rendite')
    expect(contextData).toHaveProperty('steuerlast')
    expect(contextData).toHaveProperty('simulationAnnual')
    expect(contextData).toHaveProperty('simulationData')
    expect(contextData).toHaveProperty('isLoading')
  })

  it('handles default configuration loading', async () => {
    let contextData: unknown = null

    render(
      <SimulationProvider>
        <TestContextComponent
          onContextData={data => {
            contextData = data
          }}
        />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(contextData).toBeTruthy()
      },
      { timeout: 2000 },
    )

    const data = contextData as SimulationContextTestData
    // Should load with reasonable defaults
    // Default: startEnd [2040, 2080], 5% return, 26.375% tax
    expect(data.startEnd[0]).toBeGreaterThanOrEqual(2040)
    expect(data.startEnd[1]).toBeGreaterThan(data.startEnd[0])

    // Default return should be around 5% (in percentage form)
    expect(data.rendite).toBeCloseTo(5, 1)

    // Default tax rate should be around 26.375%
    expect(data.steuerlast).toBeCloseTo(26.375, 1)
  })

  it('maintains context consistency during component lifecycle', async () => {
    let contextData: unknown = null

    const { rerender } = render(
      <SimulationProvider>
        <TestContextComponent
          onContextData={data => {
            contextData = data
          }}
        />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(contextData).toBeTruthy()
      },
      { timeout: 2000 },
    )

    const initialData = { ...(contextData as SimulationContextTestData) }

    // Rerender component
    rerender(
      <SimulationProvider>
        <TestContextComponent
          onContextData={data => {
            contextData = data
          }}
        />
      </SimulationProvider>,
    )

    await waitFor(
      () => {
        expect(contextData).toBeTruthy()
      },
      { timeout: 1000 },
    )

    const currentData = contextData as SimulationContextTestData
    // Core values should remain consistent across rerenders
    expect(currentData.startEnd[0]).toBe(initialData.startEnd[0])
    expect(currentData.startEnd[1]).toBe(initialData.startEnd[1])
    expect(currentData.rendite).toBe(initialData.rendite)
    expect(currentData.steuerlast).toBe(initialData.steuerlast)
  })
})
