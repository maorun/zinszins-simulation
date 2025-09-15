/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SimulationConfiguration from './SimulationConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('SimulationConfiguration', () => {
  it('renders the simulation configuration section', () => {
    render(
      <SimulationProvider>
        <SimulationConfiguration />
      </SimulationProvider>,
    )
    expect(screen.getByText(/Simulation-Konfiguration/)).toBeInTheDocument()
  })
})
