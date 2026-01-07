import { describe, it, expect } from 'vitest'
import {
  calculateAnnualSavings,
  calculateSavingsRate,
  classifySavingsRate,
  type SavingsRateConfig,
} from './savings-rate'
import type { SparplanElement } from '../src/utils/sparplan-utils'

describe('savings-rate', () => {
  describe('calculateAnnualSavings', () => {
    it('should calculate annual savings from monthly savings plan', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 500,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
      ]

      const result = calculateAnnualSavings(sparplanElements)
      expect(result).toBe(6000) // 500 * 12
    })

    it('should calculate annual savings from yearly savings plan', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 10000,
          interval: 'jaehrlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
      ]

      const result = calculateAnnualSavings(sparplanElements)
      expect(result).toBe(10000)
    })

    it('should sum multiple savings plans', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 500,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
        {
          betrag: 12000,
          interval: 'jaehrlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '2',
          simulation: {},
        },
      ]

      const result = calculateAnnualSavings(sparplanElements)
      expect(result).toBe(18000) // (500 * 12) + 12000
    })

    it('should skip inactive plans when onlyActive is true', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 500,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
        {
          betrag: 300,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: false,
          id: '2',
          simulation: {},
        },
      ]

      const result = calculateAnnualSavings(sparplanElements, true)
      expect(result).toBe(6000) // Only active: 500 * 12
    })

    it('should include inactive plans when onlyActive is false', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 500,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
        {
          betrag: 300,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: false,
          id: '2',
          simulation: {},
        },
      ]

      const result = calculateAnnualSavings(sparplanElements, false)
      expect(result).toBe(9600) // (500 + 300) * 12
    })

    it('should return 0 for empty array', () => {
      const result = calculateAnnualSavings([])
      expect(result).toBe(0)
    })
  })

  describe('calculateSavingsRate', () => {
    it('should calculate savings rate correctly', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 1000,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
      ]

      const config: SavingsRateConfig = {
        annualGrossIncome: 60000,
        incomeTaxRate: 0.3, // 30% tax rate
      }

      const result = calculateSavingsRate(sparplanElements, config)

      // Annual savings: 1000 * 12 = 12000
      // Net income: 60000 * 0.7 = 42000
      // Savings rate: (12000 / 42000) * 100 = 28.57%

      expect(result.annualSavings).toBe(12000)
      expect(result.annualNetIncome).toBe(42000)
      expect(result.savingsRatePercentage).toBeCloseTo(28.57, 1)
      expect(result.monthlySavings).toBe(1000)
      expect(result.monthlyNetIncome).toBe(3500)
    })

    it('should handle default tax rate', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 500,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
      ]

      const config: SavingsRateConfig = {
        annualGrossIncome: 50000,
        // No incomeTaxRate specified, should use default 0.3
      }

      const result = calculateSavingsRate(sparplanElements, config)

      expect(result.annualNetIncome).toBe(35000) // 50000 * 0.7
      expect(result.savingsRatePercentage).toBeCloseTo(17.14, 1)
    })

    it('should handle high savings rate', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 2000,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
      ]

      const config: SavingsRateConfig = {
        annualGrossIncome: 60000,
        incomeTaxRate: 0.25,
      }

      const result = calculateSavingsRate(sparplanElements, config)

      // Annual savings: 2000 * 12 = 24000
      // Net income: 60000 * 0.75 = 45000
      // Savings rate: (24000 / 45000) * 100 = 53.33%

      expect(result.savingsRatePercentage).toBeCloseTo(53.33, 1)
    })

    it('should handle zero income gracefully', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 500,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
      ]

      const config: SavingsRateConfig = {
        annualGrossIncome: 0,
      }

      const result = calculateSavingsRate(sparplanElements, config)

      expect(result.savingsRatePercentage).toBe(0)
      expect(result.annualNetIncome).toBe(0)
    })

    it('should handle mixed savings plans', () => {
      const sparplanElements: SparplanElement[] = [
        {
          betrag: 300,
          interval: 'monatlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '1',
          simulation: {},
        },
        {
          betrag: 6000,
          interval: 'jaehrlich',
          start: '2023-01-01',
          ende: '2040-12-31',
          aktiv: true,
          id: '2',
          simulation: {},
        },
      ]

      const config: SavingsRateConfig = {
        annualGrossIncome: 70000,
        incomeTaxRate: 0.35,
      }

      const result = calculateSavingsRate(sparplanElements, config)

      // Annual savings: (300 * 12) + 6000 = 9600
      // Net income: 70000 * 0.65 = 45500
      // Savings rate: (9600 / 45500) * 100 = 21.10%

      expect(result.annualSavings).toBe(9600)
      expect(result.annualNetIncome).toBe(45500)
      expect(result.savingsRatePercentage).toBeCloseTo(21.1, 1)
    })
  })

  describe('classifySavingsRate', () => {
    it('should classify excellent savings rate', () => {
      const result = classifySavingsRate(25)
      expect(result.level).toBe('excellent')
      expect(result.label).toBe('Hervorragend')
      expect(result.color).toBe('green')
    })

    it('should classify good savings rate', () => {
      const result = classifySavingsRate(17)
      expect(result.level).toBe('good')
      expect(result.label).toBe('Gut')
      expect(result.color).toBe('blue')
    })

    it('should classify moderate savings rate', () => {
      const result = classifySavingsRate(12)
      expect(result.level).toBe('moderate')
      expect(result.label).toBe('Durchschnittlich')
      expect(result.color).toBe('yellow')
    })

    it('should classify low savings rate', () => {
      const result = classifySavingsRate(5)
      expect(result.level).toBe('low')
      expect(result.label).toBe('Niedrig')
      expect(result.color).toBe('red')
    })

    it('should handle edge cases at boundaries', () => {
      expect(classifySavingsRate(20).level).toBe('excellent')
      expect(classifySavingsRate(15).level).toBe('good')
      expect(classifySavingsRate(10).level).toBe('moderate')
      expect(classifySavingsRate(0).level).toBe('low')
    })
  })
})
