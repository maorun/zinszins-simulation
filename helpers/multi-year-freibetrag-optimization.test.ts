import { describe, it, expect } from 'vitest'
import {
  optimizeMultiYearFreibetrag,
  compareFreibetragOptimizationHorizons,
  type MultiYearFreibetragOptimizationConfig,
} from './multi-year-freibetrag-optimization'

describe('Multi-Year Tax Allowance Optimization', () => {
  const baseConfig: MultiYearFreibetragOptimizationConfig = {
    totalCapitalGains: 50000,
    currentPortfolioValue: 200000,
    annualReturnRate: 0, // Retirement scenario: portfolio not growing, just realizing existing gains
    optimizationHorizonYears: 10,
    startYear: 2024,
    freibetragPerYear: {
      2024: 2000,
      2025: 2000,
      2026: 2000,
      2027: 2000,
      2028: 2000,
      2029: 2000,
      2030: 2000,
      2031: 2000,
      2032: 2000,
      2033: 2000,
    },
    capitalGainsTaxRate: 0.26375,
    teilfreistellung: 0.3,
  }

  describe('optimizeMultiYearFreibetrag', () => {
    it('should generate an optimization schedule for the specified horizon', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      expect(result.optimalRealizationSchedule).toHaveLength(10)
      expect(result.optimalRealizationSchedule[0].year).toBe(2024)
      expect(result.optimalRealizationSchedule[9].year).toBe(2033)
    })

    it('should provide positive tax savings compared to naive strategy', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      expect(result.totalTaxSavings).toBeGreaterThan(0)
      expect(result.taxSavingsPercentage).toBeGreaterThan(0)
      expect(result.summary.naiveStrategyTax).toBeGreaterThan(result.summary.optimizedStrategyTax)
    })

    it('should not exceed available Freibetrag in any year', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      result.optimalRealizationSchedule.forEach(entry => {
        const taxableRealization = entry.recommendedRealization * (1 - baseConfig.teilfreistellung)
        // Allow for small floating point differences
        expect(taxableRealization).toBeLessThanOrEqual(entry.availableFreibetrag + 0.01)
      })
    })

    it('should distribute all gains within the optimization horizon when possible', () => {
      // Use smaller gains that fit within horizon
      const config = {
        ...baseConfig,
        totalCapitalGains: 20000,
      }

      const result = optimizeMultiYearFreibetrag(config)

      const totalRealized = result.optimalRealizationSchedule.reduce(
        (sum, entry) => sum + entry.recommendedRealization,
        0,
      )

      expect(totalRealized).toBeCloseTo(config.totalCapitalGains, 0)
    })

    it('should account for Vorabpauschale when calculating available Freibetrag', () => {
      // Use a growing portfolio scenario to test Vorabpauschale calculation
      const growingConfig = {
        ...baseConfig,
        annualReturnRate: 0.05, // Portfolio is growing
      }

      const result = optimizeMultiYearFreibetrag(growingConfig)

      result.optimalRealizationSchedule.forEach(entry => {
        expect(entry.vorabpauschale).toBeGreaterThanOrEqual(0)
        // With portfolio growth, available Freibetrag should be reduced by Vorabpauschale
        const vorabpauschaleImpact = entry.vorabpauschale * (1 - growingConfig.teilfreistellung)
        const baseFreibetrag = growingConfig.freibetragPerYear[entry.year] || 2000
        // Available Freibetrag can be negative if Vorabpauschale exceeds base Freibetrag
        expect(entry.availableFreibetrag).toBeLessThanOrEqual(baseFreibetrag)
        expect(entry.availableFreibetrag).toBe(Math.max(0, baseFreibetrag - vorabpauschaleImpact))
      })
    })

    it('should work with couples (doubled Freibetrag)', () => {
      const coupleConfig = {
        ...baseConfig,
        freibetragPerYear: {
          2024: 4000,
          2025: 4000,
          2026: 4000,
          2027: 4000,
          2028: 4000,
          2029: 4000,
          2030: 4000,
          2031: 4000,
          2032: 4000,
          2033: 4000,
        },
      }

      const result = optimizeMultiYearFreibetrag(coupleConfig)

      expect(result.totalTaxSavings).toBeGreaterThan(0)
      // Couples should be able to distribute gains more efficiently
      expect(result.summary.averageFreibetragUtilizationRate).toBeGreaterThan(0)
    })

    it('should handle expected annual distributions reducing available Freibetrag', () => {
      const configWithDistributions = {
        ...baseConfig,
        expectedAnnualDistributions: 500,
      }

      const result = optimizeMultiYearFreibetrag(configWithDistributions)

      result.optimalRealizationSchedule.forEach(entry => {
        // Distributions should reduce available Freibetrag
        const expectedReduction = 500 * (1 - baseConfig.teilfreistellung)
        const baseFreibetrag = baseConfig.freibetragPerYear[entry.year] || 2000
        expect(entry.availableFreibetrag).toBeLessThan(baseFreibetrag - expectedReduction + 1)
      })
    })

    it('should generate concrete recommendations', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      expect(result.recommendations).toBeInstanceOf(Array)
      expect(result.recommendations.length).toBeGreaterThan(0)

      // Check that recommendations include years and amounts
      const hasYearRecommendation = result.recommendations.some(rec => /\d{4}:/.test(rec))
      expect(hasYearRecommendation).toBe(true)

      // Check for proper German formatting
      const hasCurrencyFormat = result.recommendations.some(rec => rec.includes('€'))
      expect(hasCurrencyFormat).toBe(true)
    })

    it('should warn when not all gains can be distributed within horizon', () => {
      const config = {
        ...baseConfig,
        totalCapitalGains: 100000, // Very large amount
        optimizationHorizonYears: 3, // Short horizon
      }

      const result = optimizeMultiYearFreibetrag(config)

      const hasWarning = result.recommendations.some(rec => rec.includes('⚠️'))
      expect(hasWarning).toBe(true)
    })

    it('should calculate cumulative tax savings correctly', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      let expectedCumulative = 0
      result.optimalRealizationSchedule.forEach(entry => {
        expectedCumulative += entry.taxSavings
        expect(entry.cumulativeTaxSavings).toBeCloseTo(expectedCumulative, 2)
      })
    })

    it('should handle zero capital gains', () => {
      const config = {
        ...baseConfig,
        totalCapitalGains: 0,
      }

      const result = optimizeMultiYearFreibetrag(config)

      expect(result.totalTaxSavings).toBe(0)
      expect(result.summary.naiveStrategyTax).toBe(0)
      expect(result.summary.optimizedStrategyTax).toBe(0)
    })

    it('should handle very small capital gains efficiently', () => {
      const config = {
        ...baseConfig,
        totalCapitalGains: 500,
      }

      const result = optimizeMultiYearFreibetrag(config)

      // All gains should be covered by first year's Freibetrag
      expect(result.optimalRealizationSchedule[0].recommendedRealization).toBeCloseTo(500, 0)
      expect(result.totalTaxSavings).toBeGreaterThanOrEqual(0)
    })

    it('should respect Teilfreistellung in calculations', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      result.optimalRealizationSchedule.forEach(entry => {
        if (entry.recommendedRealization > 0) {
          // Taxable amount should be (1 - Teilfreistellung) of realization
          const taxableAmount = entry.recommendedRealization * (1 - baseConfig.teilfreistellung)
          expect(taxableAmount).toBeGreaterThan(0)
          expect(taxableAmount).toBeLessThan(entry.recommendedRealization)
        }
      })
    })

    it('should work with variable Freibetrag per year', () => {
      const config = {
        ...baseConfig,
        freibetragPerYear: {
          2024: 2000,
          2025: 2500, // Increased in 2025
          2026: 2500,
          2027: 3000, // Further increased in 2027
          2028: 3000,
          2029: 3000,
          2030: 3000,
          2031: 3000,
          2032: 3000,
          2033: 3000,
        },
      }

      const result = optimizeMultiYearFreibetrag(config)

      // Should utilize increased Freibetrag in later years
      expect(result.totalTaxSavings).toBeGreaterThan(0)
      expect(result.optimalRealizationSchedule[2].availableFreibetrag).toBeGreaterThan(
        result.optimalRealizationSchedule[0].availableFreibetrag,
      )
    })
  })

  describe('compareFreibetragOptimizationHorizons', () => {
    const baseConfigWithoutHorizon: Omit<MultiYearFreibetragOptimizationConfig, 'optimizationHorizonYears'> = {
      totalCapitalGains: 50000,
      currentPortfolioValue: 200000,
      annualReturnRate: 0, // Retirement scenario
      startYear: 2024,
      freibetragPerYear: Object.fromEntries(Array.from({ length: 25 }, (_, i) => [2024 + i, 2000])),
      capitalGainsTaxRate: 0.26375,
      teilfreistellung: 0.3,
    }

    it('should compare 5, 10, and 20 year horizons', () => {
      const result = compareFreibetragOptimizationHorizons(baseConfigWithoutHorizon)

      expect(result.horizons).toHaveLength(3)
      expect(result.horizons[0].years).toBe(5)
      expect(result.horizons[1].years).toBe(10)
      expect(result.horizons[2].years).toBe(20)
    })

    it('should show increasing tax savings with longer horizons', () => {
      const result = compareFreibetragOptimizationHorizons(baseConfigWithoutHorizon)

      // Longer horizons should generally provide more total tax savings
      expect(result.horizons[1].taxSavings).toBeGreaterThanOrEqual(result.horizons[0].taxSavings)
      expect(result.horizons[2].taxSavings).toBeGreaterThanOrEqual(result.horizons[1].taxSavings)
    })

    it('should recommend a specific horizon', () => {
      const result = compareFreibetragOptimizationHorizons(baseConfigWithoutHorizon)

      expect([5, 10, 20]).toContain(result.recommendedHorizon)
    })

    it('should include utilization rates for all horizons', () => {
      const result = compareFreibetragOptimizationHorizons(baseConfigWithoutHorizon)

      result.horizons.forEach(horizon => {
        expect(horizon.utilizationRate).toBeGreaterThanOrEqual(0)
        expect(horizon.utilizationRate).toBeLessThanOrEqual(1)
      })
    })

    it('should handle small capital gains (recommend shorter horizon)', () => {
      const config = {
        ...baseConfigWithoutHorizon,
        totalCapitalGains: 5000, // Small amount
      }

      const result = compareFreibetragOptimizationHorizons(config)

      // Should likely recommend shorter horizon for small amounts
      expect(result.recommendedHorizon).toBeLessThanOrEqual(10)
    })

    it('should handle large capital gains (likely recommend longer horizon)', () => {
      const config = {
        ...baseConfigWithoutHorizon,
        totalCapitalGains: 100000, // Large amount
      }

      const result = compareFreibetragOptimizationHorizons(config)

      // All horizons should show tax savings
      result.horizons.forEach(horizon => {
        expect(horizon.taxSavings).toBeGreaterThan(0)
      })
    })
  })

  describe('Edge cases and validation', () => {
    it('should handle Basiszins configuration for accurate Vorabpauschale', () => {
      const config = {
        ...baseConfig,
        annualReturnRate: 0.05, // Portfolio growing to generate Vorabpauschale
        basiszinsConfiguration: {
          2024: { year: 2024, rate: 0.0255, source: 'manual' as const },
          2025: { year: 2025, rate: 0.0255, source: 'manual' as const },
          2026: { year: 2026, rate: 0.03, source: 'manual' as const },
        },
      }

      const result = optimizeMultiYearFreibetrag(config)

      expect(result.optimalRealizationSchedule).toHaveLength(10)
      // Vorabpauschale should reflect custom rates
      expect(result.optimalRealizationSchedule[0].vorabpauschale).toBeGreaterThan(0)
    })

    it('should handle negative portfolio value (edge case)', () => {
      const config = {
        ...baseConfig,
        currentPortfolioValue: 0,
      }

      const result = optimizeMultiYearFreibetrag(config)

      // Should still work, just with no Vorabpauschale
      expect(result.optimalRealizationSchedule).toHaveLength(10)
      result.optimalRealizationSchedule.forEach(entry => {
        expect(entry.vorabpauschale).toBe(0)
      })
    })

    it('should handle 100% Teilfreistellung (fully exempt funds)', () => {
      const config = {
        ...baseConfig,
        teilfreistellung: 1.0,
      }

      const result = optimizeMultiYearFreibetrag(config)

      // With full exemption, no tax savings possible
      expect(result.totalTaxSavings).toBe(0)
      expect(result.summary.naiveStrategyTax).toBe(0)
    })

    it('should handle 0% Teilfreistellung (no exemption)', () => {
      const config = {
        ...baseConfig,
        teilfreistellung: 0,
      }

      const result = optimizeMultiYearFreibetrag(config)

      // Should still provide optimization
      expect(result.totalTaxSavings).toBeGreaterThan(0)
    })

    it('should maintain precision with very large numbers', () => {
      const config = {
        ...baseConfig,
        totalCapitalGains: 1000000,
        currentPortfolioValue: 5000000,
      }

      const result = optimizeMultiYearFreibetrag(config)

      expect(result.totalTaxSavings).toBeGreaterThan(0)
      expect(Number.isFinite(result.totalTaxSavings)).toBe(true)
    })
  })

  describe('German language recommendations', () => {
    it('should generate recommendations in German', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      const hasGermanText = result.recommendations.some(
        rec => rec.includes('Realisieren Sie') || rec.includes('Steuern zu sparen'),
      )
      expect(hasGermanText).toBe(true)
    })

    it('should use German currency formatting', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      // German format uses . for thousands and , for decimals
      const hasGermanFormat = result.recommendations.some(rec => /\d+\.\d+\s*€|\d+\s*€/.test(rec))
      expect(hasGermanFormat).toBe(true)
    })

    it('should include year in recommendations', () => {
      const result = optimizeMultiYearFreibetrag(baseConfig)

      const hasYear = result.recommendations.some(rec => /202\d/.test(rec))
      expect(hasYear).toBe(true)
    })
  })
})
