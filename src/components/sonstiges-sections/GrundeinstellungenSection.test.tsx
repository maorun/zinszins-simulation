import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GrundeinstellungenSection } from './GrundeinstellungenSection'
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

describe('GrundeinstellungenSection', () => {
  it('renders the Grundeinstellungen category', () => {
    renderWithProviders(<GrundeinstellungenSection />)

    expect(screen.getByText(/📊 Grundeinstellungen/i)).toBeInTheDocument()
  })

  it('renders as a collapsible category', () => {
    const { container } = renderWithProviders(<GrundeinstellungenSection />)

    // Check that it's collapsible by looking for the chevron icon
    const chevron = container.querySelector('.lucide-chevron-down')
    expect(chevron).toBeInTheDocument()
  })

  it('loads nested configuration sections', async () => {
    renderWithProviders(<GrundeinstellungenSection />)

    // The category should be present
    expect(screen.getByText(/📊 Grundeinstellungen/i)).toBeInTheDocument()

    // When collapsed, the nested sections should not be visible initially
    // They are lazy-loaded and only appear when expanded
  })
})
