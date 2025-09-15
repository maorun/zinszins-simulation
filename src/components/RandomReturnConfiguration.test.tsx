/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RandomReturnConfiguration from './RandomReturnConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('RandomReturnConfiguration', () => {
  it('renders the random return configuration section', () => {
    render(
      <SimulationProvider>
        <RandomReturnConfiguration />
      </SimulationProvider>,
    )
    expect(screen.getByText('Durchschnittliche Rendite')).toBeInTheDocument()
    expect(screen.getByText('Volatilität (Standardabweichung)')).toBeInTheDocument()
    expect(screen.getByText('Zufallsseed (optional für reproduzierbare Ergebnisse)')).toBeInTheDocument()
  })
})
