import { describe, it, expect } from 'vitest'
import {
  compareRuerupVsEtf,
  createDefaultRuerupVsEtfConfig,
  type RuerupVsEtfComparisonConfig,
} from './ruerup-vs-etf-comparison'

describe('Rürup vs. ETF Comparison', () => {
  describe('createDefaultRuerupVsEtfConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultRuerupVsEtfConfig()
      
      expect(config.annualContribution).toBe(10000)
      expect(config.contributionYears).toBe(30)
      expect(config.expectedReturn).toBe(0.07)
      expect(config.contributionPhaseTaxRate).toBe(0.42)
      expect(config.retirementPhaseTaxRate).toBe(0.25)
      expect(config.civilStatus).toBe('single')
      expect(config.teilfreistellungsquote).toBe(0.30)
    })
  })

  describe('compareRuerupVsEtf', () => {
    it('should calculate both Rürup and ETF results', () => {
      const config = createDefaultRuerupVsEtfConfig()
      const comparison = compareRuerupVsEtf(config)
      
      expect(comparison.ruerup).toBeDefined()
      expect(comparison.etf).toBeDefined()
      expect(comparison.comparison).toBeDefined()
    })

    it('should calculate accumulation phase correctly for Rürup', () => {
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        contributionYears: 10,
        annualContribution: 10000,
      }
      
      const comparison = compareRuerupVsEtf(config)
      const ruerup = comparison.ruerup.accumulation
      
      // Should have 10 years of contributions
      expect(ruerup.yearlyBreakdown).toHaveLength(10)
      
      // Total contributions should be 10 * 10000 = 100000
      expect(ruerup.totalContributions).toBe(100000)
      
      // Should have tax savings (negative tax effect)
      expect(ruerup.totalTaxEffect).toBeLessThan(0)
      
      // Net contributions should be less than total (due to tax savings)
      expect(ruerup.netContributions).toBeLessThan(ruerup.totalContributions)
      
      // Final value should be more than contributions due to returns
      expect(ruerup.finalValue).toBeGreaterThan(ruerup.totalContributions)
    })

    it('should calculate accumulation phase correctly for ETF', () => {
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        contributionYears: 10,
        annualContribution: 10000,
      }
      
      const comparison = compareRuerupVsEtf(config)
      const etf = comparison.etf.accumulation
      
      // Should have 10 years of contributions
      expect(etf.yearlyBreakdown).toHaveLength(10)
      
      // Total contributions should be 10 * 10000 = 100000
      expect(etf.totalContributions).toBe(100000)
      
      // Should have tax paid (positive tax effect)
      expect(etf.totalTaxEffect).toBeGreaterThanOrEqual(0)
      
      // Net contributions equal total (no tax deduction for ETF)
      expect(etf.netContributions).toBe(etf.totalContributions)
      
      // Final value should be more than contributions due to returns
      expect(etf.finalValue).toBeGreaterThan(etf.totalContributions)
    })

    it('should calculate retirement phase for both options', () => {
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        contributionYears: 10,
        retirementYears: 20,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      // Rürup retirement
      expect(comparison.ruerup.retirement.yearlyBreakdown).toHaveLength(20)
      expect(comparison.ruerup.retirement.totalGrossWithdrawals).toBeGreaterThan(0)
      expect(comparison.ruerup.retirement.totalTaxPaid).toBeGreaterThan(0)
      expect(comparison.ruerup.retirement.totalNetReceived).toBeGreaterThan(0)
      expect(comparison.ruerup.retirement.finalRemainingValue).toBe(0) // Annuity
      
      // ETF retirement
      expect(comparison.etf.retirement.yearlyBreakdown).toHaveLength(20)
      expect(comparison.etf.retirement.totalGrossWithdrawals).toBeGreaterThan(0)
      expect(comparison.etf.retirement.totalNetReceived).toBeGreaterThan(0)
    })

    it('should provide recommendation based on net benefit', () => {
      const config = createDefaultRuerupVsEtfConfig()
      const comparison = compareRuerupVsEtf(config)
      
      expect(['ruerup', 'etf', 'similar']).toContain(comparison.comparison.recommendation)
      expect(comparison.comparison.advantagePercentage).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(comparison.comparison.keyFactors)).toBe(true)
    })

    it('should favor Rürup when contribution tax rate is high and retirement tax rate is low', () => {
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        contributionPhaseTaxRate: 0.45, // Very high tax rate during work
        retirementPhaseTaxRate: 0.20,   // Low tax rate in retirement
        contributionYears: 30,
        retirementYears: 25,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      // Rürup should benefit more from high tax deduction
      expect(comparison.ruerup.accumulation.totalTaxEffect).toBeLessThan(
        comparison.etf.accumulation.totalTaxEffect
      )
    })

    it('should consider Teilfreistellung advantage for ETF', () => {
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        teilfreistellungsquote: 0.30, // 30% tax-free for equity funds
        contributionYears: 30,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      // ETF should benefit from Teilfreistellung during accumulation
      expect(comparison.etf.accumulation.totalTaxEffect).toBeGreaterThanOrEqual(0)
    })

    it('should show ETF has inheritance value while Rürup does not', () => {
      const config = createDefaultRuerupVsEtfConfig()
      const comparison = compareRuerupVsEtf(config)
      
      // Rürup is an annuity - no remaining value
      expect(comparison.ruerup.retirement.finalRemainingValue).toBe(0)
      
      // ETF may have remaining value (depends on withdrawal strategy)
      expect(comparison.etf.retirement.finalRemainingValue).toBeGreaterThanOrEqual(0)
    })

    it('should calculate effective return rates', () => {
      const config = createDefaultRuerupVsEtfConfig()
      const comparison = compareRuerupVsEtf(config)
      
      expect(comparison.ruerup.overall.effectiveReturnRate).toBeGreaterThan(0)
      expect(comparison.etf.overall.effectiveReturnRate).toBeGreaterThan(0)
    })

    it('should handle married status for Rürup limits', () => {
      const configSingle = createDefaultRuerupVsEtfConfig()
      const configMarried: RuerupVsEtfComparisonConfig = {
        ...configSingle,
        civilStatus: 'married',
        annualContribution: 40000, // Higher contribution
      }
      
      const comparisonSingle = compareRuerupVsEtf(configSingle)
      const comparisonMarried = compareRuerupVsEtf(configMarried)
      
      // Married couples should get higher tax deductions
      expect(Math.abs(comparisonMarried.ruerup.accumulation.totalTaxEffect)).toBeGreaterThan(
        Math.abs(comparisonSingle.ruerup.accumulation.totalTaxEffect)
      )
    })

    it('should account for TER in ETF calculations', () => {
      const configLowTer: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        ter: 0.001, // 0.1% TER
        contributionYears: 30,
      }
      
      const configHighTer: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        ter: 0.02, // 2% TER
        contributionYears: 30,
      }
      
      const comparisonLowTer = compareRuerupVsEtf(configLowTer)
      const comparisonHighTer = compareRuerupVsEtf(configHighTer)
      
      // Lower TER should result in higher final value
      expect(comparisonLowTer.etf.accumulation.finalValue).toBeGreaterThan(
        comparisonHighTer.etf.accumulation.finalValue
      )
    })

    it('should identify key factors influencing the decision', () => {
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        contributionPhaseTaxRate: 0.42,
        retirementPhaseTaxRate: 0.25,
        teilfreistellungsquote: 0.30,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      expect(comparison.comparison.keyFactors.length).toBeGreaterThan(0)
      
      // Should mention high contribution phase tax rate
      const hasHighTaxFactor = comparison.comparison.keyFactors.some(f => 
        f.includes('Hoher Steuersatz') && f.includes('Beitragsphase')
      )
      expect(hasHighTaxFactor).toBe(true)
    })

    it('should handle edge case with zero contributions', () => {
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        annualContribution: 0,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      expect(comparison.ruerup.accumulation.totalContributions).toBe(0)
      expect(comparison.etf.accumulation.totalContributions).toBe(0)
    })

    it('should handle very short contribution period', () => {
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        contributionYears: 1,
        retirementYears: 10,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      expect(comparison.ruerup.accumulation.yearlyBreakdown).toHaveLength(1)
      expect(comparison.etf.accumulation.yearlyBreakdown).toHaveLength(1)
      expect(comparison.ruerup.retirement.yearlyBreakdown).toHaveLength(10)
      expect(comparison.etf.retirement.yearlyBreakdown).toHaveLength(10)
    })

    it('should calculate net benefit correctly', () => {
      const config = createDefaultRuerupVsEtfConfig()
      const comparison = compareRuerupVsEtf(config)
      
      // Net benefit = money out - money in
      expect(comparison.ruerup.overall.netBenefit).toBe(
        comparison.ruerup.overall.totalMoneyOut - comparison.ruerup.overall.totalMoneyIn
      )
      
      expect(comparison.etf.overall.netBenefit).toBe(
        comparison.etf.overall.totalMoneyOut - comparison.etf.overall.totalMoneyIn
      )
    })

    it('should show similarity when results are close', () => {
      // Create a scenario where both are very close
      const config: RuerupVsEtfComparisonConfig = {
        ...createDefaultRuerupVsEtfConfig(),
        contributionPhaseTaxRate: 0.30,
        retirementPhaseTaxRate: 0.28,
        contributionYears: 15,
        retirementYears: 15,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      // The algorithm should be able to detect similarity
      if (comparison.comparison.recommendation === 'similar') {
        expect(Math.abs(comparison.comparison.netBenefitDifference)).toBeLessThan(
          Math.max(
            comparison.ruerup.overall.totalMoneyOut, 
            comparison.etf.overall.totalMoneyOut
          ) * 0.05
        )
      }
    })
  })

  describe('Realistic scenarios', () => {
    it('should handle high earner scenario (favoring Rürup)', () => {
      const config: RuerupVsEtfComparisonConfig = {
        annualContribution: 20000,
        contributionYears: 25,
        startYear: 2024,
        expectedReturn: 0.07,
        contributionPhaseTaxRate: 0.45, // Top tax bracket
        retirementPhaseTaxRate: 0.25,   // Lower in retirement
        civilStatus: 'single',
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.30,
        freibetrag: 1000,
        retirementYears: 30,
        ter: 0.002,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      // Rürup should be favorable for high earners
      expect(comparison.ruerup.accumulation.totalTaxEffect).toBeLessThan(0) // Tax savings
      expect(Math.abs(comparison.ruerup.accumulation.totalTaxEffect)).toBeGreaterThan(0)
    })

    it('should handle young investor scenario (longer time horizon)', () => {
      const config: RuerupVsEtfComparisonConfig = {
        annualContribution: 6000,
        contributionYears: 40, // Start at 25, retire at 65
        startYear: 2024,
        expectedReturn: 0.08, // Slightly higher for longer horizon
        contributionPhaseTaxRate: 0.35,
        retirementPhaseTaxRate: 0.25,
        civilStatus: 'single',
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.30,
        freibetrag: 1000,
        retirementYears: 25,
        ter: 0.0015, // Low-cost ETF
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      // Both should accumulate significant wealth
      expect(comparison.ruerup.accumulation.finalValue).toBeGreaterThan(400000)
      expect(comparison.etf.accumulation.finalValue).toBeGreaterThan(400000)
    })

    it('should handle self-employed scenario (Rürup designed for)', () => {
      const config: RuerupVsEtfComparisonConfig = {
        annualContribution: 25000,
        contributionYears: 30,
        startYear: 2024,
        expectedReturn: 0.07,
        contributionPhaseTaxRate: 0.42, // Self-employed with good income
        retirementPhaseTaxRate: 0.28,
        civilStatus: 'married',
        capitalGainsTaxRate: 0.26375,
        teilfreistellungsquote: 0.30,
        freibetrag: 2000, // Married
        retirementYears: 25,
        ter: 0.002,
      }
      
      const comparison = compareRuerupVsEtf(config)
      
      // Should show substantial tax savings for Rürup
      expect(Math.abs(comparison.ruerup.accumulation.totalTaxEffect)).toBeGreaterThan(50000)
    })
  })
})
