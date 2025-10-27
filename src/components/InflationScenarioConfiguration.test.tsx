import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InflationScenarioConfiguration from './InflationScenarioConfiguration'

describe('InflationScenarioConfiguration', () => {
  const mockOnScenarioChange = vi.fn()
  const defaultProps = {
    onScenarioChange: mockOnScenarioChange,
    simulationStartYear: 2025,
  }

  beforeEach(() => {
    mockOnScenarioChange.mockClear()
  })

  it('should render component with default state', () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    expect(screen.getByText('🌡️ Inflationsszenarien')).toBeInTheDocument()
  })

  it('should display information panel when expanded', async () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    // Click to expand
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    fireEvent.click(trigger)

    await waitFor(() => expect(screen.getByText('ℹ️ Was sind Inflationsszenarien?')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Inflationsszenarien helfen Ihnen/)).toBeInTheDocument())
  })

  it('should show enable/disable radio buttons when expanded', async () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    // Click to expand
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    fireEvent.click(trigger)

    await waitFor(() => expect(screen.getByText('Inflationsszenario aktivieren')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('Aktiviert')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('Deaktiviert')).toBeInTheDocument())
  })

  it('should show scenario selection when enabled', async () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    // Click to expand
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    fireEvent.click(trigger)

    // Enable the feature
    const enabledRadio = await screen.findByLabelText('Aktiviert')
    fireEvent.click(enabledRadio)

    // Should show scenario options
    await waitFor(() => expect(screen.getByText('Szenario auswählen')).toBeInTheDocument())
    await waitFor(() => expect(screen.getAllByText(/Hyperinflation/).length).toBeGreaterThan(0))
    await waitFor(() => expect(screen.getAllByText(/Deflation/).length).toBeGreaterThan(0))
    await waitFor(() => expect(screen.getAllByText(/Stagflation/).length).toBeGreaterThan(0))
  })

  it('should call onScenarioChange with null when disabled', async () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    // Click to expand
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    fireEvent.click(trigger)

    // Enable first
    const enabledRadio = await screen.findByLabelText('Aktiviert')
    fireEvent.click(enabledRadio)

    mockOnScenarioChange.mockClear()

    // Then disable
    const disabledRadio = await screen.findByLabelText('Deaktiviert')
    fireEvent.click(disabledRadio)

    expect(mockOnScenarioChange).toHaveBeenCalledWith(null, null, '')
  })

  it('should show scenario details when a scenario is selected', async () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    // Click to expand
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    fireEvent.click(trigger)

    // Enable the feature
    const enabledRadio = await screen.findByLabelText('Aktiviert')
    fireEvent.click(enabledRadio)

    // Select hyperinflation scenario using label text
    const hyperinflationOption = await screen.findByText('Hyperinflation (Hohes Inflationsszenario)')
    fireEvent.click(hyperinflationOption)

    // Should show scenario details
    await waitFor(() => expect(screen.getByText('📊 Szenario-Details')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Beschreibung:/)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Dauer:/)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Jährliche Inflationsraten:/)).toBeInTheDocument())
  })

  it('should show year slider when scenario is selected', async () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    // Click to expand
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    fireEvent.click(trigger)

    // Enable the feature
    const enabledRadio = await screen.findByLabelText('Aktiviert')
    fireEvent.click(enabledRadio)

    // Select deflation scenario using label text
    const deflationOption = await screen.findByText('Deflation (Negatives Inflationsszenario)')
    fireEvent.click(deflationOption)

    // Should show year slider
    await waitFor(() => expect(screen.getByText(/Startjahr des Szenarios:/)).toBeInTheDocument())
  })

  it('should display warning message', async () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    // Click to expand
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    fireEvent.click(trigger)

    await waitFor(() => expect(screen.getByText('⚠️ Wichtiger Hinweis')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Inflationsszenarien sind Extremszenarien/)).toBeInTheDocument())
  })

  it('should call onScenarioChange when scenario is selected', async () => {
    render(<InflationScenarioConfiguration {...defaultProps} />)

    // Click to expand
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    fireEvent.click(trigger)

    // Enable the feature
    const enabledRadio = await screen.findByLabelText('Aktiviert')
    fireEvent.click(enabledRadio)

    mockOnScenarioChange.mockClear()

    // Select stagflation scenario using label text
    const stagflationOption = await screen.findByText('Stagflation (Inflation + niedrige Renditen)')
    fireEvent.click(stagflationOption)

    // Should have been called with inflation rates and return modifiers
    expect(mockOnScenarioChange).toHaveBeenCalled()
    const [inflationRates, returnModifiers, scenarioName] = mockOnScenarioChange.mock.calls[0]
    expect(inflationRates).toBeDefined()
    expect(inflationRates).not.toBeNull()
    expect(returnModifiers).toBeDefined()
    expect(returnModifiers).not.toBeNull()
    expect(scenarioName).toContain('Stagflation')
  })

  it('should work without onScenarioChange callback', async () => {
    render(<InflationScenarioConfiguration simulationStartYear={2025} />)

    // Should render without errors
    const trigger = screen.getByText('🌡️ Inflationsszenarien')
    expect(trigger).toBeInTheDocument()

    // Should be able to interact
    fireEvent.click(trigger)
    const enabledRadio = await screen.findByLabelText('Aktiviert')
    fireEvent.click(enabledRadio)

    // No errors should occur - check for scenario selection label
    await waitFor(() => expect(screen.getByText('Szenario auswählen')).toBeInTheDocument())
    await waitFor(() => expect(screen.getAllByText(/Hyperinflation/).length).toBeGreaterThan(0))
  })
})
