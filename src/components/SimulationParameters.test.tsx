/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SimulationParameters from './SimulationParameters'
import { SimulationProvider } from '../contexts/SimulationContext'

// Mock TaxConfiguration to verify it receives the correct planningMode prop
vi.mock('./TaxConfiguration', () => ({
  default: ({ planningMode }: { planningMode?: 'individual' | 'couple' }) => (
    <div data-testid="tax-configuration" data-planning-mode={planningMode}>
      TaxConfiguration with planningMode:
      {' '}
      {planningMode}
    </div>
  ),
}))

// Mock other components to avoid complex rendering
vi.mock('./SimulationConfiguration', () => ({
  default: () => <div data-testid="simulation-configuration">SimulationConfiguration</div>,
}))

vi.mock('./TimeRangeConfiguration', () => ({
  default: () => <div data-testid="time-range-configuration">TimeRangeConfiguration</div>,
}))

describe('SimulationParameters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the simulation parameters form', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>,
    )

    // Check that the Configuration header is visible
    expect(screen.getAllByText(/Konfiguration/)[0]).toBeInTheDocument()

    // Expand the collapsible panel by clicking on the trigger div
    const expandTrigger = screen.getByText('⚙️ Konfiguration').closest('div[aria-expanded="false"]')
    expect(expandTrigger).toBeInTheDocument()
    fireEvent.click(expandTrigger!)

    // Wait for the content to be visible
    await waitFor(() => {
      expect(screen.getByTestId('tax-configuration')).toBeInTheDocument()
    })

    expect(screen.getByTestId('simulation-configuration')).toBeInTheDocument()
    expect(screen.getByTestId('time-range-configuration')).toBeInTheDocument()
  })

  it('passes planningMode prop to TaxConfiguration component', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>,
    )

    // Expand the collapsible panel
    const expandTrigger = screen.getByText('⚙️ Konfiguration').closest('div[aria-expanded="false"]')
    fireEvent.click(expandTrigger!)

    // Wait for the content to be visible
    await waitFor(() => {
      const taxConfig = screen.getByTestId('tax-configuration')
      expect(taxConfig).toBeInTheDocument()

      // The default planningMode from SimulationContext should be passed to TaxConfiguration
      // Based on the context default config, this should be 'couple' by default
      expect(taxConfig).toHaveAttribute('data-planning-mode', 'couple')
    })
  })

  it('does not render a parameter export button (functionality moved to Export card)', () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>,
    )

    // The parameter export functionality has been moved to the dedicated Export card
    expect(screen.queryByRole('button', { name: /Parameter exportieren/ })).not.toBeInTheDocument()
  })
})
