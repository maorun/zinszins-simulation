/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SavingsPlan from './SavingsPlan'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('SavingsPlan', () => {
  it('renders the savings plan section', () => {
    render(
      <SimulationProvider>
        <SavingsPlan />
      </SimulationProvider>,
    )
    const allSparplaene = screen.getAllByText(/Sparpläne erstellen/)
    expect(allSparplaene.length).toBeGreaterThan(0)
  })
})
