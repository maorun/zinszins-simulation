import { describe, expect, it } from 'vitest'
import {
  calculateBreakEven,
  calculatePensionDeductionOffset,
  calculatePensionPointsPurchase,
  calculatePensionTopUp,
  getDefaultPensionTopUpConfig,
  getStandardRetirementAge,
  validatePensionTopUpConfig,
  type PensionTopUpConfig,
} from './pension-top-up'

describe('pension-top-up', () => {
  describe('getStandardRetirementAge', () => {
    it('should return 65 for birth years before 1946', () => {
      expect(getStandardRetirementAge(1940)).toBe(65)
      expect(getStandardRetirementAge(1945)).toBe(65)
    })

    it('should return 67 for birth years from 1964 onwards', () => {
      expect(getStandardRetirementAge(1964)).toBe(67)
      expect(getStandardRetirementAge(1970)).toBe(67)
      expect(getStandardRetirementAge(1980)).toBe(67)
    })

    it('should return correct age for transition years', () => {
      expect(getStandardRetirementAge(1946)).toBe(65)
      expect(getStandardRetirementAge(1958)).toBe(66)
      expect(getStandardRetirementAge(1963)).toBe(66.83)
    })
  })

  describe('getDefaultPensionTopUpConfig', () => {
    it('should return default configuration', () => {
      const config = getDefaultPensionTopUpConfig()

      expect(config.birthYear).toBe(1980)
      expect(config.desiredRetirementAge).toBe(63)
      expect(config.currentPensionPoints).toBe(30)
      expect(config.targetPensionPoints).toBeUndefined()
      expect(config.paymentYear).toBeGreaterThanOrEqual(2024)
    })
  })

  describe('validatePensionTopUpConfig', () => {
    it('should validate correct configuration without errors', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 30,
        paymentYear: 2024,
      }

      const errors = validatePensionTopUpConfig(config)
      expect(errors).toEqual([])
    })

    it('should reject invalid birth year', () => {
      const config1: PensionTopUpConfig = {
        birthYear: 1930,
        desiredRetirementAge: 65,
        currentPensionPoints: 30,
        paymentYear: 2024,
      }

      const config2: PensionTopUpConfig = {
        birthYear: 2025,
        desiredRetirementAge: 65,
        currentPensionPoints: 30,
        paymentYear: 2024,
      }

      expect(validatePensionTopUpConfig(config1)).toContain('Geburtsjahr muss zwischen 1940 und 2020 liegen')
      expect(validatePensionTopUpConfig(config2)).toContain('Geburtsjahr muss zwischen 1940 und 2020 liegen')
    })

    it('should reject invalid desired retirement age', () => {
      const config1: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 45,
        currentPensionPoints: 30,
        paymentYear: 2024,
      }

      const config2: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 80,
        currentPensionPoints: 30,
        paymentYear: 2024,
      }

      expect(validatePensionTopUpConfig(config1)).toContain(
        'Gewünschtes Renteneintrittsalter muss zwischen 50 und 75 Jahren liegen'
      )
      expect(validatePensionTopUpConfig(config2)).toContain(
        'Gewünschtes Renteneintrittsalter muss zwischen 50 und 75 Jahren liegen'
      )
    })

    it('should reject negative pension points', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: -10,
        paymentYear: 2024,
      }

      expect(validatePensionTopUpConfig(config)).toContain('Aktuelle Rentenpunkte können nicht negativ sein')
    })

    it('should reject target pension points less than current', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 40,
        targetPensionPoints: 30,
        paymentYear: 2024,
      }

      expect(validatePensionTopUpConfig(config)).toContain(
        'Ziel-Rentenpunkte müssen größer als aktuelle Rentenpunkte sein'
      )
    })

    it('should reject invalid payment year', () => {
      const config1: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 30,
        paymentYear: 1999,
      }

      const config2: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 30,
        paymentYear: 2101,
      }

      expect(validatePensionTopUpConfig(config1)).toContain('Zahlungsjahr muss zwischen 2000 und 2100 liegen')
      expect(validatePensionTopUpConfig(config2)).toContain('Zahlungsjahr muss zwischen 2000 und 2100 liegen')
    })

    it('should warn when desired retirement age is after standard age', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 68,
        currentPensionPoints: 30,
        paymentYear: 2024,
      }

      const errors = validatePensionTopUpConfig(config)
      expect(errors.some((e) => e.includes('liegt nach Regelaltersgrenze'))).toBe(true)
    })

    it('should return multiple errors for multiple violations', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1930,
        desiredRetirementAge: 45,
        currentPensionPoints: -5,
        paymentYear: 1999,
      }

      const errors = validatePensionTopUpConfig(config)
      expect(errors.length).toBeGreaterThan(2)
    })
  })

  describe('calculateBreakEven', () => {
    it('should calculate break-even point correctly', () => {
      // 100€/month benefit, 10,000€ cost = 100€ × 12 = 1,200€/year
      // Break-even: 10,000€ / 1,200€ = 8.33 years
      const years = calculateBreakEven(100, 10000)
      expect(years).toBeCloseTo(8.33, 1)
    })

    it('should return Infinity for zero benefit', () => {
      const years = calculateBreakEven(0, 10000)
      expect(years).toBe(Infinity)
    })

    it('should return Infinity for negative benefit', () => {
      const years = calculateBreakEven(-100, 10000)
      expect(years).toBe(Infinity)
    })

    it('should handle small monthly benefits', () => {
      // 10€/month benefit, 1,000€ cost = 10€ × 12 = 120€/year
      // Break-even: 1,000€ / 120€ = 8.33 years
      const years = calculateBreakEven(10, 1000)
      expect(years).toBeCloseTo(8.33, 1)
    })
  })

  describe('calculatePensionDeductionOffset', () => {
    it('should calculate offset for 4 years early retirement', () => {
      // Birth year 1980 → Standard retirement age 67
      // Desired age 63 → 4 years early = 48 months
      // Deduction: 48 months × 0.3% = 14.4%
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 40,
        paymentYear: 2024,
      }

      const result = calculatePensionDeductionOffset(config)

      expect(result.standardRetirementAge).toBe(67)
      expect(result.desiredRetirementAge).toBe(63)
      expect(result.monthsOfEarlyRetirement).toBe(48)
      expect(result.totalDeductionPercentage).toBeCloseTo(0.144, 3) // 14.4%
      expect(result.taxDeductibility).toBe(1.0)
      
      // Monthly pension lost = 40 points × 37.60 EUR × 14.4%
      const expectedMonthlyLoss = 40 * 37.60 * 0.144
      expect(result.monthlyPensionLost).toBeCloseTo(expectedMonthlyLoss, 2)
      
      // Offset cost should be positive
      expect(result.offsetCost).toBeGreaterThan(0)
    })

    it('should calculate zero deduction for standard retirement age', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 67,
        currentPensionPoints: 40,
        paymentYear: 2024,
      }

      const result = calculatePensionDeductionOffset(config)

      expect(result.monthsOfEarlyRetirement).toBe(0)
      expect(result.totalDeductionPercentage).toBe(0)
      expect(result.monthlyPensionLost).toBe(0)
    })

    it('should use custom pension value when provided', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 40,
        customPensionValue: 40.0,
        paymentYear: 2024,
      }

      const result = calculatePensionDeductionOffset(config)

      // Monthly pension lost = 40 points × 40.0 EUR × 14.4%
      const expectedMonthlyLoss = 40 * 40.0 * 0.144
      expect(result.monthlyPensionLost).toBeCloseTo(expectedMonthlyLoss, 2)
    })

    it('should handle different birth years correctly', () => {
      // Birth year 1958 → Standard retirement age 66
      // Desired age 63 → 3 years early = 36 months
      const config: PensionTopUpConfig = {
        birthYear: 1958,
        desiredRetirementAge: 63,
        currentPensionPoints: 35,
        paymentYear: 2024,
      }

      const result = calculatePensionDeductionOffset(config)

      expect(result.standardRetirementAge).toBe(66)
      expect(result.monthsOfEarlyRetirement).toBe(36)
      expect(result.totalDeductionPercentage).toBeCloseTo(0.108, 3) // 10.8%
    })
  })

  describe('calculatePensionPointsPurchase', () => {
    it('should calculate cost for purchasing additional pension points', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 30,
        targetPensionPoints: 40,
        paymentYear: 2024,
      }

      const result = calculatePensionPointsPurchase(config)

      expect(result).not.toBeNull()
      expect(result!.currentPensionPoints).toBe(30)
      expect(result!.targetPensionPoints).toBe(40)
      expect(result!.additionalPoints).toBe(10)
      expect(result!.costPerPoint).toBeGreaterThan(0)
      expect(result!.totalCost).toBe(result!.additionalPoints * result!.costPerPoint)
      expect(result!.taxDeductibility).toBe(1.0)
      
      // Additional monthly pension = 10 points × 37.60 EUR
      expect(result!.additionalMonthlyPension).toBeCloseTo(10 * 37.60, 2)
    })

    it('should return null when no target pension points provided', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 30,
        paymentYear: 2024,
      }

      const result = calculatePensionPointsPurchase(config)

      expect(result).toBeNull()
    })

    it('should handle target equal to current (zero additional points)', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 35,
        targetPensionPoints: 35,
        paymentYear: 2024,
      }

      const result = calculatePensionPointsPurchase(config)

      expect(result!.additionalPoints).toBe(0)
      expect(result!.totalCost).toBe(0)
      expect(result!.additionalMonthlyPension).toBe(0)
    })

    it('should use custom pension value when provided', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 30,
        targetPensionPoints: 35,
        customPensionValue: 40.0,
        paymentYear: 2024,
      }

      const result = calculatePensionPointsPurchase(config)

      // Additional monthly pension = 5 points × 40.0 EUR
      expect(result!.additionalMonthlyPension).toBeCloseTo(5 * 40.0, 2)
      expect(result!.pensionValue).toBe(40.0)
    })
  })

  describe('calculatePensionTopUp', () => {
    it('should calculate both deduction offset and points purchase', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 30,
        targetPensionPoints: 40,
        paymentYear: 2024,
      }

      const result = calculatePensionTopUp(config)

      // Deduction offset should be calculated
      expect(result.deductionOffset).toBeDefined()
      expect(result.deductionOffset.standardRetirementAge).toBe(67)
      expect(result.deductionOffset.desiredRetirementAge).toBe(63)

      // Points purchase should be calculated
      expect(result.pointsPurchase).toBeDefined()
      expect(result.pointsPurchase!.additionalPoints).toBe(10)

      // Break-even analysis should be present
      expect(result.breakEvenAnalysis.yearsUntilBreakEvenDeduction).toBeGreaterThan(0)
      expect(result.breakEvenAnalysis.yearsUntilBreakEvenPurchase).toBeGreaterThan(0)
    })

    it('should calculate only deduction offset when no target points', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 63,
        currentPensionPoints: 30,
        paymentYear: 2024,
      }

      const result = calculatePensionTopUp(config)

      // Deduction offset should be calculated
      expect(result.deductionOffset).toBeDefined()

      // Points purchase should not be calculated
      expect(result.pointsPurchase).toBeUndefined()

      // Break-even analysis should only have deduction
      expect(result.breakEvenAnalysis.yearsUntilBreakEvenDeduction).toBeGreaterThan(0)
      expect(result.breakEvenAnalysis.yearsUntilBreakEvenPurchase).toBeUndefined()
    })

    it('should calculate realistic scenario for person born in 1975', () => {
      // Person born 1975, currently 49 years old (in 2024)
      // Standard retirement: 66 years and 2 months
      // Wants to retire at 63 (3 years and 2 months early = 38 months)
      // Has 25 pension points, wants 35
      const config: PensionTopUpConfig = {
        birthYear: 1975,
        desiredRetirementAge: 63,
        currentPensionPoints: 25,
        targetPensionPoints: 35,
        paymentYear: 2024,
      }

      const result = calculatePensionTopUp(config)

      // Verify deduction calculation
      expect(result.deductionOffset.monthsOfEarlyRetirement).toBeGreaterThan(30)
      expect(result.deductionOffset.totalDeductionPercentage).toBeGreaterThan(0.09) // At least 9%

      // Verify points purchase
      expect(result.pointsPurchase!.additionalPoints).toBe(10)
      expect(result.pointsPurchase!.totalCost).toBeGreaterThan(0)

      // Verify break-even calculations are present
      // Note: Break-even can be long depending on cost structure
      expect(result.breakEvenAnalysis.yearsUntilBreakEvenDeduction).toBeGreaterThan(0)
      expect(result.breakEvenAnalysis.yearsUntilBreakEvenPurchase!).toBeGreaterThan(0)
    })

    it('should handle standard retirement age scenario', () => {
      const config: PensionTopUpConfig = {
        birthYear: 1980,
        desiredRetirementAge: 67,
        currentPensionPoints: 30,
        targetPensionPoints: 35,
        paymentYear: 2024,
      }

      const result = calculatePensionTopUp(config)

      // No deduction offset needed
      expect(result.deductionOffset.monthsOfEarlyRetirement).toBe(0)
      expect(result.deductionOffset.totalDeductionPercentage).toBe(0)
      expect(result.deductionOffset.monthlyPensionLost).toBe(0)

      // Points purchase still calculated
      expect(result.pointsPurchase!.additionalPoints).toBe(5)

      // Break-even for deduction should be Infinity (no benefit)
      expect(result.breakEvenAnalysis.yearsUntilBreakEvenDeduction).toBe(Infinity)
    })
  })
})
