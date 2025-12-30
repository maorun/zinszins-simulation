import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { EigenheimVsMieteComparison } from './EigenheimVsMieteComparison'

// Helper to expand the collapsible card
async function expandCard() {
  const user = userEvent.setup()
  const trigger = screen.getByText('Eigenheim vs. Miete Vergleich')
  await user.click(trigger)
}

describe('EigenheimVsMieteComparison', () => {
  it('should render the component', () => {
    render(<EigenheimVsMieteComparison />)

    expect(screen.getByText('Eigenheim vs. Miete Vergleich')).toBeInTheDocument()
    expect(screen.getByText('Detaillierter Vergleich: Kaufen oder mieten Sie Ihr Zuhause?')).toBeInTheDocument()
  })

  it('should show configuration when enabled', async () => {
    render(<EigenheimVsMieteComparison />)

    // Expand the card
    await expandCard()

    // Should show configuration sections
    expect(screen.getByText('Vergleichseinstellungen')).toBeInTheDocument()
    expect(screen.getByText('Eigenheim-Szenario')).toBeInTheDocument()
    expect(screen.getByText('Miet-Szenario')).toBeInTheDocument()
  })

  it('should display results when enabled', async () => {
    render(<EigenheimVsMieteComparison />)

    // Expand the card
    await expandCard()

    // Should show results section
    expect(screen.getByText(/Ergebnisse nach \d+ Jahren/)).toBeInTheDocument()
    expect(screen.getAllByText('Eigenheim').length).toBeGreaterThan(0)
    expect(screen.getByText('Miete')).toBeInTheDocument()
    expect(screen.getByText('Differenz')).toBeInTheDocument()
  })

  it('should allow updating purchase price', async () => {
    const user = userEvent.setup()
    render(<EigenheimVsMieteComparison />)

    // Expand the card
    await expandCard()

    const purchasePriceInput = screen.getByLabelText(/Kaufpreis/) as HTMLInputElement

    await user.clear(purchasePriceInput)
    await user.type(purchasePriceInput, '500000')

    expect(purchasePriceInput.value).toBe('500000')
  })

  it('should allow updating monthly rent', async () => {
    const user = userEvent.setup()
    render(<EigenheimVsMieteComparison />)

    // Expand the card
    await expandCard()

    const rentInput = screen.getByLabelText(/Monatliche Miete/) as HTMLInputElement

    await user.clear(rentInput)
    await user.type(rentInput, '1500')

    expect(rentInput.value).toBe('1500')
  })

  it('should display recommendation based on results', async () => {
    render(<EigenheimVsMieteComparison />)

    // Expand the card
    await expandCard()

    // Should show recommendation section
    const recommendationElements = screen.getAllByText(/Empfehlung/)
    expect(recommendationElements.length).toBeGreaterThan(0)
  })

  it('should show summary cards with financial data', async () => {
    render(<EigenheimVsMieteComparison />)

    // Expand the card
    await expandCard()

    // Should show financial summaries
    expect(screen.getByText(/Gesamtkosten/)).toBeInTheDocument()
    expect(screen.getByText(/Vermögenswert/)).toBeInTheDocument()
  })
})
