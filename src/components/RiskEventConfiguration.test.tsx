import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskEventConfiguration } from './RiskEventConfiguration'

// Define proper prop types for mocked components
interface MockBlackSwanProps {
  simulationStartYear: number
  onEventChange?: (eventReturns: Record<number, number> | null, eventName?: string) => void
}

interface MockInflationScenarioProps {
  simulationStartYear: number
  onScenarioChange?: (
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string,
  ) => void
}

// Mock the sub-components
vi.mock('./BlackSwanEventConfiguration', () => ({
  default: ({ simulationStartYear, onEventChange }: MockBlackSwanProps) => (
    <div data-testid="black-swan-config">
      Black Swan Config - Start Year: {simulationStartYear}
      <button onClick={() => onEventChange?.({ 2020: -0.3 }, 'Test Event')}>Trigger Event</button>
    </div>
  ),
}))

vi.mock('./InflationScenarioConfiguration', () => ({
  default: ({ simulationStartYear, onScenarioChange }: MockInflationScenarioProps) => (
    <div data-testid="inflation-config">
      Inflation Config - Start Year: {simulationStartYear}
      <button onClick={() => onScenarioChange?.({ 2020: 0.05 }, { 2020: -0.02 }, 'High Inflation')}>
        Trigger Scenario
      </button>
    </div>
  ),
}))

describe('RiskEventConfiguration', () => {
  test('renders both Black Swan and Inflation configuration components', () => {
    const mockBlackSwanChange = vi.fn()
    const mockInflationChange = vi.fn()

    render(
      <RiskEventConfiguration
        simulationStartYear={2025}
        onBlackSwanChange={mockBlackSwanChange}
        onInflationScenarioChange={mockInflationChange}
      />,
    )

    expect(screen.getByTestId('black-swan-config')).toBeInTheDocument()
    expect(screen.getByTestId('inflation-config')).toBeInTheDocument()
    expect(screen.getByText(/Black Swan Config - Start Year: 2025/)).toBeInTheDocument()
    expect(screen.getByText(/Inflation Config - Start Year: 2025/)).toBeInTheDocument()
  })

  test('passes correct simulationStartYear to child components', () => {
    const mockBlackSwanChange = vi.fn()
    const mockInflationChange = vi.fn()

    render(
      <RiskEventConfiguration
        simulationStartYear={2030}
        onBlackSwanChange={mockBlackSwanChange}
        onInflationScenarioChange={mockInflationChange}
      />,
    )

    // Both components should show the year
    expect(screen.getAllByText(/Start Year: 2030/i)).toHaveLength(2)
  })

  test('passes callbacks to child components correctly', () => {
    const mockBlackSwanChange = vi.fn()
    const mockInflationChange = vi.fn()

    render(
      <RiskEventConfiguration
        simulationStartYear={2025}
        onBlackSwanChange={mockBlackSwanChange}
        onInflationScenarioChange={mockInflationChange}
      />,
    )

    // Trigger the Black Swan event
    const blackSwanButton = screen.getByText('Trigger Event')
    blackSwanButton.click()
    expect(mockBlackSwanChange).toHaveBeenCalledWith({ 2020: -0.3 }, 'Test Event')

    // Trigger the Inflation scenario
    const inflationButton = screen.getByText('Trigger Scenario')
    inflationButton.click()
    expect(mockInflationChange).toHaveBeenCalledWith({ 2020: 0.05 }, { 2020: -0.02 }, 'High Inflation')
  })
})
