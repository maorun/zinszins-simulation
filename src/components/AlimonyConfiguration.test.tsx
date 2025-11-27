import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AlimonyConfiguration from './AlimonyConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('AlimonyConfiguration', () => {
  it('should render without crashing', () => {
    render(
      <SimulationProvider>
        <AlimonyConfiguration />
      </SimulationProvider>,
    )

    expect(screen.getByText(/Unterhaltszahlungen/i)).toBeInTheDocument()
  })

  it('should show configuration title', () => {
    render(
      <SimulationProvider>
        <AlimonyConfiguration />
      </SimulationProvider>,
    )

    expect(screen.getByText(/Unterhaltszahlungen/i)).toBeInTheDocument()
  })

  it('should show description text', () => {
    render(
      <SimulationProvider>
        <AlimonyConfiguration />
      </SimulationProvider>,
    )

    expect(screen.getByText(/Kindesunterhalt, Ehegattenunterhalt und Trennungsunterhalt planen/i)).toBeInTheDocument()
  })
})
