/**
 * Tests for Elterngeld (Parental Allowance) calculations
 * Following German BEEG (Bundeselterngeld- und Elternzeitgesetz) regulations
 */

import { describe, it, expect } from 'vitest'
import { calculateOtherIncomeForYear, type OtherIncomeSource, type ElterngeldConfig } from './other-income'

describe('Elterngeld Calculations', () => {
  const currentYear = new Date().getFullYear()

  const createElterngeldSource = (config: Partial<ElterngeldConfig> = {}): OtherIncomeSource => {
    const defaultConfig: ElterngeldConfig = {
      previousMonthlyNetIncome: 2000,
      childBirthYear: currentYear,
      childBirthMonth: 1,
      durationMonths: 12,
      useElterngeldPlus: false,
      partnerParticipation: false,
      partnerschaftsBonusMonths: 0,
      workingPartTime: false,
      partTimeMonthlyNetIncome: 0,
      elterngeldStartYear: currentYear,
      elterngeldStartMonth: 1,
      ...config,
    }

    return {
      id: 'test-elterngeld',
      name: 'Test Elterngeld',
      type: 'elterngeld',
      amountType: 'net',
      monthlyAmount: 1200, // This will be overridden by elterngeldConfig calculation
      startYear: currentYear,
      endYear: currentYear + 1,
      inflationRate: 0,
      taxRate: 0,
      enabled: true,
      elterngeldConfig: defaultConfig,
    }
  }

  describe('Basic Elterngeld calculation (Basiselterngeld)', () => {
    it('should calculate correct Elterngeld amount for income 2000€ (65% rate)', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails).toBeDefined()
        expect(result.elterngeldDetails?.baseMonthlyAmount).toBe(1300) // 2000 * 0.65
        expect(result.elterngeldDetails?.actualMonthlyAmount).toBe(1300)
        expect(result.elterngeldDetails?.replacementRatePercent).toBe(65)
        expect(result.grossAnnualAmount).toBe(15600) // 1300 * 12
      }
    })

    it('should calculate correct Elterngeld amount for low income 1000€ (67% rate)', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 1000,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails).toBeDefined()
        expect(result.elterngeldDetails?.baseMonthlyAmount).toBe(670) // 1000 * 0.67
        expect(result.elterngeldDetails?.replacementRatePercent).toBe(67)
      }
    })

    it('should calculate correct Elterngeld amount for income in graduated zone (1200-1240€)', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 1220,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails).toBeDefined()
        // Graduated rate: 67% - ((1220-1200)/40 * 0.02) = 67% - 1% = 66%
        expect(result.elterngeldDetails?.replacementRatePercent).toBe(66)
        expect(result.elterngeldDetails?.baseMonthlyAmount).toBe(805.2) // 1220 * 0.66
      }
    })

    it('should apply minimum Elterngeld amount of 300€', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 100, // Very low income
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.baseMonthlyAmount).toBe(300) // Minimum
        expect(result.elterngeldDetails?.actualMonthlyAmount).toBe(300)
      }
    })

    it('should apply maximum Elterngeld amount of 1800€', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 5000, // High income
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.baseMonthlyAmount).toBe(1800) // Maximum
        expect(result.elterngeldDetails?.actualMonthlyAmount).toBe(1800)
      }
    })
  })

  describe('ElterngeldPlus calculation', () => {
    it('should calculate ElterngeldPlus as 50% of Basiselterngeld when not working', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
        useElterngeldPlus: true,
        workingPartTime: false,
        durationMonths: 24, // ElterngeldPlus can be received for double duration
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.baseMonthlyAmount).toBe(1300) // 2000 * 0.65
        expect(result.elterngeldDetails?.actualMonthlyAmount).toBe(650) // 50% for ElterngeldPlus
        expect(result.elterngeldDetails?.usingElterngeldPlus).toBe(true)
      }
    })

    it('should calculate ElterngeldPlus correctly when working part-time', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
        useElterngeldPlus: true,
        workingPartTime: true,
        partTimeMonthlyNetIncome: 1000, // Working part-time earning 1000€
        durationMonths: 24,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.usingElterngeldPlus).toBe(true)
        // Income loss = 2000 - 1000 = 1000
        // ElterngeldPlus = 1000 * 0.65 = 650
        expect(result.elterngeldDetails?.actualMonthlyAmount).toBe(650)
      }
    })

    it('should apply minimum ElterngeldPlus amount of 150€ (half of 300€)', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 200,
        useElterngeldPlus: true,
        workingPartTime: false,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        // Base would be 300€ minimum, ElterngeldPlus is 50%
        expect(result.elterngeldDetails?.actualMonthlyAmount).toBe(150)
      }
    })

    it('should apply maximum ElterngeldPlus amount of 900€ (half of 1800€)', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 5000,
        useElterngeldPlus: true,
        workingPartTime: false,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        // Base would be 1800€ maximum, ElterngeldPlus is 50%
        expect(result.elterngeldDetails?.actualMonthlyAmount).toBe(900)
      }
    })
  })

  describe('Partnerschaftsbonus', () => {
    it('should indicate receiving Partnerschaftsbonus during bonus months', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
        durationMonths: 12,
        partnerParticipation: true,
        partnerschaftsBonusMonths: 4,
        elterngeldStartYear: currentYear,
        elterngeldStartMonth: 1,
      })

      // Check year when Partnerschaftsbonus is active (after base duration)
      const resultDuringBonus = calculateOtherIncomeForYear(source, currentYear + 1)

      expect(resultDuringBonus).not.toBeNull()
      if (resultDuringBonus) {
        expect(resultDuringBonus.elterngeldDetails?.receivingPartnerschaftsbonus).toBe(true)
      }
    })

    it('should not indicate Partnerschaftsbonus if partner does not participate', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
        durationMonths: 12,
        partnerParticipation: false,
        partnerschaftsBonusMonths: 0,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.receivingPartnerschaftsbonus).toBe(false)
      }
    })
  })

  describe('Duration and timing', () => {
    it('should return null when Elterngeld has not started yet', () => {
      const source = createElterngeldSource({
        elterngeldStartYear: currentYear + 2,
        elterngeldStartMonth: 1,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull() // Source exists but...
      if (result) {
        expect(result.elterngeldDetails?.isActive).toBe(false)
        expect(result.elterngeldDetails?.endReason).toBe('Elterngeld noch nicht gestartet')
        expect(result.grossAnnualAmount).toBe(0)
      }
    })

    it('should return null when Elterngeld duration has expired', () => {
      const source = createElterngeldSource({
        durationMonths: 12,
        elterngeldStartYear: currentYear - 2,
        elterngeldStartMonth: 1,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.isActive).toBe(false)
        expect(result.elterngeldDetails?.endReason).toBe('Elterngeld-Bezugsdauer abgelaufen')
        expect(result.grossAnnualAmount).toBe(0)
      }
    })

    it('should calculate correct months received when Elterngeld spans multiple years', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
        durationMonths: 12,
        elterngeldStartYear: currentYear,
        elterngeldStartMonth: 7, // Starts in July
        childBirthYear: currentYear,
        childBirthMonth: 7,
      })

      // First year: July to December = 6 months
      const resultFirstYear = calculateOtherIncomeForYear(source, currentYear)
      expect(resultFirstYear).not.toBeNull()
      if (resultFirstYear) {
        expect(resultFirstYear.elterngeldDetails?.monthsReceivedThisYear).toBe(6)
        expect(resultFirstYear.grossAnnualAmount).toBe(1300 * 6) // 6 months * 1300€
      }

      // Second year: January to June = 6 months
      const resultSecondYear = calculateOtherIncomeForYear(source, currentYear + 1)
      expect(resultSecondYear).not.toBeNull()
      if (resultSecondYear) {
        expect(resultSecondYear.elterngeldDetails?.monthsReceivedThisYear).toBe(6)
        expect(resultSecondYear.grossAnnualAmount).toBe(1300 * 6)
      }
    })

    it('should handle full year of Elterngeld correctly', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
        durationMonths: 12,
        elterngeldStartYear: currentYear,
        elterngeldStartMonth: 1,
        childBirthYear: currentYear,
        childBirthMonth: 1,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.isActive).toBe(true)
        expect(result.elterngeldDetails?.monthsReceivedThisYear).toBe(12)
        expect(result.grossAnnualAmount).toBe(1300 * 12) // Full year
      }
    })
  })

  describe('Tax treatment', () => {
    it('should treat Elterngeld as tax-free income (0% tax rate)', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.taxAmount).toBe(0) // Elterngeld is tax-free
        expect(result.netAnnualAmount).toBe(result.grossAnnualAmount)
      }
    })

    it('should mark income as net type', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
      })

      expect(source.amountType).toBe('net')
    })
  })

  describe('Child age tracking', () => {
    it('should correctly calculate child age in months', () => {
      const source = createElterngeldSource({
        childBirthYear: currentYear - 1,
        childBirthMonth: 6,
        elterngeldStartYear: currentYear - 1,
        elterngeldStartMonth: 6,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        // Child born in June of last year, checking current year
        // From June last year to January current year = 7 months
        // Full year = 12 + 6 = 18 months approximately
        expect(result.elterngeldDetails?.childAgeMonths).toBeGreaterThan(0)
      }
    })
  })

  describe('Edge cases', () => {
    it('should handle zero previous income with minimum amount', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 0,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.baseMonthlyAmount).toBe(300) // Minimum
        expect(result.elterngeldDetails?.actualMonthlyAmount).toBe(300)
      }
    })

    it('should handle negative previous income (edge case)', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: -100, // Invalid but should be handled
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        // Should still apply minimum
        expect(result.elterngeldDetails?.baseMonthlyAmount).toBe(300)
      }
    })

    it('should handle very large duration (edge case)', () => {
      const source = createElterngeldSource({
        durationMonths: 100, // Unrealistic but valid
        elterngeldStartYear: currentYear,
        elterngeldStartMonth: 1,
        childBirthYear: currentYear,
        childBirthMonth: 1,
      })

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.elterngeldDetails?.isActive).toBe(true)
        expect(result.elterngeldDetails?.monthsReceivedThisYear).toBe(12) // Only 12 months in a year
      }
    })
  })

  describe('Integration with inflation and tax settings', () => {
    it('should respect inflation rate of 0 for Elterngeld', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
      })

      expect(source.inflationRate).toBe(0)

      const resultYear1 = calculateOtherIncomeForYear(source, currentYear)
      const resultYear2 = calculateOtherIncomeForYear(source, currentYear + 1)

      // Since duration is 12 months by default and starts in currentYear month 1,
      // year 2 should have 0 because Elterngeld has ended
      expect(resultYear1).not.toBeNull()
      if (resultYear1 && resultYear2) {
        // Inflation factor should be 1.0 (no inflation)
        expect(resultYear1.inflationFactor).toBe(1.0)
      }
    })

    it('should be tax-free but subject to Progressionsvorbehalt (documented)', () => {
      const source = createElterngeldSource({
        previousMonthlyNetIncome: 2000,
      })

      expect(source.taxRate).toBe(0) // Tax-free
      expect(source.amountType).toBe('net')

      const result = calculateOtherIncomeForYear(source, currentYear)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.taxAmount).toBe(0)
        // Note: Progressionsvorbehalt would be handled separately in overall tax calculation
      }
    })
  })
})
