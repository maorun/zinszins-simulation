import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SparenView } from './SparenView'
import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'

const defaultProps = {
  handleApplyScenario: vi.fn(),
  startOfIndependence: 2025,
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('SparenView', () => {
  it('renders simulation parameters section', () => {
    renderWithProviders(<SparenView {...defaultProps} />)

    expect(screen.getByText(/Konfiguration/i)).toBeInTheDocument()
  })

  it('renders savings plan component', () => {
    renderWithProviders(<SparenView {...defaultProps} />)

    expect(screen.getByText(/Rendite-Konfiguration/i)).toBeInTheDocument()
  })
})
