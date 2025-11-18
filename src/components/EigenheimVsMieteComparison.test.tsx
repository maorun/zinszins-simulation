import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { EigenheimVsMieteComparison } from './EigenheimVsMieteComparison'

describe('EigenheimVsMieteComparison', () => {
  it('should render the component with disabled state by default', () => {
    render(<EigenheimVsMieteComparison />)

    expect(screen.getByText('Eigenheim vs. Miete Vergleich')).toBeInTheDocument()
    expect(screen.getByText('Detaillierter Vergleich: Kaufen oder mieten Sie Ihr Zuhause?')).toBeInTheDocument()

    // Should not show configuration when disabled
    expect(screen.queryByText('Vergleichseinstellungen')).not.toBeInTheDocument()
  })

  it('should show configuration when enabled', async () => {
    const user = userEvent.setup()
    render(<EigenheimVsMieteComparison />)

    // Find and click the enable switch
    const switches = screen.getAllByRole('switch')
    const enableSwitch = switches[0]
    await user.click(enableSwitch)

    // Should show configuration sections
    expect(screen.getByText('Vergleichseinstellungen')).toBeInTheDocument()
    expect(screen.getByText('Eigenheim-Szenario')).toBeInTheDocument()
    expect(screen.getByText('Miet-Szenario')).toBeInTheDocument()
  })

  it('should display results when enabled', async () => {
    const user = userEvent.setup()
    render(<EigenheimVsMieteComparison />)

    // Enable the comparison
    const switches = screen.getAllByRole('switch')
    const enableSwitch = switches[0]
    await user.click(enableSwitch)

    // Should show results section
    expect(screen.getByText(/Ergebnisse nach \d+ Jahren/)).toBeInTheDocument()
    expect(screen.getByText('Eigenheim')).toBeInTheDocument()
    expect(screen.getByText('Miete')).toBeInTheDocument()
    expect(screen.getByText('Differenz')).toBeInTheDocument()
  })

  it('should allow updating purchase price', async () => {
    const user = userEvent.setup()
    render(<EigenheimVsMieteComparison />)

    // Enable the comparison
    const switches = screen.getAllByRole('switch')
    const enableSwitch = switches[0]
    await user.click(enableSwitch)

    // Find the purchase price input
    const purchasePriceInput = screen.getByLabelText('Kaufpreis (€)')
    expect(purchasePriceInput).toBeInTheDocument()

    // Update the value
    await user.clear(purchasePriceInput)
    await user.type(purchasePriceInput, '500000')

    expect(purchasePriceInput).toHaveValue(500000)
  })

  it('should allow updating monthly rent', async () => {
    const user = userEvent.setup()
    render(<EigenheimVsMieteComparison />)

    // Enable the comparison
    const switches = screen.getAllByRole('switch')
    const enableSwitch = switches[0]
    await user.click(enableSwitch)

    // Find the monthly rent input
    const rentInput = screen.getByLabelText('Monatliche Kaltmiete (€)')
    expect(rentInput).toBeInTheDocument()

    // Update the value
    await user.clear(rentInput)
    await user.type(rentInput, '2000')

    expect(rentInput).toHaveValue(2000)
  })

  it('should display recommendation based on results', async () => {
    const user = userEvent.setup()
    render(<EigenheimVsMieteComparison />)

    // Enable the comparison
    const switches = screen.getAllByRole('switch')
    const enableSwitch = switches[0]
    await user.click(enableSwitch)

    // Should show a recommendation
    expect(screen.getByText(/Empfehlung:/)).toBeInTheDocument()
  })

  it('should show summary cards with financial data', async () => {
    const user = userEvent.setup()
    render(<EigenheimVsMieteComparison />)

    // Enable the comparison
    const switches = screen.getAllByRole('switch')
    const enableSwitch = switches[0]
    await user.click(enableSwitch)

    // Should show summary information
    expect(screen.getByText('Eigenkapital')).toBeInTheDocument()
    expect(screen.getByText('Vermögen')).toBeInTheDocument()
    expect(screen.getAllByText('Gesamtkosten:')[0]).toBeInTheDocument()
  })
})
