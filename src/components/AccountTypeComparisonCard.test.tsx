import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AccountTypeComparisonCard } from './AccountTypeComparisonCard'

describe('AccountTypeComparisonCard', () => {
  const defaultProps = {
    kapitalertragsteuer: 26.375,
    teilfreistellungsquote: 0,
  }

  describe('Rendering', () => {
    it('should render card title and description', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      expect(screen.getByText('Einzel- vs. Gemeinschaftsdepot Vergleich')).toBeInTheDocument()
      expect(
        screen.getByText(/Vergleichen Sie für Ehepaare die steuerlichen Auswirkungen/),
      ).toBeInTheDocument()
    })

    it('should render info message explaining the comparison', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      const infoMessages = screen.getAllByText(/Einzel- vs. Gemeinschaftsdepot Vergleich/)
      expect(infoMessages.length).toBeGreaterThan(0)
      expect(screen.getByText(/zwei getrennten Depots/)).toBeInTheDocument()
      const gemeinschaftsdepotElements = screen.getAllByText(/Gemeinschaftsdepot/)
      expect(gemeinschaftsdepotElements.length).toBeGreaterThan(0)
    })

    it('should render input fields for both partners', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      expect(screen.getByLabelText(/Kapitalerträge Partner 1/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Kapitalerträge Partner 2/)).toBeInTheDocument()
    })

    it('should render calculate button', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Vergleich berechnen/ })).toBeInTheDocument()
    })

    it('should show default values in input fields', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      const partner1Input = screen.getByLabelText(/Kapitalerträge Partner 1/) as HTMLInputElement
      const partner2Input = screen.getByLabelText(/Kapitalerträge Partner 2/) as HTMLInputElement

      expect(partner1Input.value).toBe('8000')
      expect(partner2Input.value).toBe('2000')
    })

    it('should display total capital gains', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      expect(screen.getByText('Gesamte Kapitalerträge:')).toBeInTheDocument()
      // Default values: 8000 + 2000 = 10000
      const totalGains = screen.getAllByText('10.000,00 €')
      expect(totalGains.length).toBeGreaterThan(0)
    })
  })

  describe('User Interactions', () => {
    it('should update partner 1 gains when input changes', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      const partner1Input = screen.getByLabelText(/Kapitalerträge Partner 1/)
      fireEvent.change(partner1Input, { target: { value: '12000' } })

      expect((partner1Input as HTMLInputElement).value).toBe('12000')
      // Total should update: 12000 + 2000 = 14000
      const updatedTotal = screen.getAllByText('14.000,00 €')
      expect(updatedTotal.length).toBeGreaterThan(0)
    })

    it('should update partner 2 gains when input changes', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      const partner2Input = screen.getByLabelText(/Kapitalerträge Partner 2/)
      fireEvent.change(partner2Input, { target: { value: '5000' } })

      expect((partner2Input as HTMLInputElement).value).toBe('5000')
      // Total should update: 8000 + 5000 = 13000
      const updatedTotal = screen.getAllByText('13.000,00 €')
      expect(updatedTotal.length).toBeGreaterThan(0)
    })

    it('should not show comparison results before calculate button is clicked', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      expect(screen.queryByText(/Zwei getrennte Depots/)).not.toBeInTheDocument()
      // Note: "Gemeinschaftsdepot" appears in the card title and description, so we check for the specific scenario card
      expect(screen.queryByText(/🏦 Gemeinschaftsdepot/)).not.toBeInTheDocument()
    })

    it('should show comparison results after calculate button is clicked', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      const calculateButton = screen.getByRole('button', { name: /Vergleich berechnen/ })
      fireEvent.click(calculateButton)

      expect(screen.getAllByText(/👫 Zwei getrennte Depots/)).toHaveLength(1)
      const gemeinschaftsdepotElements = screen.getAllByText(/🏦 Gemeinschaftsdepot/)
      expect(gemeinschaftsdepotElements.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Comparison Results', () => {
    it('should display both account structure scenarios', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      const calculateButton = screen.getByRole('button', { name: /Vergleich berechnen/ })
      fireEvent.click(calculateButton)

      // Both scenarios should be visible
      const scenarioCards = screen.getAllByText(/Gesamt-Freibetrag:/)
      expect(scenarioCards).toHaveLength(2)
    })

    it('should show correct Freibetrag for separate accounts', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Both structures have the same total Freibetrag (4000€)
      const freibetragElements = screen.getAllByText('4.000,00 €')
      expect(freibetragElements.length).toBeGreaterThanOrEqual(2)
    })

    it('should show correct Freibetrag for joint account', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Both should have the same total Freibetrag (4000€)
      const freibetragElements = screen.getAllByText('4.000,00 €')
      expect(freibetragElements.length).toBeGreaterThanOrEqual(2)
    })

    it('should mark recommended option with badge', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should have exactly one "Empfohlen" badge
      const recommendedBadges = screen.getAllByText('Empfohlen')
      expect(recommendedBadges).toHaveLength(1)
    })

    it('should show recommendation summary', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      expect(screen.getByText(/Empfehlung:/)).toBeInTheDocument()
    })

    it('should display tax savings when applicable', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      // Set uneven distribution
      const partner1Input = screen.getByLabelText(/Kapitalerträge Partner 1/)
      const partner2Input = screen.getByLabelText(/Kapitalerträge Partner 2/)

      fireEvent.change(partner1Input, { target: { value: '10000' } })
      fireEvent.change(partner2Input, { target: { value: '500' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should show tax savings
      expect(screen.getByText(/Steuerersparnis:/)).toBeInTheDocument()
    })

    it('should show effective tax rates for both scenarios', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      const effectiveTaxRateLabels = screen.getAllByText(/Effektiver Steuersatz:/)
      expect(effectiveTaxRateLabels).toHaveLength(2)
    })

    it('should recommend separate accounts for uneven distribution', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      // Highly uneven distribution
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '10000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '500' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should recommend separate accounts
      expect(screen.getAllByText(/👫 Getrennte Depots/).length).toBeGreaterThan(0)
    })

    it('should recommend joint account for even distribution', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      // Even distribution
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '5000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '5000' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should recommend joint account (default for equal)
      const gemeinschaftsdepotElements = screen.getAllByText(/🏦 Gemeinschaftsdepot/)
      expect(gemeinschaftsdepotElements.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Optimal Distribution Guidance', () => {
    it('should show optimal distribution guidance when separate accounts are worthwhile', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      // Set uneven distribution that makes separate accounts worthwhile
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '10000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '1000' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should show optimal distribution guidance
      expect(screen.getByText(/Optimale Aufteilung für getrennte Depots/)).toBeInTheDocument()
    })

    it('should recommend equal split in optimal distribution', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '10000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '500' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should show 5250€ for each partner (10500 / 2)
      const amounts = screen.getAllByText('5.250,00 €')
      // Should appear at least once in the optimal distribution guidance
      expect(amounts.length).toBeGreaterThan(0)
    })

    it('should not show optimal distribution for even distribution', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      // Even distribution - joint account is recommended
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '5000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '5000' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should NOT show optimal distribution guidance
      expect(screen.queryByText(/Optimale Aufteilung für getrennte Depots/)).not.toBeInTheDocument()
    })
  })

  describe('Tax Configuration', () => {
    it('should use provided Kapitalertragsteuer rate', () => {
      const customTaxRate = 25.0
      render(<AccountTypeComparisonCard kapitalertragsteuer={customTaxRate} teilfreistellungsquote={0} />)

      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '10000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '0' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Tax should be calculated with custom rate
      // 10000 - 2000 = 8000 taxable, 8000 * 0.25 = 2000€ tax
      const taxAmounts = screen.getAllByText('2.000,00 €')
      expect(taxAmounts.length).toBeGreaterThan(0)
    })

    it('should apply Teilfreistellungsquote correctly', () => {
      const teilfreistellung = 30
      render(<AccountTypeComparisonCard kapitalertragsteuer={26.375} teilfreistellungsquote={teilfreistellung} />)

      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '10000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '0' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // With 30% Teilfreistellung:
      // Net gains: 10000 * 0.7 = 7000
      // Taxable: 7000 - 2000 = 5000
      // Tax: 5000 * 0.26375 = 1318.75€
      const taxAmounts = screen.getAllByText('1.318,75 €')
      expect(taxAmounts.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero gains gracefully', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '0' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '0' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should show results without errors
      expect(screen.getAllByText(/👫 Zwei getrennte Depots/)).toHaveLength(1)
      const gemeinschaftsdepotElements = screen.getAllByText(/🏦 Gemeinschaftsdepot/)
      expect(gemeinschaftsdepotElements.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle gains below Freibetrag', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '1500' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '1500' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Total gains 3000€ < 4000€ Freibetrag, so no tax
      // Should show 0.00€ tax for both scenarios
      const taxAmounts = screen.getAllByText('0,00 €')
      expect(taxAmounts.length).toBeGreaterThan(0)
    })

    it('should handle very large capital gains', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '1000000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '500000' } })

      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Should render without errors
      expect(screen.getAllByText(/👫 Zwei getrennte Depots/)).toHaveLength(1)
      expect(screen.getByText(/Empfehlung:/)).toBeInTheDocument()
    })

    it('should update comparison when inputs change and recalculate', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      // First calculation
      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Change inputs
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 1/), { target: { value: '5000' } })
      fireEvent.change(screen.getByLabelText(/Kapitalerträge Partner 2/), { target: { value: '5000' } })

      // Recalculate
      fireEvent.click(screen.getByRole('button', { name: /Vergleich berechnen/ }))

      // Results should be visible (may have different recommendation)
      expect(screen.getByText(/Empfehlung:/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      const partner1Input = screen.getByLabelText(/Kapitalerträge Partner 1/)
      const partner2Input = screen.getByLabelText(/Kapitalerträge Partner 2/)

      expect(partner1Input).toHaveAttribute('id')
      expect(partner2Input).toHaveAttribute('id')
    })

    it('should have accessible button', () => {
      render(<AccountTypeComparisonCard {...defaultProps} />)

      const button = screen.getByRole('button', { name: /Vergleich berechnen/ })
      expect(button).toBeInTheDocument()
      expect(button).toBeEnabled()
    })
  })
})
