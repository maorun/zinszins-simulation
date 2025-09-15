/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TaxConfiguration from './TaxConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('TaxConfiguration', () => {
  it('renders the tax configuration section', () => {
    render(
      <SimulationProvider>
        <TaxConfiguration />
      </SimulationProvider>,
    )
    expect(screen.getByText(/Steuer-Konfiguration/)).toBeInTheDocument()
  })
})
