import { describe, it, expect } from 'vitest'
import {
  calculateMonthlyPayment,
  calculateTotalInterest,
  generateAmortizationSchedule,
  calculateRemainingBalance,
  getDefaultCreditTerms,
} from './credit-calculation'

describe('credit-calculation', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate correct monthly payment for standard loan', () => {
      // €20,000 loan at 5% for 5 years
      const payment = calculateMonthlyPayment(20000, 0.05, 5)
      expect(payment).toBeCloseTo(377.42, 2) // Standard car loan calculation
    })

    it('should handle zero interest loans', () => {
      // €12,000 loan at 0% for 4 years
      const payment = calculateMonthlyPayment(12000, 0, 4)
      expect(payment).toBe(250) // 12000 / (4 * 12) = 250
    })

    it('should calculate mortgage payment correctly', () => {
      // €300,000 mortgage at 3.5% for 30 years
      const payment = calculateMonthlyPayment(300000, 0.035, 30)
      expect(payment).toBeCloseTo(1347.13, 2)
    })

    it('should handle very short term loans', () => {
      // €1,000 loan at 10% for 1 year
      const payment = calculateMonthlyPayment(1000, 0.10, 1)
      expect(payment).toBeCloseTo(87.92, 2)
    })
  })

  describe('calculateTotalInterest', () => {
    it('should calculate total interest for car loan', () => {
      // €20,000 at 5% for 5 years
      const totalInterest = calculateTotalInterest(20000, 0.05, 5)
      const monthlyPayment = calculateMonthlyPayment(20000, 0.05, 5)
      const expectedInterest = (monthlyPayment * 60) - 20000
      expect(totalInterest).toBeCloseTo(expectedInterest, 2)
    })

    it('should return zero interest for zero rate loans', () => {
      const totalInterest = calculateTotalInterest(10000, 0, 3)
      expect(totalInterest).toBe(0)
    })
  })

  describe('generateAmortizationSchedule', () => {
    it('should generate correct amortization schedule', () => {
      // €10,000 at 6% for 2 years
      const schedule = generateAmortizationSchedule(10000, 0.06, 2)

      expect(schedule).toHaveLength(2)
      expect(schedule[0].year).toBe(1)
      expect(schedule[1].year).toBe(2)

      // First year should have higher interest portion
      expect(schedule[0].interest).toBeGreaterThan(schedule[1].interest)

      // Principal should increase each year
      expect(schedule[0].principal).toBeLessThan(schedule[1].principal)

      // Balance should decrease each year
      expect(schedule[0].beginningBalance).toBe(10000)
      expect(schedule[1].endingBalance).toBeCloseTo(0, 2)

      // Total payments should equal principal + interest
      const totalPayments = schedule.reduce((sum, year) => sum + year.payment, 0)
      const totalInterest = schedule.reduce((sum, year) => sum + year.interest, 0)
      expect(totalPayments).toBeCloseTo(10000 + totalInterest, 2)
    })

    it('should handle zero interest amortization', () => {
      const schedule = generateAmortizationSchedule(6000, 0, 3)

      expect(schedule).toHaveLength(3)
      expect(schedule[0].interest).toBe(0)
      expect(schedule[1].interest).toBe(0)
      expect(schedule[2].interest).toBe(0)

      // Each year should pay exactly 1/3 of principal
      expect(schedule[0].principal).toBe(2000)
      expect(schedule[1].principal).toBe(2000)
      expect(schedule[2].principal).toBe(2000)

      expect(schedule[2].endingBalance).toBe(0)
    })

    it('should have consistent balance calculations', () => {
      const schedule = generateAmortizationSchedule(15000, 0.04, 3)

      // Each year's ending balance should equal next year's beginning balance
      expect(schedule[0].endingBalance).toBeCloseTo(schedule[1].beginningBalance, 2)
      expect(schedule[1].endingBalance).toBeCloseTo(schedule[2].beginningBalance, 2)

      // Payment should equal principal + interest each year
      schedule.forEach((year) => {
        expect(year.payment).toBeCloseTo(year.principal + year.interest, 2)
      })
    })
  })

  describe('calculateRemainingBalance', () => {
    it('should calculate remaining balance correctly', () => {
      // €20,000 at 5% for 5 years, after 24 payments (2 years)
      const remaining = calculateRemainingBalance(20000, 0.05, 5, 24)
      expect(remaining).toBeGreaterThan(0)
      expect(remaining).toBeLessThan(20000)

      // Should be roughly 63% of original (after 2 years of 5)
      expect(remaining).toBeCloseTo(12593, 0) // Within €1
    })

    it('should return zero when all payments are made', () => {
      const remaining = calculateRemainingBalance(10000, 0.04, 3, 36)
      expect(remaining).toBe(0)
    })

    it('should return zero when payments exceed term', () => {
      const remaining = calculateRemainingBalance(10000, 0.04, 3, 50)
      expect(remaining).toBe(0)
    })

    it('should handle zero interest loans', () => {
      // €12,000 at 0% for 4 years, after 24 payments
      const remaining = calculateRemainingBalance(12000, 0, 4, 24)
      expect(remaining).toBe(6000) // Exactly half remaining
    })

    it('should return full principal for zero payments', () => {
      const remaining = calculateRemainingBalance(15000, 0.06, 5, 0)
      expect(remaining).toBeCloseTo(15000, 2)
    })
  })

  describe('getDefaultCreditTerms', () => {
    it('should provide reasonable car loan defaults', () => {
      const terms = getDefaultCreditTerms('car', 25000)

      expect(terms.interestRate).toBe(0.045) // 4.5%
      expect(terms.termYears).toBe(5)
      expect(terms.monthlyPayment).toBeGreaterThan(0)
      expect(terms.monthlyPayment).toBeCloseTo(466.08, 2)
    })

    it('should provide reasonable real estate loan defaults', () => {
      const terms = getDefaultCreditTerms('real_estate', 200000)

      expect(terms.interestRate).toBe(0.035) // 3.5%
      expect(terms.termYears).toBe(20)
      expect(terms.monthlyPayment).toBeGreaterThan(0)
    })

    it('should provide reasonable education loan defaults', () => {
      const terms = getDefaultCreditTerms('education', 30000)

      expect(terms.interestRate).toBe(0.025) // 2.5%
      expect(terms.termYears).toBe(10)
      expect(terms.monthlyPayment).toBeGreaterThan(0)
    })

    it('should provide reasonable medical expense defaults', () => {
      const terms = getDefaultCreditTerms('medical', 5000)

      expect(terms.interestRate).toBe(0.040) // 4.0%
      expect(terms.termYears).toBe(3)
      expect(terms.monthlyPayment).toBeGreaterThan(0)
    })

    it('should fall back to default terms for unknown expense types', () => {
      const terms = getDefaultCreditTerms('unknown_expense', 10000)

      expect(terms.interestRate).toBe(0.050) // 5.0%
      expect(terms.termYears).toBe(5)
      expect(terms.monthlyPayment).toBeGreaterThan(0)
    })

    it('should calculate monthly payment correctly for all defaults', () => {
      const amount = 10000
      const terms = getDefaultCreditTerms('car', amount)

      const expectedPayment = calculateMonthlyPayment(
        amount,
        terms.interestRate,
        terms.termYears,
      )

      expect(terms.monthlyPayment).toBeCloseTo(expectedPayment, 2)
    })
  })

  describe('Integration tests', () => {
    it('should maintain mathematical consistency across functions', () => {
      const principal = 50000
      const rate = 0.045
      const term = 7

      const monthlyPayment = calculateMonthlyPayment(principal, rate, term)
      const totalInterest = calculateTotalInterest(principal, rate, term)
      const schedule = generateAmortizationSchedule(principal, rate, term)

      // Total of all payments should equal principal + total interest
      const scheduleTotal = schedule.reduce((sum, year) => sum + year.payment, 0)
      expect(scheduleTotal).toBeCloseTo(principal + totalInterest, 2)

      // Monthly payment * 12 should roughly equal yearly payment
      expect(monthlyPayment * 12).toBeCloseTo(schedule[0].payment, 2)

      // Remaining balance after all payments should be zero
      const finalBalance = calculateRemainingBalance(principal, rate, term, term * 12)
      expect(finalBalance).toBeCloseTo(0, 2)
    })
  })
})
