import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EntnahmeView } from './EntnahmeView'
import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('EntnahmeView', () => {
  it('renders withdrawal plan section', () => {
    renderWithProviders(<EntnahmeView />)

    // Check that the component renders without crashing
    expect(screen.getByText(/Variablen/i)).toBeInTheDocument()
  })
})
