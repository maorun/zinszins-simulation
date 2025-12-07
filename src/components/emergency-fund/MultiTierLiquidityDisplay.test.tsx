import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MultiTierLiquidityDisplay } from './MultiTierLiquidityDisplay'

describe('MultiTierLiquidityDisplay', () => {
  describe('Basic Rendering', () => {
    it('should render the main heading', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      expect(screen.getByText(/Empfohlene Liquiditätsaufteilung/i)).toBeInTheDocument()
    })

    it('should show all three tiers', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      expect(screen.getByText(/Stufe 1: Girokonto/i)).toBeInTheDocument()
      expect(screen.getByText(/Stufe 2: Tagesgeldkonto/i)).toBeInTheDocument()
      expect(screen.getByText(/Stufe 3: Kurzfristige Anlagen/i)).toBeInTheDocument()
    })

    it('should show tier descriptions', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      expect(screen.getByText(/Sofort verfügbar für tägliche Ausgaben/i)).toBeInTheDocument()
      expect(screen.getByText(/Hohe Verfügbarkeit mit aktuellen Tagesgeld-Zinsen/i)).toBeInTheDocument()
      expect(screen.getByText(/Geldmarkt-ETF oder kurzfristige Anleihen/i)).toBeInTheDocument()
    })

    it('should show expected returns for each tier', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      expect(screen.getByText(/Rendite: 0%/i)).toBeInTheDocument()
      expect(screen.getByText(/Rendite: ~3-4%/i)).toBeInTheDocument()
      expect(screen.getByText(/Rendite: ~4-5%/i)).toBeInTheDocument()
    })

    it('should show hint about allocation strategy', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      expect(screen.getByText(/Hinweis:/i)).toBeInTheDocument()
      expect(screen.getByText(/optimiert das Verhältnis zwischen Verfügbarkeit und Rendite/i)).toBeInTheDocument()
    })
  })

  describe('Balanced Strategy', () => {
    it('should calculate correct amounts for balanced strategy', () => {
      render(<MultiTierLiquidityDisplay targetAmount={10000} reserveStrategy="balanced" />)

      // Balanced: 20% checking, 50% savings, 30% short-term
      // Should show: 2.000,00 €, 5.000,00 €, 3.000,00 €
      expect(screen.getByText(/2\.000,00 €/i)).toBeInTheDocument() // Checking 20%
      expect(screen.getByText(/5\.000,00 €/i)).toBeInTheDocument() // Savings 50%
      expect(screen.getByText(/3\.000,00 €/i)).toBeInTheDocument() // Short-term 30%
    })

    it('should show correct percentages for balanced strategy', () => {
      render(<MultiTierLiquidityDisplay targetAmount={10000} reserveStrategy="balanced" />)

      const percentages = screen.getAllByText(/20%|50%|30%/)
      expect(percentages).toHaveLength(3)
    })

    it('should mention balanced in description', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      const matches = screen.getAllByText(/Ausgewogenen/i)
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Conservative Strategy', () => {
    it('should calculate correct amounts for conservative strategy', () => {
      render(<MultiTierLiquidityDisplay targetAmount={10000} reserveStrategy="conservative" />)

      // Conservative: 30% checking, 60% savings, 10% short-term
      expect(screen.getByText(/3\.000,00 €/i)).toBeInTheDocument() // Checking 30%
      expect(screen.getByText(/6\.000,00 €/i)).toBeInTheDocument() // Savings 60%
      expect(screen.getByText(/1\.000,00 €/i)).toBeInTheDocument() // Short-term 10%
    })

    it('should show correct percentages for conservative strategy', () => {
      render(<MultiTierLiquidityDisplay targetAmount={10000} reserveStrategy="conservative" />)

      const percentages = screen.getAllByText(/30%|60%|10%/)
      expect(percentages).toHaveLength(3)
    })

    it('should mention conservative in description', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="conservative" />)

      const matches = screen.getAllByText(/Konservativen/i)
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Aggressive Strategy', () => {
    it('should calculate correct amounts for aggressive strategy', () => {
      render(<MultiTierLiquidityDisplay targetAmount={10000} reserveStrategy="aggressive" />)

      // Aggressive: 10% checking, 40% savings, 50% short-term
      expect(screen.getByText(/1\.000,00 €/i)).toBeInTheDocument() // Checking 10%
      expect(screen.getByText(/4\.000,00 €/i)).toBeInTheDocument() // Savings 40%
      expect(screen.getByText(/5\.000,00 €/i)).toBeInTheDocument() // Short-term 50%
    })

    it('should show correct percentages for aggressive strategy', () => {
      render(<MultiTierLiquidityDisplay targetAmount={10000} reserveStrategy="aggressive" />)

      const percentages = screen.getAllByText(/10%|40%|50%/)
      expect(percentages).toHaveLength(3)
    })

    it('should mention aggressive in description', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="aggressive" />)

      const matches = screen.getAllByText(/Aggressiven/i)
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero target amount', () => {
      render(<MultiTierLiquidityDisplay targetAmount={0} reserveStrategy="balanced" />)

      const zeroAmounts = screen.getAllByText(/0,00 €/i)
      expect(zeroAmounts).toHaveLength(3) // All three tiers show 0€
    })

    it('should handle large target amounts', () => {
      render(<MultiTierLiquidityDisplay targetAmount={100000} reserveStrategy="balanced" />)

      // Balanced: 20% checking, 50% savings, 30% short-term
      expect(screen.getByText(/20\.000,00 €/i)).toBeInTheDocument() // Checking 20%
      expect(screen.getByText(/50\.000,00 €/i)).toBeInTheDocument() // Savings 50%
      expect(screen.getByText(/30\.000,00 €/i)).toBeInTheDocument() // Short-term 30%
    })

    it('should handle fractional amounts correctly', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12345} reserveStrategy="balanced" />)

      // Balanced: 20% = 2469, 50% = 6172.5, 30% = 3703.5
      expect(screen.getByText(/2\.469,00 €/i)).toBeInTheDocument()
      expect(screen.getByText(/6\.172,50 €/i)).toBeInTheDocument()
      expect(screen.getByText(/3\.703,50 €/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      // Check for proper heading hierarchy
      const headings = container.querySelectorAll('h4, h5')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have descriptive text for all amounts', () => {
      render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      // Each tier should have name, description, amount, percentage, and return
      const tier1 = screen.getByText(/Stufe 1: Girokonto/i)
      expect(tier1).toBeInTheDocument()

      const tier2 = screen.getByText(/Stufe 2: Tagesgeldkonto/i)
      expect(tier2).toBeInTheDocument()

      const tier3 = screen.getByText(/Stufe 3: Kurzfristige Anlagen/i)
      expect(tier3).toBeInTheDocument()

      // Check amounts are present (multiple instances expected)
      expect(screen.getByText(/2\.400,00 €/i)).toBeInTheDocument()
      expect(screen.getByText(/6\.000,00 €/i)).toBeInTheDocument()
      expect(screen.getByText(/3\.600,00 €/i)).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should use grid layout for responsive design', () => {
      const { container } = render(<MultiTierLiquidityDisplay targetAmount={12000} reserveStrategy="balanced" />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-3')
    })
  })
})
