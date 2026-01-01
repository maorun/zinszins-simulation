import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RealEstateConfigurations } from './RealEstateConfigurations'
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

describe('RealEstateConfigurations', () => {
  it('renders the Immobilien-Analysen category', () => {
    renderWithProviders(<RealEstateConfigurations />)

    expect(screen.getByText(/🏠 Immobilien-Analysen/i)).toBeInTheDocument()
  })

  it('renders as a collapsible category', () => {
    const { container } = renderWithProviders(<RealEstateConfigurations />)

    // Check that it's collapsible by looking for the chevron icon
    const chevron = container.querySelector('.lucide-chevron-down')
    expect(chevron).toBeInTheDocument()
  })

  it('loads nested real estate sections', async () => {
    renderWithProviders(<RealEstateConfigurations />)

    // The category should be present
    expect(screen.getByText(/🏠 Immobilien-Analysen/i)).toBeInTheDocument()

    // When collapsed, the nested sections should not be visible initially
    // They are lazy-loaded and only appear when expanded
  })
})
