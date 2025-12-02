import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EntnahmeView } from './EntnahmeView'
import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import type React from 'react'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('EntnahmeView', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<EntnahmeView />)

    // Check that the component renders without error
    expect(container).toBeInTheDocument()
  })
})
