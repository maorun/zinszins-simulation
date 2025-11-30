import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SparenView } from './SparenView'
import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('SparenView', () => {
  it('renders simulation parameters section', () => {
    renderWithProviders(<SparenView />)

    expect(screen.getByText(/Konfiguration/i)).toBeInTheDocument()
  })

  it('renders savings plan component', () => {
    renderWithProviders(<SparenView />)

    expect(screen.getByText(/Rendite-Konfiguration/i)).toBeInTheDocument()
  })
})
