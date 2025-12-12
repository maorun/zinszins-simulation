import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('should show description text when expanded', async () => {
    const user = userEvent.setup()
    render(
      <SimulationProvider>
        <AlimonyConfiguration />
      </SimulationProvider>,
    )

    // Click to expand the collapsible card
    await user.click(screen.getByText(/Unterhaltszahlungen/i))

    expect(screen.getByText(/Kindesunterhalt, Ehegattenunterhalt und Trennungsunterhalt planen/i)).toBeInTheDocument()
  })
})
