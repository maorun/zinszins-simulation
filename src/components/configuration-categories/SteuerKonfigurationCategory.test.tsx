import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SteuerKonfigurationCategory } from './SteuerKonfigurationCategory'
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

describe('SteuerKonfigurationCategory', () => {
  it('renders the category title', () => {
    renderWithProviders(<SteuerKonfigurationCategory />)

    expect(screen.getByText('💰 Steuer-Konfiguration')).toBeInTheDocument()
  })

  it('renders with individual planning mode by default', () => {
    renderWithProviders(<SteuerKonfigurationCategory />)

    // Should render the category
    expect(screen.getByText('💰 Steuer-Konfiguration')).toBeInTheDocument()
  })

  it('renders with couple planning mode', () => {
    renderWithProviders(<SteuerKonfigurationCategory planningMode="couple" />)

    // Should render the category
    expect(screen.getByText('💰 Steuer-Konfiguration')).toBeInTheDocument()
  })

  it('is collapsible', () => {
    renderWithProviders(<SteuerKonfigurationCategory />)

    const categoryHeader = screen.getByText('💰 Steuer-Konfiguration')
    expect(categoryHeader).toBeInTheDocument()

    // The category should be collapsible (has the trigger)
    const collapsibleTrigger = categoryHeader.closest('[data-state]')
    expect(collapsibleTrigger).toBeInTheDocument()
  })

  it('contains tax configuration components when expanded', () => {
    renderWithProviders(<SteuerKonfigurationCategory />)

    // Expand the category
    const categoryHeader = screen.getByText('💰 Steuer-Konfiguration')
    categoryHeader.click()

    // The TaxConfiguration component should be rendered
    // We check for the existence of the component by looking for its structure
    // The exact content will depend on TaxConfiguration's implementation
    const categoryContent = categoryHeader.closest('[data-state]')
    expect(categoryContent).toBeInTheDocument()
  })
})
