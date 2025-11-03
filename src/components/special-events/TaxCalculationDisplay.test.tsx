import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaxCalculationDisplay } from './TaxCalculationDisplay'

describe('TaxCalculationDisplay', () => {
  const mockTaxCalc = {
    grossAmount: 100000,
    exemption: 400000,
    taxableAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    netAmount: 100000,
  }

  it('renders tax calculation when provided', () => {
    render(<TaxCalculationDisplay inheritanceTaxCalc={mockTaxCalc} />)

    expect(screen.getByText('📊 Steuerberechnung:')).toBeInTheDocument()
  })

  it('displays gross amount', () => {
    render(<TaxCalculationDisplay inheritanceTaxCalc={mockTaxCalc} />)

    expect(screen.getByText(/Brutto-Erbschaft:/)).toBeInTheDocument()
    const grossAmounts = screen.getAllByText(/100\.000,00/)
    expect(grossAmounts.length).toBeGreaterThan(0)
  })

  it('displays exemption amount', () => {
    render(<TaxCalculationDisplay inheritanceTaxCalc={mockTaxCalc} />)

    expect(screen.getByText(/Freibetrag:/)).toBeInTheDocument()
    expect(screen.getByText(/400\.000,00/)).toBeInTheDocument()
  })

  it('displays taxable amount', () => {
    render(<TaxCalculationDisplay inheritanceTaxCalc={mockTaxCalc} />)

    expect(screen.getByText(/Steuerpflichtiger Betrag:/)).toBeInTheDocument()
  })

  it('displays net amount', () => {
    render(<TaxCalculationDisplay inheritanceTaxCalc={mockTaxCalc} />)

    expect(screen.getByText(/Netto-Erbschaft:/)).toBeInTheDocument()
  })

  it('does not render when inheritanceTaxCalc is null', () => {
    const { container } = render(<TaxCalculationDisplay inheritanceTaxCalc={null} />)

    expect(container.firstChild).toBeNull()
  })

  it('formats currency values correctly', () => {
    const taxCalcWithTax = {
      grossAmount: 500000,
      exemption: 400000,
      taxableAmount: 100000,
      taxRate: 0.11,
      taxAmount: 11000,
      netAmount: 489000,
    }

    render(<TaxCalculationDisplay inheritanceTaxCalc={taxCalcWithTax} />)

    expect(screen.getByText(/500\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/489\.000,00/)).toBeInTheDocument()
  })
})
