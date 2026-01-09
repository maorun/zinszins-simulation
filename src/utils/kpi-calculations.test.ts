/**
 * Tests for KPI Calculation Utilities
 */
import { describe, it, expect } from 'vitest'
import {
  calculateSavingsRate,
  calculateWealthAccumulationRate,
  calculatePensionGap,
  calculateRequiredPortfolioForPensionGap,
  evaluateSavingsRate,
  getSavingsRateColor,
} from './kpi-calculations'

describe('kpi-calculations', () => {
  describe('calculateSavingsRate', () => {
    it('should calculate savings rate correctly for typical values', () => {
      const result = calculateSavingsRate(2000, 10000)
      expect(result).toBe(20)
    })

    it('should calculate savings rate correctly for 50% savings', () => {
      const result = calculateSavingsRate(5000, 10000)
      expect(result).toBe(50)
    })

    it('should calculate savings rate correctly for 10% savings', () => {
      const result = calculateSavingsRate(500, 5000)
      expect(result).toBe(10)
    })

    it('should return 0 for zero income', () => {
      const result = calculateSavingsRate(1000, 0)
      expect(result).toBe(0)
    })

    it('should return 0 for negative income', () => {
      const result = calculateSavingsRate(1000, -5000)
      expect(result).toBe(0)
    })

    it('should return 0 for zero savings and zero income', () => {
      const result = calculateSavingsRate(0, 0)
      expect(result).toBe(0)
    })

    it('should return 0 for negative savings', () => {
      const result = calculateSavingsRate(-1000, 5000)
      expect(result).toBe(0)
    })

    it('should clamp result to 100% maximum', () => {
      const result = calculateSavingsRate(15000, 10000)
      expect(result).toBe(100)
    })

    it('should handle very small values correctly', () => {
      const result = calculateSavingsRate(0.1, 10)
      expect(result).toBe(1)
    })

    it('should handle decimal savings and income', () => {
      const result = calculateSavingsRate(1234.56, 6789.12)
      expect(result).toBeCloseTo(18.18, 1)
    })
  })

  describe('calculateWealthAccumulationRate', () => {
    it('should calculate wealth accumulation rate for typical scenario', () => {
      const result = calculateWealthAccumulationRate(100000, 500000, 10)
      expect(result).toBe(8)
    })

    it('should calculate wealth accumulation rate for larger gap', () => {
      const result = calculateWealthAccumulationRate(50000, 1000000, 20)
      expect(result).toBeCloseTo(4.75, 1)
    })

    it('should return 0 when target is already reached', () => {
      const result = calculateWealthAccumulationRate(500000, 500000, 10)
      expect(result).toBe(0)
    })

    it('should return 0 when current wealth exceeds target', () => {
      const result = calculateWealthAccumulationRate(600000, 500000, 10)
      expect(result).toBe(0)
    })

    it('should return 0 for zero or negative years to target', () => {
      const result = calculateWealthAccumulationRate(100000, 500000, 0)
      expect(result).toBe(0)
    })

    it('should return 0 for negative years', () => {
      const result = calculateWealthAccumulationRate(100000, 500000, -5)
      expect(result).toBe(0)
    })

    it('should handle zero current wealth', () => {
      const result = calculateWealthAccumulationRate(0, 500000, 10)
      expect(result).toBe(10)
    })

    it('should handle very large wealth gap', () => {
      const result = calculateWealthAccumulationRate(10000, 10000000, 30)
      expect(result).toBeCloseTo(3.33, 1)
    })

    it('should handle decimal values', () => {
      const result = calculateWealthAccumulationRate(123456.78, 654321.09, 15)
      expect(result).toBeCloseTo(5.41, 1)
    })

    it('should always return non-negative values', () => {
      const result = calculateWealthAccumulationRate(100000, 500000, 10)
      expect(result).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculatePensionGap', () => {
    it('should calculate pension gap correctly for typical scenario', () => {
      const result = calculatePensionGap(3000, 1500)
      expect(result).toBe(1500)
    })

    it('should calculate pension gap when desired income is higher', () => {
      const result = calculatePensionGap(4000, 2000)
      expect(result).toBe(2000)
    })

    it('should return 0 when pension covers desired income', () => {
      const result = calculatePensionGap(2000, 2000)
      expect(result).toBe(0)
    })

    it('should return 0 when pension exceeds desired income', () => {
      const result = calculatePensionGap(2000, 3000)
      expect(result).toBe(0)
    })

    it('should handle zero desired income', () => {
      const result = calculatePensionGap(0, 1500)
      expect(result).toBe(0)
    })

    it('should handle zero expected pension', () => {
      const result = calculatePensionGap(3000, 0)
      expect(result).toBe(3000)
    })

    it('should handle both values being zero', () => {
      const result = calculatePensionGap(0, 0)
      expect(result).toBe(0)
    })

    it('should handle decimal values', () => {
      const result = calculatePensionGap(3456.78, 1234.56)
      expect(result).toBeCloseTo(2222.22, 2)
    })

    it('should handle negative desired income', () => {
      const result = calculatePensionGap(-1000, 1500)
      expect(result).toBe(0)
    })

    it('should always return non-negative values', () => {
      const result = calculatePensionGap(3000, 1500)
      expect(result).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateRequiredPortfolioForPensionGap', () => {
    it('should calculate required portfolio using 4% rule', () => {
      const result = calculateRequiredPortfolioForPensionGap(1000)
      expect(result).toBe(300000)
    })

    it('should calculate required portfolio for 2000€ monthly gap', () => {
      const result = calculateRequiredPortfolioForPensionGap(2000)
      expect(result).toBe(600000)
    })

    it('should calculate required portfolio for 500€ monthly gap', () => {
      const result = calculateRequiredPortfolioForPensionGap(500)
      expect(result).toBe(150000)
    })

    it('should return 0 for zero monthly gap', () => {
      const result = calculateRequiredPortfolioForPensionGap(0)
      expect(result).toBe(0)
    })

    it('should handle decimal monthly gap', () => {
      const result = calculateRequiredPortfolioForPensionGap(1234.56)
      expect(result).toBeCloseTo(370368, 0)
    })

    it('should calculate correctly for very small gap', () => {
      const result = calculateRequiredPortfolioForPensionGap(100)
      expect(result).toBe(30000)
    })

    it('should calculate correctly for very large gap', () => {
      const result = calculateRequiredPortfolioForPensionGap(10000)
      expect(result).toBe(3000000)
    })

    it('should use 4% withdrawal rate (Trinity Study)', () => {
      // Verify the 4% rule: annual withdrawal = portfolio * 0.04
      const monthlyGap = 1000
      const portfolio = calculateRequiredPortfolioForPensionGap(monthlyGap)
      const annualGap = monthlyGap * 12
      const expectedPortfolio = annualGap / 0.04
      expect(portfolio).toBe(expectedPortfolio)
    })

    it('should handle negative monthly gap', () => {
      const result = calculateRequiredPortfolioForPensionGap(-1000)
      expect(result).toBe(-300000)
    })
  })

  describe('evaluateSavingsRate', () => {
    it('should return "excellent" for 20% or higher savings rate', () => {
      expect(evaluateSavingsRate(20)).toBe('excellent')
      expect(evaluateSavingsRate(25)).toBe('excellent')
      expect(evaluateSavingsRate(30)).toBe('excellent')
      expect(evaluateSavingsRate(50)).toBe('excellent')
      expect(evaluateSavingsRate(100)).toBe('excellent')
    })

    it('should return "good" for 15-19.99% savings rate', () => {
      expect(evaluateSavingsRate(15)).toBe('good')
      expect(evaluateSavingsRate(17)).toBe('good')
      expect(evaluateSavingsRate(19.99)).toBe('good')
    })

    it('should return "average" for 10-14.99% savings rate', () => {
      expect(evaluateSavingsRate(10)).toBe('average')
      expect(evaluateSavingsRate(12)).toBe('average')
      expect(evaluateSavingsRate(14.99)).toBe('average')
    })

    it('should return "low" for below 10% savings rate', () => {
      expect(evaluateSavingsRate(0)).toBe('low')
      expect(evaluateSavingsRate(5)).toBe('low')
      expect(evaluateSavingsRate(9.99)).toBe('low')
    })

    it('should return "low" for negative savings rate', () => {
      expect(evaluateSavingsRate(-5)).toBe('low')
      expect(evaluateSavingsRate(-10)).toBe('low')
    })

    it('should handle boundary at 20%', () => {
      expect(evaluateSavingsRate(19.99)).toBe('good')
      expect(evaluateSavingsRate(20)).toBe('excellent')
      expect(evaluateSavingsRate(20.01)).toBe('excellent')
    })

    it('should handle boundary at 15%', () => {
      expect(evaluateSavingsRate(14.99)).toBe('average')
      expect(evaluateSavingsRate(15)).toBe('good')
      expect(evaluateSavingsRate(15.01)).toBe('good')
    })

    it('should handle boundary at 10%', () => {
      expect(evaluateSavingsRate(9.99)).toBe('low')
      expect(evaluateSavingsRate(10)).toBe('average')
      expect(evaluateSavingsRate(10.01)).toBe('average')
    })
  })

  describe('getSavingsRateColor', () => {
    it('should return green color for excellent savings rate (≥20%)', () => {
      expect(getSavingsRateColor(20)).toBe('text-green-600 dark:text-green-400')
      expect(getSavingsRateColor(25)).toBe('text-green-600 dark:text-green-400')
      expect(getSavingsRateColor(50)).toBe('text-green-600 dark:text-green-400')
    })

    it('should return blue color for good savings rate (15-19.99%)', () => {
      expect(getSavingsRateColor(15)).toBe('text-blue-600 dark:text-blue-400')
      expect(getSavingsRateColor(17)).toBe('text-blue-600 dark:text-blue-400')
      expect(getSavingsRateColor(19.99)).toBe('text-blue-600 dark:text-blue-400')
    })

    it('should return yellow color for average savings rate (10-14.99%)', () => {
      expect(getSavingsRateColor(10)).toBe('text-yellow-600 dark:text-yellow-400')
      expect(getSavingsRateColor(12)).toBe('text-yellow-600 dark:text-yellow-400')
      expect(getSavingsRateColor(14.99)).toBe('text-yellow-600 dark:text-yellow-400')
    })

    it('should return red color for low savings rate (<10%)', () => {
      expect(getSavingsRateColor(0)).toBe('text-red-600 dark:text-red-400')
      expect(getSavingsRateColor(5)).toBe('text-red-600 dark:text-red-400')
      expect(getSavingsRateColor(9.99)).toBe('text-red-600 dark:text-red-400')
    })

    it('should return red color for negative savings rate', () => {
      expect(getSavingsRateColor(-5)).toBe('text-red-600 dark:text-red-400')
      expect(getSavingsRateColor(-10)).toBe('text-red-600 dark:text-red-400')
    })

    it('should handle boundary at 20%', () => {
      expect(getSavingsRateColor(19.99)).toBe('text-blue-600 dark:text-blue-400')
      expect(getSavingsRateColor(20)).toBe('text-green-600 dark:text-green-400')
      expect(getSavingsRateColor(20.01)).toBe('text-green-600 dark:text-green-400')
    })

    it('should handle boundary at 15%', () => {
      expect(getSavingsRateColor(14.99)).toBe('text-yellow-600 dark:text-yellow-400')
      expect(getSavingsRateColor(15)).toBe('text-blue-600 dark:text-blue-400')
      expect(getSavingsRateColor(15.01)).toBe('text-blue-600 dark:text-blue-400')
    })

    it('should handle boundary at 10%', () => {
      expect(getSavingsRateColor(9.99)).toBe('text-red-600 dark:text-red-400')
      expect(getSavingsRateColor(10)).toBe('text-yellow-600 dark:text-yellow-400')
      expect(getSavingsRateColor(10.01)).toBe('text-yellow-600 dark:text-yellow-400')
    })

    it('should return consistent Tailwind color classes', () => {
      const colors = [
        getSavingsRateColor(0),
        getSavingsRateColor(10),
        getSavingsRateColor(15),
        getSavingsRateColor(20),
      ]
      
      colors.forEach((color) => {
        expect(color).toMatch(/^text-(red|yellow|blue|green)-600 dark:text-(red|yellow|blue|green)-400$/)
      })
    })
  })

  describe('Integration: Savings Rate Full Workflow', () => {
    it('should correctly process typical user scenario', () => {
      const monthlySavings = 2000
      const monthlyIncome = 10000
      
      const savingsRate = calculateSavingsRate(monthlySavings, monthlyIncome)
      expect(savingsRate).toBe(20)
      
      const evaluation = evaluateSavingsRate(savingsRate)
      expect(evaluation).toBe('excellent')
      
      const color = getSavingsRateColor(savingsRate)
      expect(color).toBe('text-green-600 dark:text-green-400')
    })

    it('should correctly process low savings scenario', () => {
      const monthlySavings = 400
      const monthlyIncome = 5000
      
      const savingsRate = calculateSavingsRate(monthlySavings, monthlyIncome)
      expect(savingsRate).toBe(8)
      
      const evaluation = evaluateSavingsRate(savingsRate)
      expect(evaluation).toBe('low')
      
      const color = getSavingsRateColor(savingsRate)
      expect(color).toBe('text-red-600 dark:text-red-400')
    })
  })

  describe('Integration: Pension Gap Workflow', () => {
    it('should calculate full pension gap workflow', () => {
      const desiredMonthlyIncome = 3000
      const expectedPension = 1500
      
      const gap = calculatePensionGap(desiredMonthlyIncome, expectedPension)
      expect(gap).toBe(1500)
      
      const requiredPortfolio = calculateRequiredPortfolioForPensionGap(gap)
      expect(requiredPortfolio).toBe(450000)
    })

    it('should handle scenario where pension is sufficient', () => {
      const desiredMonthlyIncome = 2000
      const expectedPension = 2500
      
      const gap = calculatePensionGap(desiredMonthlyIncome, expectedPension)
      expect(gap).toBe(0)
      
      const requiredPortfolio = calculateRequiredPortfolioForPensionGap(gap)
      expect(requiredPortfolio).toBe(0)
    })
  })

  describe('Integration: Wealth Accumulation Workflow', () => {
    it('should calculate wealth accumulation for retirement planning', () => {
      const currentWealth = 100000
      const targetWealth = 500000
      const yearsToRetirement = 15
      
      const rate = calculateWealthAccumulationRate(currentWealth, targetWealth, yearsToRetirement)
      expect(rate).toBeCloseTo(5.33, 1)
    })

    it('should handle early retirement scenario', () => {
      const currentWealth = 50000
      const targetWealth = 1000000
      const yearsToRetirement = 20
      
      const rate = calculateWealthAccumulationRate(currentWealth, targetWealth, yearsToRetirement)
      expect(rate).toBeCloseTo(4.75, 1)
    })
  })
})
