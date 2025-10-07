import { describe, it, expect } from 'vitest'
import {
  runSensitivityAnalysis,
  calculateParameterImpact,
  getMostImpactfulParameters,
  SENSITIVITY_PARAMETERS,
  type SensitivityAnalysisConfig,
} from './sensitivity-analysis'

describe('Sensitivity Analysis', () => {
  const baseConfig: SensitivityAnalysisConfig = {
    startYear: 2025,
    endYear: 2040,
    elements: [
      {
        type: 'sparplan',
        start: '2025-01-01',
        einzahlung: 24000,
        simulation: {},
      },
    ],
    steuerlast: 0.26375,
    teilfreistellungsquote: 0.30,
    simulationAnnual: 'yearly',
    freibetragPerYear: { 2025: 2000 },
    steuerReduzierenEndkapital: true,
  }

  describe('SENSITIVITY_PARAMETERS', () => {
    it('should define all required parameters', () => {
      expect(SENSITIVITY_PARAMETERS.returnRate).toBeDefined()
      expect(SENSITIVITY_PARAMETERS.savingsAmount).toBeDefined()
      expect(SENSITIVITY_PARAMETERS.taxRate).toBeDefined()
      expect(SENSITIVITY_PARAMETERS.inflationRate).toBeDefined()
      expect(SENSITIVITY_PARAMETERS.investmentPeriod).toBeDefined()
    })

    it('should have valid parameter ranges', () => {
      for (const param of Object.values(SENSITIVITY_PARAMETERS)) {
        expect(param.min).toBeLessThan(param.max)
        expect(param.step).toBeGreaterThan(0)
        expect(param.baseValue).toBeGreaterThanOrEqual(param.min)
        expect(param.baseValue).toBeLessThanOrEqual(param.max)
      }
    })

    it('should format values correctly', () => {
      expect(SENSITIVITY_PARAMETERS.returnRate.formatValue(5.0)).toBe('5.0%')
      expect(SENSITIVITY_PARAMETERS.savingsAmount.formatValue(24000)).toBe('24.000 €')
      expect(SENSITIVITY_PARAMETERS.taxRate.formatValue(26.375)).toBe('26.38%')
      expect(SENSITIVITY_PARAMETERS.inflationRate.formatValue(2.0)).toBe('2.0%')
      expect(SENSITIVITY_PARAMETERS.investmentPeriod.formatValue(20)).toBe('20 Jahre')
    })
  })

  describe('runSensitivityAnalysis', () => {
    it('should analyze return rate sensitivity', () => {
      const parameter = SENSITIVITY_PARAMETERS.returnRate
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }

      const results = runSensitivityAnalysis(parameter, baseConfig, returnConfig)

      // Should have results for each step
      const expectedSteps = Math.floor((parameter.max - parameter.min) / parameter.step) + 1
      expect(results).toHaveLength(expectedSteps)

      // Results should be sorted by parameter value
      for (let i = 1; i < results.length; i++) {
        expect(results[i].parameterValue).toBeGreaterThan(results[i - 1].parameterValue)
      }

      // Higher return should lead to higher final capital
      expect(results[results.length - 1].finalCapital).toBeGreaterThan(results[0].finalCapital)
    })

    it('should analyze savings amount sensitivity', () => {
      const parameter = SENSITIVITY_PARAMETERS.savingsAmount
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }

      const results = runSensitivityAnalysis(parameter, baseConfig, returnConfig)

      expect(results.length).toBeGreaterThan(0)

      // Higher savings should lead to higher final capital
      expect(results[results.length - 1].finalCapital).toBeGreaterThan(results[0].finalCapital)

      // Total contributions should increase with savings amount
      expect(results[results.length - 1].totalContributions).toBeGreaterThan(results[0].totalContributions)
    })

    it('should analyze tax rate sensitivity', () => {
      const parameter = SENSITIVITY_PARAMETERS.taxRate
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }

      const results = runSensitivityAnalysis(parameter, baseConfig, returnConfig)

      expect(results.length).toBeGreaterThan(0)

      // With taxes, higher tax rates should lead to lower or equal final capital
      // Note: tax only applies when there are gains, so with 0% tax we should have highest capital
      const zeroTaxResult = results.find(r => r.parameterValue === 0)
      const highTaxResult = results.find(r => r.parameterValue === 45)

      if (zeroTaxResult && highTaxResult) {
        expect(zeroTaxResult.finalCapital).toBeGreaterThanOrEqual(highTaxResult.finalCapital)
      }
    })

    it('should analyze inflation rate sensitivity', () => {
      const parameter = SENSITIVITY_PARAMETERS.inflationRate
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.07 }

      const results = runSensitivityAnalysis(parameter, baseConfig, returnConfig)

      expect(results.length).toBeGreaterThan(0)

      // Higher inflation should lead to lower real returns
      // But exact capital depends on inflation application mode
      expect(results[0].finalCapital).toBeGreaterThan(0)
      expect(results[results.length - 1].finalCapital).toBeGreaterThan(0)
    })

    it('should analyze investment period sensitivity', () => {
      const parameter = SENSITIVITY_PARAMETERS.investmentPeriod
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }

      const results = runSensitivityAnalysis(parameter, baseConfig, returnConfig)

      expect(results.length).toBeGreaterThan(0)

      // Longer investment period should lead to higher final capital
      expect(results[results.length - 1].finalCapital).toBeGreaterThan(results[0].finalCapital)

      // Longer period means more contributions
      expect(results[results.length - 1].totalContributions).toBeGreaterThan(results[0].totalContributions)
    })

    it('should calculate total gains correctly', () => {
      const parameter = SENSITIVITY_PARAMETERS.returnRate
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }

      const results = runSensitivityAnalysis(parameter, baseConfig, returnConfig)

      for (const result of results) {
        expect(result.totalGains).toBe(result.finalCapital - result.totalContributions)
      }
    })

    it('should calculate effective return correctly', () => {
      const parameter = SENSITIVITY_PARAMETERS.returnRate
      const returnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }

      const results = runSensitivityAnalysis(parameter, baseConfig, returnConfig)

      for (const result of results) {
        const expectedReturn = ((result.finalCapital / result.totalContributions) - 1) * 100
        expect(result.effectiveReturn).toBeCloseTo(expectedReturn, 2)
      }
    })
  })

  describe('calculateParameterImpact', () => {
    it('should calculate positive impact for beneficial parameters', () => {
      const results = [
        {
          parameterName: 'returnRate',
          parameterValue: 0,
          finalCapital: 100000,
          totalContributions: 90000,
          totalGains: 10000,
          effectiveReturn: 11.11,
        },
        {
          parameterName: 'returnRate',
          parameterValue: 5,
          finalCapital: 150000,
          totalContributions: 90000,
          totalGains: 60000,
          effectiveReturn: 66.67,
        },
      ]

      const baseResult = results[0]
      const impact = calculateParameterImpact(results, baseResult)

      // Impact should be positive (higher return = higher capital)
      expect(impact).toBeGreaterThan(0)
    })

    it('should calculate negative impact for detrimental parameters', () => {
      const results = [
        {
          parameterName: 'taxRate',
          parameterValue: 0,
          finalCapital: 150000,
          totalContributions: 90000,
          totalGains: 60000,
          effectiveReturn: 66.67,
        },
        {
          parameterName: 'taxRate',
          parameterValue: 40,
          finalCapital: 120000,
          totalContributions: 90000,
          totalGains: 30000,
          effectiveReturn: 33.33,
        },
      ]

      const baseResult = results[0]
      const impact = calculateParameterImpact(results, baseResult)

      // Impact should be negative (higher tax = lower capital)
      expect(impact).toBeLessThan(0)
    })

    it('should return 0 for insufficient data', () => {
      const singleResult = [{
        parameterName: 'test',
        parameterValue: 5,
        finalCapital: 100000,
        totalContributions: 90000,
        totalGains: 10000,
        effectiveReturn: 11.11,
      }]

      const impact = calculateParameterImpact(singleResult, singleResult[0])
      expect(impact).toBe(0)
    })
  })

  describe('getMostImpactfulParameters', () => {
    it('should rank parameters by impact', () => {
      const returnRateResults = [
        {
          parameterName: 'returnRate',
          parameterValue: 0,
          finalCapital: 100000,
          totalContributions: 90000,
          totalGains: 10000,
          effectiveReturn: 11.11,
        },
        {
          parameterName: 'returnRate',
          parameterValue: 10,
          finalCapital: 200000,
          totalContributions: 90000,
          totalGains: 110000,
          effectiveReturn: 122.22,
        },
      ]

      const taxRateResults = [
        {
          parameterName: 'taxRate',
          parameterValue: 0,
          finalCapital: 150000,
          totalContributions: 90000,
          totalGains: 60000,
          effectiveReturn: 66.67,
        },
        {
          parameterName: 'taxRate',
          parameterValue: 40,
          finalCapital: 140000,
          totalContributions: 90000,
          totalGains: 50000,
          effectiveReturn: 55.56,
        },
      ]

      const parameterResults = new Map([
        ['returnRate', returnRateResults],
        ['taxRate', taxRateResults],
      ])

      const baseResults = new Map([
        ['returnRate', returnRateResults[0]],
        ['taxRate', taxRateResults[0]],
      ])

      const ranking = getMostImpactfulParameters(parameterResults, baseResults)

      expect(ranking).toHaveLength(2)

      // Return rate should have higher impact than tax rate in this example
      expect(ranking[0].parameter).toBe('returnRate')
      expect(ranking[0].impact).toBeGreaterThan(0)

      expect(ranking[1].parameter).toBe('taxRate')
      expect(ranking[1].impact).toBeGreaterThan(0) // Absolute value
    })

    it('should handle empty parameter map', () => {
      const parameterResults = new Map()
      const baseResults = new Map()

      const ranking = getMostImpactfulParameters(parameterResults, baseResults)

      expect(ranking).toHaveLength(0)
    })
  })
})
