import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { GrundeinstellungenCategory } from './GrundeinstellungenCategory'
import { SimulationProvider } from '../../contexts/SimulationContext'
import { NavigationProvider } from '../../contexts/NavigationContext'
import React from 'react'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('GrundeinstellungenCategory', () => {
  it('renders the category title', () => {
    renderWithProviders(<GrundeinstellungenCategory />)

    expect(screen.getByText('📊 Grundeinstellungen')).toBeInTheDocument()
  })

  it('renders simulation configuration section when expanded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GrundeinstellungenCategory />)

    // Expand the category
    const categoryHeader = screen.getByText('📊 Grundeinstellungen')
    await user.click(categoryHeader)

    // Check for simulation configuration
    await waitFor(() => {
      expect(screen.getByText('⚙️ Simulation-Konfiguration')).toBeInTheDocument()
    })
  })

  it('renders time range configuration section when expanded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GrundeinstellungenCategory />)

    // Expand the category
    const categoryHeader = screen.getByText('📊 Grundeinstellungen')
    await user.click(categoryHeader)

    // Check for time range configuration
    await waitFor(() => {
      expect(screen.getByText('📅 Sparphase-Ende')).toBeInTheDocument()
    })
  })

  it('renders benchmark configuration section when expanded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GrundeinstellungenCategory />)

    // Expand the category
    const categoryHeader = screen.getByText('📊 Grundeinstellungen')
    await user.click(categoryHeader)

    // Check for benchmark configuration
    await waitFor(() => {
      expect(screen.getByText('📊 Benchmark-Vergleich')).toBeInTheDocument()
    })
  })

  it('is collapsible', () => {
    renderWithProviders(<GrundeinstellungenCategory />)

    const categoryHeader = screen.getByText('📊 Grundeinstellungen')
    expect(categoryHeader).toBeInTheDocument()

    // The category should be collapsible (has the trigger)
    const collapsibleTrigger = categoryHeader.closest('[data-state]')
    expect(collapsibleTrigger).toBeInTheDocument()
  })
})
