/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SimulationParameters from './SimulationParameters'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('SimulationParameters', () => {
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
      expect(screen.getAllByText(/Sparphase-Ende/)[0]).toBeInTheDocument()
    })

    expect(screen.getByText(/Steuer-Konfiguration/)).toBeInTheDocument()
    expect(screen.getByText(/Simulation-Konfiguration/)).toBeInTheDocument()
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
