import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SimulationProvider } from '../contexts/SimulationContext'
import { TaxLossHarvestingCard } from './TaxLossHarvestingCard'
import type { ReactElement } from 'react'

// Wrapper to provide simulation context
function renderWithContext(ui: ReactElement) {
  return render(<SimulationProvider>{ui}</SimulationProvider>)
}

describe('TaxLossHarvestingCard', () => {
  it('should render the card with title', () => {
    renderWithContext(<TaxLossHarvestingCard />)

    expect(screen.getByText(/Verlustverrechnungs-Rechner/)).toBeInTheDocument()
  })

  it('should be collapsed by default', () => {
    renderWithContext(<TaxLossHarvestingCard />)

    // Title is visible
    expect(screen.getByText(/Verlustverrechnungs-Rechner/)).toBeInTheDocument()

    // Content is not visible when collapsed
    expect(screen.queryByText(/Informations-Tool/)).not.toBeInTheDocument()
  })

  it('should render component successfully', () => {
    renderWithContext(<TaxLossHarvestingCard />)

    // Just verify the component renders without errors
    const title = screen.getByText(/Verlustverrechnungs-Rechner/)
    expect(title).toBeInTheDocument()
  })
})
