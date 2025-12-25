import { describe, it, expect } from 'vitest'
import {
  type PortfolioHolding,
  calculateWeightedTeilfreistellungsquote,
  calculateEffectiveTaxRate,
  calculateTaxOnGains,
  compareTaxScenarios,
  validatePortfolioHoldings,
  suggestPortfolioOptimization,
  formatWeightedQuote,
} from './portfolio-teilfreistellung'

describe('portfolio-teilfreistellung', () => {
  describe('calculateWeightedTeilfreistellungsquote', () => {
    it('should calculate weighted quote for single equity fund (100%)', () => {
      const holdings: PortfolioHolding[] = [{ assetClass: 'equity-fund', allocation: 1.0 }]

      const result = calculateWeightedTeilfreistellungsquote(holdings)

      expect(result.weightedQuote).toBe(0.3) // 100% × 30%
      expect(result.totalAllocation).toBe(1.0)
      expect(result.contributions).toHaveLength(1)
      expect(result.contributions[0].contribution).toBe(0.3)
    })

    it('should calculate weighted quote for mixed portfolio (60% equity, 40% bonds)', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.6 },
        { assetClass: 'bond-fund', allocation: 0.4 },
      ]

      const result = calculateWeightedTeilfreistellungsquote(holdings)

      expect(result.weightedQuote).toBeCloseTo(0.18, 10) // 60% × 30% + 40% × 0%
      expect(result.totalAllocation).toBe(1.0)
      expect(result.contributions).toHaveLength(2)
    })

    it('should calculate weighted quote for complex multi-asset portfolio', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.4 }, // 40% × 30% = 12%
        { assetClass: 'mixed-fund', allocation: 0.3 }, // 30% × 15% = 4.5%
        { assetClass: 'real-estate-fund', allocation: 0.2 }, // 20% × 60% = 12%
        { assetClass: 'bond-fund', allocation: 0.1 }, // 10% × 0% = 0%
      ]

      const result = calculateWeightedTeilfreistellungsquote(holdings)

      expect(result.weightedQuote).toBeCloseTo(0.285, 10) // 12% + 4.5% + 12% + 0% = 28.5%
      expect(result.totalAllocation).toBeCloseTo(1.0, 10) // Use toBeCloseTo for floating point
      expect(result.contributions).toHaveLength(4)
    })

    it('should handle custom asset class with custom quote', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.7 },
        { assetClass: 'custom', allocation: 0.3, customQuote: 0.2 }, // Custom 20%
      ]

      const result = calculateWeightedTeilfreistellungsquote(holdings)

      expect(result.weightedQuote).toBeCloseTo(0.27, 10) // 70% × 30% + 30% × 20% = 27%
      expect(result.contributions[1].quote).toBe(0.2)
    })

    it('should handle empty portfolio', () => {
      const holdings: PortfolioHolding[] = []

      const result = calculateWeightedTeilfreistellungsquote(holdings)

      expect(result.weightedQuote).toBe(0)
      expect(result.totalAllocation).toBe(0)
      expect(result.contributions).toHaveLength(0)
    })

    it('should calculate correct contributions breakdown', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.5 },
        { assetClass: 'bond-fund', allocation: 0.5 },
      ]

      const result = calculateWeightedTeilfreistellungsquote(holdings)

      expect(result.contributions[0]).toMatchObject({
        assetClass: 'equity-fund',
        allocation: 0.5,
        quote: 0.3,
        contribution: 0.15,
      })
      expect(result.contributions[1]).toMatchObject({
        assetClass: 'bond-fund',
        allocation: 0.5,
        quote: 0.0,
        contribution: 0.0,
      })
    })
  })

  describe('calculateEffectiveTaxRate', () => {
    it('should calculate effective tax rate for equity fund (30% exemption)', () => {
      const effectiveRate = calculateEffectiveTaxRate(0.26375, 0.3)

      expect(effectiveRate).toBeCloseTo(0.184625, 6) // 26.375% × 70%
    })

    it('should calculate effective tax rate for bond fund (0% exemption)', () => {
      const effectiveRate = calculateEffectiveTaxRate(0.26375, 0.0)

      expect(effectiveRate).toBe(0.26375) // No exemption
    })

    it('should calculate effective tax rate for real estate fund (60% exemption)', () => {
      const effectiveRate = calculateEffectiveTaxRate(0.26375, 0.6)

      expect(effectiveRate).toBeCloseTo(0.1055, 6) // 26.375% × 40%
    })

    it('should handle 100% exemption (theoretical)', () => {
      const effectiveRate = calculateEffectiveTaxRate(0.26375, 1.0)

      expect(effectiveRate).toBe(0)
    })

    it('should work with different tax rates', () => {
      const effectiveRate = calculateEffectiveTaxRate(0.25, 0.3)

      expect(effectiveRate).toBeCloseTo(0.175, 6) // 25% × 70%
    })
  })

  describe('calculateTaxOnGains', () => {
    it('should calculate tax on 10,000 EUR gains with equity fund', () => {
      const tax = calculateTaxOnGains(10000, 0.26375, 0.3)

      expect(tax).toBeCloseTo(1846.25, 2) // 10,000 × 70% × 26.375%
    })

    it('should calculate tax on 10,000 EUR gains with bond fund', () => {
      const tax = calculateTaxOnGains(10000, 0.26375, 0.0)

      expect(tax).toBeCloseTo(2637.5, 2) // 10,000 × 100% × 26.375%
    })

    it('should calculate tax savings between equity and bond fund', () => {
      const equityTax = calculateTaxOnGains(10000, 0.26375, 0.3)
      const bondTax = calculateTaxOnGains(10000, 0.26375, 0.0)
      const savings = bondTax - equityTax

      expect(savings).toBeCloseTo(791.25, 2) // 30% exemption saves 791.25 EUR
    })

    it('should handle zero gains', () => {
      const tax = calculateTaxOnGains(0, 0.26375, 0.3)

      expect(tax).toBe(0)
    })
  })

  describe('compareTaxScenarios', () => {
    it('should compare 100% bonds vs 100% equity', () => {
      const scenarioA: PortfolioHolding[] = [{ assetClass: 'bond-fund', allocation: 1.0 }]
      const scenarioB: PortfolioHolding[] = [{ assetClass: 'equity-fund', allocation: 1.0 }]

      const comparison = compareTaxScenarios(
        scenarioA,
        scenarioB,
        'Nur Anleihen',
        'Nur Aktien',
      )

      expect(comparison.scenarioA.weightedQuote).toBe(0)
      expect(comparison.scenarioB.weightedQuote).toBe(0.3)
      expect(comparison.scenarioA.effectiveTaxRate).toBeCloseTo(0.26375, 6)
      expect(comparison.scenarioB.effectiveTaxRate).toBeCloseTo(0.184625, 6)
      expect(comparison.taxSavings).toBeCloseTo(0.079125, 6) // ~7.9 percentage points
      expect(comparison.relativeImprovement).toBeCloseTo(30, 1) // 30% improvement
    })

    it('should compare mixed portfolios', () => {
      const scenarioA: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.5 },
        { assetClass: 'bond-fund', allocation: 0.5 },
      ]
      const scenarioB: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.7 },
        { assetClass: 'mixed-fund', allocation: 0.3 },
      ]

      const comparison = compareTaxScenarios(scenarioA, scenarioB)

      // Scenario A: 50% × 30% = 15% weighted quote
      expect(comparison.scenarioA.weightedQuote).toBeCloseTo(0.15, 10)
      // Scenario B: 70% × 30% + 30% × 15% = 25.5% weighted quote
      expect(comparison.scenarioB.weightedQuote).toBeCloseTo(0.255, 10)
      expect(comparison.taxSavings).toBeGreaterThan(0) // B has lower effective tax
    })

    it('should handle identical scenarios (no savings)', () => {
      const scenario: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.6 },
        { assetClass: 'bond-fund', allocation: 0.4 },
      ]

      const comparison = compareTaxScenarios(scenario, scenario)

      expect(comparison.taxSavings).toBe(0)
      expect(comparison.relativeImprovement).toBe(0)
    })

    it('should use custom scenario names', () => {
      const scenarioA: PortfolioHolding[] = [{ assetClass: 'bond-fund', allocation: 1.0 }]
      const scenarioB: PortfolioHolding[] = [{ assetClass: 'equity-fund', allocation: 1.0 }]

      const comparison = compareTaxScenarios(
        scenarioA,
        scenarioB,
        'Konservativ',
        'Wachstum',
      )

      expect(comparison.scenarioA.name).toBe('Konservativ')
      expect(comparison.scenarioB.name).toBe('Wachstum')
    })
  })

  describe('validatePortfolioHoldings', () => {
    it('should validate correct portfolio (100% allocation)', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.6 },
        { assetClass: 'bond-fund', allocation: 0.4 },
      ]

      const errors = validatePortfolioHoldings(holdings)

      expect(errors).toHaveLength(0)
    })

    it('should detect allocation over 100%', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.7 },
        { assetClass: 'bond-fund', allocation: 0.5 },
      ]

      const errors = validatePortfolioHoldings(holdings)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('100%')
      expect(errors[0]).toContain('120.0%')
    })

    it('should detect allocation under 100%', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.5 },
        { assetClass: 'bond-fund', allocation: 0.3 },
      ]

      const errors = validatePortfolioHoldings(holdings)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('100%')
      expect(errors[0]).toContain('80.0%')
    })

    it('should detect negative allocation', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 1.2 },
        { assetClass: 'bond-fund', allocation: -0.2 },
      ]

      const errors = validatePortfolioHoldings(holdings)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.includes('negativ'))).toBe(true)
    })

    it('should detect allocation over 100% for individual holding', () => {
      const holdings: PortfolioHolding[] = [{ assetClass: 'equity-fund', allocation: 1.5 }]

      const errors = validatePortfolioHoldings(holdings)

      expect(errors.some(e => e.includes('über 100%'))).toBe(true)
    })

    it('should detect empty portfolio', () => {
      const holdings: PortfolioHolding[] = []

      const errors = validatePortfolioHoldings(holdings)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('mindestens eine Position')
    })

    it('should allow allocation within tolerance', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.6001 }, // Slightly over due to rounding
        { assetClass: 'bond-fund', allocation: 0.3999 },
      ]

      const errors = validatePortfolioHoldings(holdings)

      expect(errors).toHaveLength(0) // Within default tolerance of 0.001
    })
  })

  describe('suggestPortfolioOptimization', () => {
    it('should suggest optimization for bond-heavy portfolio', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.3 },
        { assetClass: 'bond-fund', allocation: 0.7 },
      ]

      const result = suggestPortfolioOptimization(holdings)

      expect(result.currentWeightedQuote).toBeCloseTo(0.09, 10) // 30% × 30%
      expect(result.potentialImprovement).toBeCloseTo(0.21, 10) // Up to 30% possible
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions.some(s => s.includes('Aktienfonds'))).toBe(true)
    })

    it('should suggest optimization for low-exemption portfolio', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'reit', allocation: 0.5 },
        { assetClass: 'bond-fund', allocation: 0.5 },
      ]

      const result = suggestPortfolioOptimization(holdings)

      expect(result.currentWeightedQuote).toBe(0) // No exemption
      expect(result.potentialImprovement).toBe(0.3) // Full 30% improvement possible
      expect(result.suggestions.some(s => s.includes('niedriger Teilfreistellung'))).toBe(true)
    })

    it('should acknowledge already optimized portfolio', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.8 },
        { assetClass: 'mixed-fund', allocation: 0.2 },
      ]

      const result = suggestPortfolioOptimization(holdings)

      expect(result.currentWeightedQuote).toBeCloseTo(0.27, 10) // 80% × 30% + 20% × 15%
      expect(result.suggestions.some(s => s.includes('bereits gut'))).toBe(true)
    })

    it('should handle portfolio with custom asset class', () => {
      const holdings: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.6 },
        { assetClass: 'custom', allocation: 0.4, customQuote: 0.25 },
      ]

      const result = suggestPortfolioOptimization(holdings)

      expect(result.currentWeightedQuote).toBeCloseTo(0.28, 10) // 60% × 30% + 40% × 25%
      expect(result.potentialImprovement).toBeCloseTo(0.02, 10)
    })
  })

  describe('formatWeightedQuote', () => {
    it('should format quote with 1 decimal by default', () => {
      expect(formatWeightedQuote(0.285)).toBe('28.5 %')
    })

    it('should format quote with custom decimals', () => {
      expect(formatWeightedQuote(0.285, 2)).toBe('28.50 %')
      expect(formatWeightedQuote(0.285, 0)).toBe('28 %') // toFixed rounds down for .5
    })

    it('should format zero quote', () => {
      expect(formatWeightedQuote(0)).toBe('0.0 %')
    })

    it('should format 100% quote', () => {
      expect(formatWeightedQuote(1.0)).toBe('100.0 %')
    })

    it('should handle very small values', () => {
      expect(formatWeightedQuote(0.001)).toBe('0.1 %')
    })
  })

  describe('integration scenarios', () => {
    it('should calculate realistic mixed portfolio scenario', () => {
      // Realistic German investor portfolio
      const portfolio: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.5 }, // 50% MSCI World ETF
        { assetClass: 'mixed-fund', allocation: 0.2 }, // 20% Mixed funds
        { assetClass: 'bond-fund', allocation: 0.2 }, // 20% Government bonds
        { assetClass: 'real-estate-fund', allocation: 0.1 }, // 10% Real estate funds
      ]

      const result = calculateWeightedTeilfreistellungsquote(portfolio)
      const validationErrors = validatePortfolioHoldings(portfolio)

      // Should be valid
      expect(validationErrors).toHaveLength(0)

      // Weighted quote calculation
      // 50% × 30% + 20% × 15% + 20% × 0% + 10% × 60% = 15% + 3% + 0% + 6% = 24%
      expect(result.weightedQuote).toBeCloseTo(0.24, 10)

      // Tax calculation on 10,000 EUR gains
      const tax = calculateTaxOnGains(10000, 0.26375, result.weightedQuote)
      expect(tax).toBeCloseTo(2004.5, 2) // 10,000 × 76% × 26.375%
    })

    it('should compare conservative vs aggressive portfolio', () => {
      const conservative: PortfolioHolding[] = [
        { assetClass: 'bond-fund', allocation: 0.7 },
        { assetClass: 'equity-fund', allocation: 0.3 },
      ]

      const aggressive: PortfolioHolding[] = [
        { assetClass: 'equity-fund', allocation: 0.7 },
        { assetClass: 'bond-fund', allocation: 0.3 },
      ]

      const comparison = compareTaxScenarios(
        conservative,
        aggressive,
        'Konservativ (70% Anleihen)',
        'Aggressiv (70% Aktien)',
      )

      // Conservative: 30% × 30% = 9% exemption
      expect(comparison.scenarioA.weightedQuote).toBeCloseTo(0.09, 10)
      // Aggressive: 70% × 30% = 21% exemption
      expect(comparison.scenarioB.weightedQuote).toBeCloseTo(0.21, 10)

      // Aggressive should have significantly lower effective tax rate
      expect(comparison.taxSavings).toBeGreaterThan(0.03) // More than 3 percentage points
      expect(comparison.relativeImprovement).toBeGreaterThan(10) // More than 10% improvement
    })
  })
})
