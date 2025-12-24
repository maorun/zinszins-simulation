import { describe, expect, it } from 'vitest'
import {
  calculateRequiredSavingsRate,
  performSensitivityAnalysis,
  validateReverseCalculatorConfig,
  getDefaultReverseCalculatorConfig,
  type ReverseCalculatorConfig,
} from './reverse-calculator'

describe('reverse-calculator', () => {
  describe('getDefaultReverseCalculatorConfig', () => {
    it('should return default configuration', () => {
      const config = getDefaultReverseCalculatorConfig()

      expect(config.targetCapital).toBe(500000)
      expect(config.years).toBe(30)
      expect(config.returnRate).toBe(0.05)
      expect(config.calculationMode).toBe('monthly')
      expect(config.taxRate).toBe(0.26375)
      expect(config.teilfreistellung).toBe(0.3)
      expect(config.freibetrag).toBe(2000)
      expect(config.basiszins).toBe(0.0255)
      expect(config.ter).toBe(0.002)
    })
  })

  describe('validateReverseCalculatorConfig', () => {
    it('should validate correct configuration without errors', () => {
      const config = getDefaultReverseCalculatorConfig()
      const errors = validateReverseCalculatorConfig(config)
      expect(errors).toEqual([])
    })

    it('should reject zero or negative target capital', () => {
      const config = { ...getDefaultReverseCalculatorConfig(), targetCapital: 0 }
      const errors = validateReverseCalculatorConfig(config)
      expect(errors).toContain('Zielkapital muss größer als 0 sein')
    })

    it('should reject invalid years', () => {
      const config1 = { ...getDefaultReverseCalculatorConfig(), years: 0 }
      const config2 = { ...getDefaultReverseCalculatorConfig(), years: 101 }

      expect(validateReverseCalculatorConfig(config1)).toContain('Zeitraum muss zwischen 1 und 100 Jahren liegen')
      expect(validateReverseCalculatorConfig(config2)).toContain('Zeitraum muss zwischen 1 und 100 Jahren liegen')
    })

    it('should reject extreme return rates', () => {
      const config1 = { ...getDefaultReverseCalculatorConfig(), returnRate: -0.6 }
      const config2 = { ...getDefaultReverseCalculatorConfig(), returnRate: 0.6 }

      expect(validateReverseCalculatorConfig(config1)).toContain('Rendite muss zwischen -50% und +50% liegen')
      expect(validateReverseCalculatorConfig(config2)).toContain('Rendite muss zwischen -50% und +50% liegen')
    })

    it('should reject invalid tax rate', () => {
      const config1 = { ...getDefaultReverseCalculatorConfig(), taxRate: -0.1 }
      const config2 = { ...getDefaultReverseCalculatorConfig(), taxRate: 1.1 }

      expect(validateReverseCalculatorConfig(config1)).toContain('Steuersatz muss zwischen 0% und 100% liegen')
      expect(validateReverseCalculatorConfig(config2)).toContain('Steuersatz muss zwischen 0% und 100% liegen')
    })

    it('should reject invalid Teilfreistellung', () => {
      const config1 = { ...getDefaultReverseCalculatorConfig(), teilfreistellung: -0.1 }
      const config2 = { ...getDefaultReverseCalculatorConfig(), teilfreistellung: 1.1 }

      expect(validateReverseCalculatorConfig(config1)).toContain('Teilfreistellung muss zwischen 0% und 100% liegen')
      expect(validateReverseCalculatorConfig(config2)).toContain('Teilfreistellung muss zwischen 0% und 100% liegen')
    })

    it('should reject negative Freibetrag', () => {
      const config = { ...getDefaultReverseCalculatorConfig(), freibetrag: -1 }
      expect(validateReverseCalculatorConfig(config)).toContain('Freibetrag kann nicht negativ sein')
    })

    it('should reject extreme Basiszins', () => {
      const config1 = { ...getDefaultReverseCalculatorConfig(), basiszins: -0.01 }
      const config2 = { ...getDefaultReverseCalculatorConfig(), basiszins: 0.25 }

      expect(validateReverseCalculatorConfig(config1)).toContain('Basiszins muss zwischen 0% und 20% liegen')
      expect(validateReverseCalculatorConfig(config2)).toContain('Basiszins muss zwischen 0% und 20% liegen')
    })

    it('should reject extreme TER', () => {
      const config1 = { ...getDefaultReverseCalculatorConfig(), ter: -0.001 }
      const config2 = { ...getDefaultReverseCalculatorConfig(), ter: 0.11 }

      expect(validateReverseCalculatorConfig(config1)).toContain('TER muss zwischen 0% und 10% liegen')
      expect(validateReverseCalculatorConfig(config2)).toContain('TER muss zwischen 0% und 10% liegen')
    })

    it('should return multiple errors for multiple violations', () => {
      const config: ReverseCalculatorConfig = {
        targetCapital: -1000,
        years: 0,
        returnRate: 1.0,
        calculationMode: 'monthly',
        taxRate: 2.0,
        teilfreistellung: 1.5,
        freibetrag: -100,
        basiszins: 0.3,
        ter: 0.2,
      }

      const errors = validateReverseCalculatorConfig(config)
      expect(errors.length).toBeGreaterThan(5)
    })
  })

  describe('calculateRequiredSavingsRate', () => {
    it('should calculate monthly savings rate for realistic scenario', () => {
      const config: ReverseCalculatorConfig = {
        targetCapital: 500000,
        years: 30,
        returnRate: 0.05,
        calculationMode: 'monthly',
        taxRate: 0.26375,
        teilfreistellung: 0.3,
        freibetrag: 2000,
        basiszins: 0.0255,
        ter: 0.002,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(result.monthlyRate).toBeDefined()
      expect(result.yearlyRate).toBeUndefined()
      expect(result.monthlyRate).toBeGreaterThan(0)
      expect(result.monthlyRate).toBeLessThan(10000) // Reasonable upper bound
      // Allow 1% tolerance for convergence
      expect(Math.abs(result.finalCapital - config.targetCapital)).toBeLessThan(config.targetCapital * 0.01)
      expect(result.totalContributions).toBeGreaterThan(0)
      expect(result.netGain).toBeGreaterThan(0) // Should have positive gains
    })

    it('should calculate yearly savings rate for realistic scenario', () => {
      const config: ReverseCalculatorConfig = {
        targetCapital: 500000,
        years: 30,
        returnRate: 0.05,
        calculationMode: 'yearly',
        taxRate: 0.26375,
        teilfreistellung: 0.3,
        freibetrag: 2000,
        basiszins: 0.0255,
        ter: 0.002,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(result.yearlyRate).toBeDefined()
      expect(result.monthlyRate).toBeUndefined()
      expect(result.yearlyRate).toBeGreaterThan(0)
      expect(Math.abs(result.finalCapital - config.targetCapital)).toBeLessThan(config.targetCapital * 0.01)
    })

    it('should require higher contributions for shorter time periods', () => {
      const config30Years = getDefaultReverseCalculatorConfig()
      const config15Years = { ...config30Years, years: 15 }

      const result30 = calculateRequiredSavingsRate(config30Years)
      const result15 = calculateRequiredSavingsRate(config15Years)

      expect(result15.monthlyRate).toBeGreaterThan(result30.monthlyRate!)
    })

    it('should require higher contributions for lower return rates', () => {
      const configHighReturn = { ...getDefaultReverseCalculatorConfig(), returnRate: 0.07 }
      const configLowReturn = { ...getDefaultReverseCalculatorConfig(), returnRate: 0.03 }

      const resultHigh = calculateRequiredSavingsRate(configHighReturn)
      const resultLow = calculateRequiredSavingsRate(configLowReturn)

      expect(resultLow.monthlyRate).toBeGreaterThan(resultHigh.monthlyRate!)
    })

    it('should handle small target capitals', () => {
      const config: ReverseCalculatorConfig = {
        ...getDefaultReverseCalculatorConfig(),
        targetCapital: 10000,
        years: 10,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(result.monthlyRate).toBeGreaterThan(0)
      expect(Math.abs(result.finalCapital - 10000)).toBeLessThan(100) // Within 100€ for small amount
    })

    it('should handle large target capitals', () => {
      const config: ReverseCalculatorConfig = {
        ...getDefaultReverseCalculatorConfig(),
        targetCapital: 2000000,
        years: 40,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(result.monthlyRate).toBeGreaterThan(0)
      expect(Math.abs(result.finalCapital - 2000000)).toBeLessThan(20000) // Within 1% for large amount
    })

    it('should account for taxes reducing final capital', () => {
      const configWithTax = getDefaultReverseCalculatorConfig()
      const configWithoutTax = { ...configWithTax, taxRate: 0, teilfreistellung: 0 }

      const resultWithTax = calculateRequiredSavingsRate(configWithTax)
      const resultWithoutTax = calculateRequiredSavingsRate(configWithoutTax)

      // Should need higher contributions with tax
      expect(resultWithTax.monthlyRate).toBeGreaterThan(resultWithoutTax.monthlyRate!)
      expect(resultWithTax.totalTaxesPaid).toBeGreaterThan(0)
      expect(resultWithoutTax.totalTaxesPaid).toBe(0)
    })

    it('should account for TER costs', () => {
      const configWithTER = getDefaultReverseCalculatorConfig()
      const configWithoutTER = { ...configWithTER, ter: 0 }

      const resultWithTER = calculateRequiredSavingsRate(configWithTER)
      const resultWithoutTER = calculateRequiredSavingsRate(configWithoutTER)

      // Should need higher contributions with TER
      expect(resultWithTER.monthlyRate).toBeGreaterThan(resultWithoutTER.monthlyRate!)
      expect(resultWithTER.totalCostsPaid).toBeGreaterThan(0)
      expect(resultWithoutTER.totalCostsPaid).toBe(0)
    })

    it('should benefit from Teilfreistellung', () => {
      const configWithTeilfreistellung = getDefaultReverseCalculatorConfig()
      const configWithoutTeilfreistellung = { ...configWithTeilfreistellung, teilfreistellung: 0 }

      const resultWith = calculateRequiredSavingsRate(configWithTeilfreistellung)
      const resultWithout = calculateRequiredSavingsRate(configWithoutTeilfreistellung)

      // Should need lower contributions with Teilfreistellung (lower effective tax)
      expect(resultWith.monthlyRate).toBeLessThan(resultWithout.monthlyRate!)
    })

    it('should benefit from Freibetrag', () => {
      const configWithFreibetrag = getDefaultReverseCalculatorConfig()
      const configWithoutFreibetrag = { ...configWithFreibetrag, freibetrag: 0 }

      const resultWith = calculateRequiredSavingsRate(configWithFreibetrag)
      const resultWithout = calculateRequiredSavingsRate(configWithoutFreibetrag)

      // Should need lower contributions with Freibetrag
      expect(resultWith.monthlyRate).toBeLessThan(resultWithout.monthlyRate!)
    })

    it('should throw error for zero target capital', () => {
      const config = { ...getDefaultReverseCalculatorConfig(), targetCapital: 0 }
      expect(() => calculateRequiredSavingsRate(config)).toThrow('Zielkapital muss größer als 0 sein')
    })

    it('should throw error for zero years', () => {
      const config = { ...getDefaultReverseCalculatorConfig(), years: 0 }
      expect(() => calculateRequiredSavingsRate(config)).toThrow('Zeitraum muss größer als 0 Jahre sein')
    })

    it('should converge within reasonable iterations', () => {
      const config = getDefaultReverseCalculatorConfig()
      const result = calculateRequiredSavingsRate(config)

      expect(result.iterations).toBeLessThan(50) // Should converge quickly
    })

    it('should calculate realistic example: €1M in 25 years at 6%', () => {
      const config: ReverseCalculatorConfig = {
        targetCapital: 1000000,
        years: 25,
        returnRate: 0.06,
        calculationMode: 'monthly',
        taxRate: 0.26375,
        teilfreistellung: 0.3,
        freibetrag: 2000,
        basiszins: 0.0255,
        ter: 0.002,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(result.monthlyRate).toBeGreaterThan(1000)
      expect(result.monthlyRate).toBeLessThan(2500)
      expect(Math.abs(result.finalCapital - 1000000)).toBeLessThan(10000) // Within 1%
    })

    it('should handle conservative scenario: 3% return', () => {
      const config: ReverseCalculatorConfig = {
        ...getDefaultReverseCalculatorConfig(),
        returnRate: 0.03,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(result.monthlyRate).toBeGreaterThan(0)
      expect(result.netGain).toBeGreaterThan(0) // Still positive gains, just lower
    })

    it('should handle optimistic scenario: 8% return', () => {
      const config: ReverseCalculatorConfig = {
        ...getDefaultReverseCalculatorConfig(),
        returnRate: 0.08,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(result.monthlyRate).toBeGreaterThan(0)
      expect(result.netGain).toBeGreaterThan(0)
    })

    it('should show total contributions equals savings rate times periods', () => {
      const config = getDefaultReverseCalculatorConfig()
      const result = calculateRequiredSavingsRate(config)

      const expectedTotalContributions = result.monthlyRate! * 12 * config.years
      expect(result.totalContributions).toBeCloseTo(expectedTotalContributions, -1)
    })
  })

  describe('performSensitivityAnalysis', () => {
    it('should analyze multiple return scenarios', () => {
      const config = getDefaultReverseCalculatorConfig()
      const scenarios = [0.03, 0.05, 0.07, 0.09]

      const analysis = performSensitivityAnalysis(config, scenarios)

      expect(analysis).toHaveLength(4)
      analysis.forEach(result => {
        expect(result.scenario).toBeDefined()
        expect(result.returnRate).toBeGreaterThan(0)
        expect(result.savingsRate).toBeGreaterThan(0)
        expect(result.totalContributions).toBeGreaterThan(0)
      })
    })

    it('should show decreasing required savings with higher returns', () => {
      const config = getDefaultReverseCalculatorConfig()
      const scenarios = [0.03, 0.05, 0.07, 0.09]

      const analysis = performSensitivityAnalysis(config, scenarios)

      // Higher returns should require lower savings rates
      expect(analysis[3].savingsRate).toBeLessThan(analysis[2].savingsRate)
      expect(analysis[2].savingsRate).toBeLessThan(analysis[1].savingsRate)
      expect(analysis[1].savingsRate).toBeLessThan(analysis[0].savingsRate)
    })

    it('should label scenarios appropriately', () => {
      const config = getDefaultReverseCalculatorConfig()
      const scenarios = [0.02, 0.04, 0.06, 0.08, 0.1]

      const analysis = performSensitivityAnalysis(config, scenarios)

      expect(analysis[0].scenario).toContain('Pessimistisch')
      expect(analysis[1].scenario).toContain('Konservativ')
      expect(analysis[2].scenario).toContain('Moderat')
      expect(analysis[3].scenario).toContain('Optimistisch')
      expect(analysis[4].scenario).toContain('Sehr optimistisch')
    })

    it('should show return rate percentage in scenario name', () => {
      const config = getDefaultReverseCalculatorConfig()
      const scenarios = [0.05]

      const analysis = performSensitivityAnalysis(config, scenarios)

      expect(analysis[0].scenario).toContain('5.0%')
    })

    it('should handle yearly calculation mode', () => {
      const config = { ...getDefaultReverseCalculatorConfig(), calculationMode: 'yearly' as const }
      const scenarios = [0.05, 0.07]

      const analysis = performSensitivityAnalysis(config, scenarios)

      expect(analysis).toHaveLength(2)
      analysis.forEach(result => {
        expect(result.savingsRate).toBeGreaterThan(0)
        // For yearly mode, savings rate should be roughly 12x the monthly rate
      })
    })

    it('should handle edge case: very low return', () => {
      const config = getDefaultReverseCalculatorConfig()
      const scenarios = [0.01]

      const analysis = performSensitivityAnalysis(config, scenarios)

      expect(analysis).toHaveLength(1)
      expect(analysis[0].savingsRate).toBeGreaterThan(0)
    })

    it('should handle edge case: very high return', () => {
      const config = getDefaultReverseCalculatorConfig()
      const scenarios = [0.15]

      const analysis = performSensitivityAnalysis(config, scenarios)

      expect(analysis).toHaveLength(1)
      expect(analysis[0].savingsRate).toBeGreaterThan(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should calculate realistic retirement goal: €800k in 35 years', () => {
      const config: ReverseCalculatorConfig = {
        targetCapital: 800000,
        years: 35,
        returnRate: 0.055,
        calculationMode: 'monthly',
        taxRate: 0.26375,
        teilfreistellung: 0.3,
        freibetrag: 2000,
        basiszins: 0.0255,
        ter: 0.002,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(Math.abs(result.finalCapital - 800000)).toBeLessThan(8000) // Within 1%
      expect(result.monthlyRate).toBeGreaterThan(500)
      expect(result.monthlyRate).toBeLessThan(1500)
    })

    it('should handle early retirement goal: €600k in 15 years', () => {
      const config: ReverseCalculatorConfig = {
        targetCapital: 600000,
        years: 15,
        returnRate: 0.06,
        calculationMode: 'monthly',
        taxRate: 0.26375,
        teilfreistellung: 0.3,
        freibetrag: 2000,
        basiszins: 0.0255,
        ter: 0.002,
      }

      const result = calculateRequiredSavingsRate(config)

      expect(result.converged).toBe(true)
      expect(Math.abs(result.finalCapital - 600000)).toBeLessThan(6000) // Within 1%
      // Should require higher monthly contributions due to shorter time
      expect(result.monthlyRate).toBeGreaterThan(2000)
    })

    it('should compare monthly vs yearly calculation modes', () => {
      const baseConfig = getDefaultReverseCalculatorConfig()
      const monthlyConfig = { ...baseConfig, calculationMode: 'monthly' as const }
      const yearlyConfig = { ...baseConfig, calculationMode: 'yearly' as const }

      const monthlyResult = calculateRequiredSavingsRate(monthlyConfig)
      const yearlyResult = calculateRequiredSavingsRate(yearlyConfig)

      // Yearly rate should be approximately 12x monthly rate (with some variation due to compounding)
      const annualizedMonthlyRate = monthlyResult.monthlyRate! * 12
      expect(yearlyResult.yearlyRate).toBeCloseTo(annualizedMonthlyRate, -2)
    })
  })
})
