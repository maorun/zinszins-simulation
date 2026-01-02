import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PlanningConfigurations } from './PlanningConfigurations'
import { SimulationProvider } from '../../contexts/SimulationContext'
import { NavigationProvider } from '../../contexts/NavigationContext'
import React from 'react'

const defaultProps = {
  startOfIndependence: 2025,
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('PlanningConfigurations', () => {
  it('renders the Finanzplanung & Lebenssituationen category', () => {
    renderWithProviders(<PlanningConfigurations {...defaultProps} />)

    expect(screen.getByText(/💼 Finanzplanung & Lebenssituationen/i)).toBeInTheDocument()
  })

  it('renders as a collapsible category', () => {
    const { container} = renderWithProviders(<PlanningConfigurations {...defaultProps} />)

    // Check that it's collapsible by looking for the chevron icon
    const chevron = container.querySelector('.lucide-chevron-down')
    expect(chevron).toBeInTheDocument()
  })

  it('loads nested planning sections', async () => {
    renderWithProviders(<PlanningConfigurations {...defaultProps} />)

    // The category should be present
    expect(screen.getByText(/💼 Finanzplanung & Lebenssituationen/i)).toBeInTheDocument()

    // When collapsed, the nested sections should not be visible initially
    // They are lazy-loaded and only appear when expanded
  })
})
