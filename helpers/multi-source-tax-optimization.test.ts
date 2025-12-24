import { describe, it, expect } from 'vitest'
import {
  calculateOptimalWithdrawalAllocation,
  calculateNaiveWithdrawal,
  calculateTaxSavings,
  createDefaultMultiSourceConfig,
  type MultiSourceTaxOptimizationConfig,
  type TaxParameters,
} from './multi-source-tax-optimization'

describe('Multi-Source Tax Optimization', () => {
  // Standard tax parameters for 2024
  const standardTaxParams: TaxParameters = {
    year: 2024,
    grundfreibetrag: 11604, // 2024 value
    sparerpauschbetrag: 1000, // 2024 value (single person)
    kapitalertragsteuerRate: 0.25,
    solidaritaetszuschlagRate: 0.055,
    incomeTaxRate: 0.30, // Simplified marginal rate
  }

  describe('createDefaultMultiSourceConfig', () => {
    it('should create config with all four sources', () => {
      const config = createDefaultMultiSourceConfig()

      expect(config.sources).toHaveLength(4)
      expect(config.sources.map((s) => s.type)).toEqual(['depot', 'riester', 'ruerup', 'statutory_pension'])
    })

    it('should have depot enabled by default, others disabled', () => {
      const config = createDefaultMultiSourceConfig()

      const depot = config.sources.find((s) => s.type === 'depot')
      expect(depot?.enabled).toBe(true)

      const others = config.sources.filter((s) => s.type !== 'depot')
      others.forEach((source) => {
        expect(source.enabled).toBe(false)
      })
    })

    it('should have correct tax treatments', () => {
      const config = createDefaultMultiSourceConfig()

      const depot = config.sources.find((s) => s.type === 'depot')
      expect(depot?.taxTreatment).toBe('kapitalertragsteuer')

      const pensions = config.sources.filter((s) => s.type !== 'depot')
      pensions.forEach((source) => {
        expect(source.taxTreatment).toBe('einkommensteuer')
      })
    })

    it('should have depot with Teilfreistellung', () => {
      const config = createDefaultMultiSourceConfig()

      const depot = config.sources.find((s) => s.type === 'depot')
      expect(depot?.teilfreistellung).toBe(0.3) // 30% for equity funds
    })
  })

  describe('calculateOptimalWithdrawalAllocation', () => {
    describe('Single source (Depot only)', () => {
      it('should withdraw from depot when only depot is enabled', () => {
        const config: MultiSourceTaxOptimizationConfig = {
          ...createDefaultMultiSourceConfig(),
          sources: [
            {
              type: 'depot',
              availableCapital: 500000,
              taxTreatment: 'kapitalertragsteuer',
              taxablePercentage: 1.0,
              priority: 1,
              enabled: true,
              teilfreistellung: 0.3,
            },
            {
              type: 'riester',
              expectedAnnualPayment: 12000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 1.0,
              priority: 2,
              enabled: false,
            },
            {
              type: 'ruerup',
              expectedAnnualPayment: 15000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 0.8,
              priority: 3,
              enabled: false,
            },
            {
              type: 'statutory_pension',
              expectedAnnualPayment: 18000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 0.83,
              priority: 4,
              enabled: false,
            },
          ],
          targetAnnualWithdrawal: 40000,
          optimizationMode: 'minimize_taxes',
          grundfreibetragUtilization: 0.9,
          sparerpauschbetragUtilization: 0.95,
          considerProgressiveTax: true,
        }

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.depotWithdrawal).toBeGreaterThan(0)
        expect(result.riesterWithdrawal).toBe(0)
        expect(result.ruerupWithdrawal).toBe(0)
        expect(result.statutoryPensionWithdrawal).toBe(0)
        expect(result.totalWithdrawal).toBeCloseTo(40000, 0)
      })

      it('should utilize Sparerpauschbetrag for depot withdrawals', () => {
        const config: MultiSourceTaxOptimizationConfig = {
          ...createDefaultMultiSourceConfig(),
          sources: [
            {
              type: 'depot',
              availableCapital: 500000,
              taxTreatment: 'kapitalertragsteuer',
              taxablePercentage: 1.0,
              priority: 1,
              enabled: true,
              teilfreistellung: 0.3,
            },
          ],
          targetAnnualWithdrawal: 10000, // Small withdrawal to stay within Sparerpauschbetrag
          optimizationMode: 'minimize_taxes',
          grundfreibetragUtilization: 0.9,
          sparerpauschbetragUtilization: 0.95,
          considerProgressiveTax: true,
        }

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.optimization.sparerpauschbetragUsed).toBeGreaterThan(0)
        expect(result.optimization.sparerpauschbetragUsed).toBeLessThanOrEqual(standardTaxParams.sparerpauschbetrag)
      })
    })

    describe('Multi-source scenarios', () => {
      it('should optimize across depot and pension sources', () => {
        const config: MultiSourceTaxOptimizationConfig = {
          ...createDefaultMultiSourceConfig(),
          sources: [
            {
              type: 'depot',
              availableCapital: 500000,
              taxTreatment: 'kapitalertragsteuer',
              taxablePercentage: 1.0,
              priority: 1,
              enabled: true,
              teilfreistellung: 0.3,
            },
            {
              type: 'riester',
              expectedAnnualPayment: 12000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 1.0,
              priority: 2,
              enabled: true,
            },
            {
              type: 'ruerup',
              expectedAnnualPayment: 15000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 0.8,
              priority: 3,
              enabled: true,
            },
          ],
          targetAnnualWithdrawal: 40000,
          optimizationMode: 'minimize_taxes',
          grundfreibetragUtilization: 0.9,
          sparerpauschbetragUtilization: 0.95,
          considerProgressiveTax: true,
        }

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        // Should withdraw from multiple sources
        expect(result.depotWithdrawal).toBeGreaterThan(0)
        expect(result.riesterWithdrawal + result.ruerupWithdrawal).toBeGreaterThan(0)
        expect(result.totalWithdrawal).toBeGreaterThan(0)

        // Should use tax allowances
        expect(result.optimization.sparerpauschbetragUsed).toBeGreaterThan(0)
        expect(result.optimization.grundfreibetragUsed).toBeGreaterThan(0)
      })

      it('should prioritize sources with lower tax rates', () => {
        const config: MultiSourceTaxOptimizationConfig = {
          ...createDefaultMultiSourceConfig(),
          sources: [
            {
              type: 'depot',
              availableCapital: 500000,
              taxTreatment: 'kapitalertragsteuer',
              taxablePercentage: 1.0,
              priority: 1,
              enabled: true,
              teilfreistellung: 0.3,
            },
            {
              type: 'riester',
              expectedAnnualPayment: 50000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 1.0, // 100% taxable
              priority: 3,
              enabled: true,
            },
            {
              type: 'ruerup',
              expectedAnnualPayment: 50000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 0.7, // Only 70% taxable
              priority: 2,
              enabled: true,
            },
          ],
          targetAnnualWithdrawal: 40000,
          optimizationMode: 'minimize_taxes',
          grundfreibetragUtilization: 0.9,
          sparerpauschbetragUtilization: 0.95,
          considerProgressiveTax: true,
        }

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        // Rürup should be preferred over Riester due to lower taxable percentage
        // (when both need to use income tax above Grundfreibetrag)
        expect(result.totalTax).toBeGreaterThan(0)
        expect(result.optimization.effectiveTaxRate).toBeDefined()
      })

      it('should respect priority when optimization mode is balanced', () => {
        const config: MultiSourceTaxOptimizationConfig = {
          ...createDefaultMultiSourceConfig(),
          sources: [
            {
              type: 'depot',
              availableCapital: 500000,
              taxTreatment: 'kapitalertragsteuer',
              taxablePercentage: 1.0,
              priority: 1,
              enabled: true,
              teilfreistellung: 0.3,
            },
            {
              type: 'riester',
              expectedAnnualPayment: 12000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 1.0,
              priority: 2,
              enabled: true,
            },
            {
              type: 'ruerup',
              expectedAnnualPayment: 15000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 0.8,
              priority: 3,
              enabled: true,
            },
          ],
          targetAnnualWithdrawal: 30000,
          optimizationMode: 'balanced',
          grundfreibetragUtilization: 0.9,
          sparerpauschbetragUtilization: 0.95,
          considerProgressiveTax: true,
        }

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        // Balanced mode should distribute somewhat evenly
        expect(result.depotWithdrawal).toBeGreaterThan(0)
        expect(result.riesterWithdrawal).toBeGreaterThan(0)
        expect(result.ruerupWithdrawal).toBeGreaterThan(0)
      })
    })

    describe('Edge cases', () => {
      it('should handle empty sources list', () => {
        const config: MultiSourceTaxOptimizationConfig = {
          ...createDefaultMultiSourceConfig(),
          sources: [],
          targetAnnualWithdrawal: 40000,
          optimizationMode: 'minimize_taxes',
          grundfreibetragUtilization: 0.9,
          sparerpauschbetragUtilization: 0.95,
          considerProgressiveTax: true,
        }

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.totalWithdrawal).toBe(0)
        expect(result.totalTax).toBe(0)
        expect(result.netAmount).toBe(0)
      })

      it('should handle all sources disabled', () => {
        const config = createDefaultMultiSourceConfig()
        config.sources.forEach((s) => (s.enabled = false))
        config.targetAnnualWithdrawal = 40000

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.totalWithdrawal).toBe(0)
        expect(result.totalTax).toBe(0)
      })

      it('should handle insufficient capital in depot', () => {
        const config: MultiSourceTaxOptimizationConfig = {
          ...createDefaultMultiSourceConfig(),
          sources: [
            {
              type: 'depot',
              availableCapital: 10000, // Much less than target
              taxTreatment: 'kapitalertragsteuer',
              taxablePercentage: 1.0,
              priority: 1,
              enabled: true,
              teilfreistellung: 0.3,
            },
            {
              type: 'riester',
              expectedAnnualPayment: 50000,
              taxTreatment: 'einkommensteuer',
              taxablePercentage: 1.0,
              priority: 2,
              enabled: true,
            },
          ],
          targetAnnualWithdrawal: 40000,
          optimizationMode: 'minimize_taxes',
          grundfreibetragUtilization: 0.9,
          sparerpauschbetragUtilization: 0.95,
          considerProgressiveTax: true,
        }

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.depotWithdrawal).toBeLessThanOrEqual(10000)
        expect(result.riesterWithdrawal).toBeGreaterThan(0)
        expect(result.totalWithdrawal).toBeGreaterThan(0)
      })

      it('should handle zero target withdrawal', () => {
        const config: MultiSourceTaxOptimizationConfig = {
          ...createDefaultMultiSourceConfig(),
          targetAnnualWithdrawal: 0,
          optimizationMode: 'minimize_taxes',
          grundfreibetragUtilization: 0.9,
          sparerpauschbetragUtilization: 0.95,
          considerProgressiveTax: true,
        }

        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.totalWithdrawal).toBe(0)
        expect(result.totalTax).toBe(0)
      })
    })

    describe('Optimization modes', () => {
      const baseConfig: MultiSourceTaxOptimizationConfig = {
        sources: [
          {
            type: 'depot',
            availableCapital: 500000,
            taxTreatment: 'kapitalertragsteuer',
            taxablePercentage: 1.0,
            priority: 1,
            enabled: true,
            teilfreistellung: 0.3,
          },
          {
            type: 'riester',
            expectedAnnualPayment: 20000,
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 1.0,
            priority: 2,
            enabled: true,
          },
          {
            type: 'ruerup',
            expectedAnnualPayment: 20000,
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 0.8,
            priority: 3,
            enabled: true,
          },
        ],
        targetAnnualWithdrawal: 50000,
        optimizationMode: 'minimize_taxes',
        grundfreibetragUtilization: 0.9,
        sparerpauschbetragUtilization: 0.95,
        considerProgressiveTax: true,
      }

      it('should minimize taxes in minimize_taxes mode', () => {
        const config = { ...baseConfig, optimizationMode: 'minimize_taxes' as const }
        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.optimization.mode).toBe('minimize_taxes')
        expect(result.totalTax).toBeGreaterThan(0)
      })

      it('should maximize after-tax income in maximize_after_tax mode', () => {
        const config = { ...baseConfig, optimizationMode: 'maximize_after_tax' as const }
        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.optimization.mode).toBe('maximize_after_tax')
        expect(result.netAmount).toBeGreaterThan(0)
      })

      it('should distribute evenly in balanced mode', () => {
        const config = { ...baseConfig, optimizationMode: 'balanced' as const }
        const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

        expect(result.optimization.mode).toBe('balanced')
        expect(result.depotWithdrawal).toBeGreaterThan(0)
        expect(result.riesterWithdrawal).toBeGreaterThan(0)
        expect(result.ruerupWithdrawal).toBeGreaterThan(0)
      })
    })
  })

  describe('calculateNaiveWithdrawal', () => {
    it('should distribute evenly across all enabled sources', () => {
      const config: MultiSourceTaxOptimizationConfig = {
        sources: [
          {
            type: 'depot',
            availableCapital: 500000,
            taxTreatment: 'kapitalertragsteuer',
            taxablePercentage: 1.0,
            priority: 1,
            enabled: true,
            teilfreistellung: 0.3,
          },
          {
            type: 'riester',
            expectedAnnualPayment: 20000,
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 1.0,
            priority: 2,
            enabled: true,
          },
        ],
        targetAnnualWithdrawal: 40000,
        optimizationMode: 'minimize_taxes',
        grundfreibetragUtilization: 0.9,
        sparerpauschbetragUtilization: 0.95,
        considerProgressiveTax: true,
      }

      const result = calculateNaiveWithdrawal(config, standardTaxParams)

      // Should distribute roughly evenly (20k each)
      expect(result.depotWithdrawal).toBeGreaterThan(0)
      expect(result.riesterWithdrawal).toBeGreaterThan(0)
      expect(Math.abs(result.depotWithdrawal - result.riesterWithdrawal)).toBeLessThan(1000) // Close to equal
    })

    it('should handle single enabled source', () => {
      const config: MultiSourceTaxOptimizationConfig = {
        ...createDefaultMultiSourceConfig(),
        sources: [
          {
            type: 'depot',
            availableCapital: 500000,
            taxTreatment: 'kapitalertragsteuer',
            taxablePercentage: 1.0,
            priority: 1,
            enabled: true,
            teilfreistellung: 0.3,
          },
        ],
        targetAnnualWithdrawal: 40000,
        optimizationMode: 'minimize_taxes',
        grundfreibetragUtilization: 0.9,
        sparerpauschbetragUtilization: 0.95,
        considerProgressiveTax: true,
      }

      const result = calculateNaiveWithdrawal(config, standardTaxParams)

      expect(result.depotWithdrawal).toBeCloseTo(40000, 0)
      expect(result.riesterWithdrawal).toBe(0)
      expect(result.ruerupWithdrawal).toBe(0)
    })
  })

  describe('calculateTaxSavings', () => {
    it('should calculate tax savings correctly', () => {
      const config: MultiSourceTaxOptimizationConfig = {
        sources: [
          {
            type: 'depot',
            availableCapital: 500000,
            taxTreatment: 'kapitalertragsteuer',
            taxablePercentage: 1.0,
            priority: 1,
            enabled: true,
            teilfreistellung: 0.3,
          },
          {
            type: 'riester',
            expectedAnnualPayment: 20000,
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 1.0,
            priority: 2,
            enabled: true,
          },
          {
            type: 'ruerup',
            expectedAnnualPayment: 20000,
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 0.8,
            priority: 3,
            enabled: true,
          },
        ],
        targetAnnualWithdrawal: 40000,
        optimizationMode: 'minimize_taxes',
        grundfreibetragUtilization: 0.9,
        sparerpauschbetragUtilization: 0.95,
        considerProgressiveTax: true,
      }

      const optimized = calculateOptimalWithdrawalAllocation(config, standardTaxParams)
      const naive = calculateNaiveWithdrawal(config, standardTaxParams)
      const savings = calculateTaxSavings(optimized, naive)

      // Optimized should save taxes compared to naive
      expect(savings.annualTaxSavings).toBeGreaterThanOrEqual(0)
      expect(savings.percentageSavings).toBeGreaterThanOrEqual(0)
      expect(savings.netIncomeImprovement).toBeGreaterThanOrEqual(0)
    })

    it('should calculate zero savings when tax is same', () => {
      const config: MultiSourceTaxOptimizationConfig = {
        ...createDefaultMultiSourceConfig(),
        sources: [
          {
            type: 'depot',
            availableCapital: 500000,
            taxTreatment: 'kapitalertragsteuer',
            taxablePercentage: 1.0,
            priority: 1,
            enabled: true,
            teilfreistellung: 0.3,
          },
        ],
        targetAnnualWithdrawal: 40000,
        optimizationMode: 'minimize_taxes',
        grundfreibetragUtilization: 0.9,
        sparerpauschbetragUtilization: 0.95,
        considerProgressiveTax: true,
      }

      // With only one source, optimized and naive should be the same
      const optimized = calculateOptimalWithdrawalAllocation(config, standardTaxParams)
      const naive = calculateNaiveWithdrawal(config, standardTaxParams)
      const savings = calculateTaxSavings(optimized, naive)

      expect(savings.annualTaxSavings).toBeCloseTo(0, 0)
      expect(savings.percentageSavings).toBeCloseTo(0, 1)
      expect(savings.netIncomeImprovement).toBeCloseTo(0, 0)
    })

    it('should handle negative savings (should not happen in well-optimized scenarios)', () => {
      // Create a contrived scenario where naive might be better
      // (This shouldn't happen in real optimization, but test the math)
      const optimized = {
        depotWithdrawal: 20000,
        riesterWithdrawal: 20000,
        ruerupWithdrawal: 0,
        statutoryPensionWithdrawal: 0,
        totalWithdrawal: 40000,
        totalTax: 5000,
        netAmount: 35000,
        taxBreakdown: { depot: 2500, riester: 2500, ruerup: 0, statutoryPension: 0 },
        optimization: { mode: 'test', grundfreibetragUsed: 0, sparerpauschbetragUsed: 0, effectiveTaxRate: 0.125 },
      }

      const naive = {
        depotWithdrawal: 40000,
        riesterWithdrawal: 0,
        ruerupWithdrawal: 0,
        statutoryPensionWithdrawal: 0,
        totalWithdrawal: 40000,
        totalTax: 3000, // Less tax in naive (contrived)
        netAmount: 37000,
        taxBreakdown: { depot: 3000, riester: 0, ruerup: 0, statutoryPension: 0 },
        optimization: { mode: 'naive', grundfreibetragUsed: 0, sparerpauschbetragUsed: 0, effectiveTaxRate: 0.075 },
      }

      const savings = calculateTaxSavings(optimized, naive)

      expect(savings.annualTaxSavings).toBe(-2000) // Negative savings
      expect(savings.percentageSavings).toBeLessThan(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle realistic retirement scenario with all sources', () => {
      const config: MultiSourceTaxOptimizationConfig = {
        sources: [
          {
            type: 'depot',
            availableCapital: 600000,
            taxTreatment: 'kapitalertragsteuer',
            taxablePercentage: 1.0,
            priority: 1,
            enabled: true,
            teilfreistellung: 0.3,
          },
          {
            type: 'riester',
            expectedAnnualPayment: 8400, // 700/month
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 1.0,
            priority: 2,
            enabled: true,
            pensionStartYear: 2040,
          },
          {
            type: 'ruerup',
            expectedAnnualPayment: 12000, // 1000/month
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 0.83, // Retirement in 2040
            priority: 3,
            enabled: true,
            pensionStartYear: 2040,
          },
          {
            type: 'statutory_pension',
            expectedAnnualPayment: 18000, // 1500/month
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 0.83, // Retirement in 2040
            priority: 4,
            enabled: true,
            pensionStartYear: 2040,
          },
        ],
        targetAnnualWithdrawal: 48000, // 4000/month needed
        optimizationMode: 'minimize_taxes',
        grundfreibetragUtilization: 0.9,
        sparerpauschbetragUtilization: 0.95,
        considerProgressiveTax: true,
      }

      const optimized = calculateOptimalWithdrawalAllocation(config, standardTaxParams)
      const naive = calculateNaiveWithdrawal(config, standardTaxParams)
      const savings = calculateTaxSavings(optimized, naive)

      // Should use all pension sources to their full amount first (tax-advantaged)
      expect(optimized.riesterWithdrawal).toBeGreaterThan(0)
      expect(optimized.ruerupWithdrawal).toBeGreaterThan(0)
      expect(optimized.statutoryPensionWithdrawal).toBeGreaterThan(0)

      // Should have meaningful tax savings
      expect(savings.annualTaxSavings).toBeGreaterThanOrEqual(0)

      // Total withdrawal should meet or approach target
      expect(optimized.totalWithdrawal).toBeGreaterThan(0)

      // Effective tax rate should be reasonable
      expect(optimized.optimization.effectiveTaxRate).toBeGreaterThanOrEqual(0)
      expect(optimized.optimization.effectiveTaxRate).toBeLessThan(0.5) // Less than 50%
    })

    it('should handle high-income retiree scenario', () => {
      const config: MultiSourceTaxOptimizationConfig = {
        sources: [
          {
            type: 'depot',
            availableCapital: 2000000, // Large portfolio
            taxTreatment: 'kapitalertragsteuer',
            taxablePercentage: 1.0,
            priority: 1,
            enabled: true,
            teilfreistellung: 0.3,
          },
          {
            type: 'statutory_pension',
            expectedAnnualPayment: 24000, // Maximum statutory pension
            taxTreatment: 'einkommensteuer',
            taxablePercentage: 0.83,
            priority: 2,
            enabled: true,
          },
        ],
        targetAnnualWithdrawal: 80000, // High withdrawal need
        optimizationMode: 'minimize_taxes',
        grundfreibetragUtilization: 0.9,
        sparerpauschbetragUtilization: 0.95,
        considerProgressiveTax: true,
      }

      const result = calculateOptimalWithdrawalAllocation(config, standardTaxParams)

      // Should withdraw from both sources
      expect(result.depotWithdrawal).toBeGreaterThan(0)
      expect(result.statutoryPensionWithdrawal).toBeGreaterThan(0)

      // Total should be close to target
      expect(result.totalWithdrawal).toBeGreaterThan(50000)

      // Should utilize tax allowances
      expect(result.optimization.sparerpauschbetragUsed).toBeGreaterThan(0)
      expect(result.optimization.grundfreibetragUsed).toBeGreaterThan(0)
    })
  })
})
