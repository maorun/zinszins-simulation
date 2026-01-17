import { describe, it, expect } from 'vitest'
import {
  RETIREMENT_INCOME_THRESHOLDS,
  SAFE_WITHDRAWAL_RULE,
  DEFAULT_TAX_RATES,
  PERCENTILE_CONSTANTS,
} from './business-constants'

describe('business-constants', () => {
  describe('RETIREMENT_INCOME_THRESHOLDS', () => {
    it('should define minimum monthly income as 2000 EUR', () => {
      expect(RETIREMENT_INCOME_THRESHOLDS.MIN_MONTHLY_INCOME).toBe(2000)
    })

    it('should define good monthly income as 3000 EUR', () => {
      expect(RETIREMENT_INCOME_THRESHOLDS.GOOD_MONTHLY_INCOME).toBe(3000)
    })

    it('should have good monthly income greater than minimum', () => {
      expect(RETIREMENT_INCOME_THRESHOLDS.GOOD_MONTHLY_INCOME).toBeGreaterThan(
        RETIREMENT_INCOME_THRESHOLDS.MIN_MONTHLY_INCOME
      )
    })

    it('should have realistic retirement income thresholds', () => {
      // Verify thresholds are in a reasonable range (> 1000, < 10000 EUR/month)
      expect(RETIREMENT_INCOME_THRESHOLDS.MIN_MONTHLY_INCOME).toBeGreaterThan(1000)
      expect(RETIREMENT_INCOME_THRESHOLDS.MIN_MONTHLY_INCOME).toBeLessThan(10000)
      expect(RETIREMENT_INCOME_THRESHOLDS.GOOD_MONTHLY_INCOME).toBeGreaterThan(1000)
      expect(RETIREMENT_INCOME_THRESHOLDS.GOOD_MONTHLY_INCOME).toBeLessThan(10000)
    })
  })

  describe('SAFE_WITHDRAWAL_RULE', () => {
    it('should define capital multiplier as 25', () => {
      expect(SAFE_WITHDRAWAL_RULE.CAPITAL_MULTIPLIER).toBe(25)
    })

    it('should define safe withdrawal rate as 0.04 (4%)', () => {
      expect(SAFE_WITHDRAWAL_RULE.SAFE_WITHDRAWAL_RATE).toBe(0.04)
    })

    it('should have mathematically consistent multiplier and rate', () => {
      // Verify 1 / SAFE_WITHDRAWAL_RATE = CAPITAL_MULTIPLIER
      const expectedMultiplier = 1 / SAFE_WITHDRAWAL_RULE.SAFE_WITHDRAWAL_RATE
      expect(SAFE_WITHDRAWAL_RULE.CAPITAL_MULTIPLIER).toBe(expectedMultiplier)
    })
  })

  describe('DEFAULT_TAX_RATES', () => {
    it('should define Kapitalertragsteuer as 26.375%', () => {
      expect(DEFAULT_TAX_RATES.KAPITALERTRAGSTEUER).toBe(0.26375)
    })

    it('should define Teilfreistellungsquote for equity funds as 30%', () => {
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_AKTIEN).toBe(0.3)
    })

    it('should define Teilfreistellungsquote for mixed funds as 15%', () => {
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_MISCH).toBe(0.15)
    })

    it('should define Teilfreistellungsquote for real estate funds as 60%', () => {
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_IMMOBILIEN).toBe(0.6)
    })

    it('should have all tax rates as valid percentages (0-1)', () => {
      expect(DEFAULT_TAX_RATES.KAPITALERTRAGSTEUER).toBeGreaterThan(0)
      expect(DEFAULT_TAX_RATES.KAPITALERTRAGSTEUER).toBeLessThan(1)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_AKTIEN).toBeGreaterThan(0)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_AKTIEN).toBeLessThan(1)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_MISCH).toBeGreaterThan(0)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_MISCH).toBeLessThan(1)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_IMMOBILIEN).toBeGreaterThan(0)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_IMMOBILIEN).toBeLessThan(1)
    })

    it('should have real estate Teilfreistellungsquote highest, then equity, then mixed', () => {
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_IMMOBILIEN).toBeGreaterThan(
        DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_AKTIEN
      )
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_AKTIEN).toBeGreaterThan(
        DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_MISCH
      )
    })
  })

  describe('PERCENTILE_CONSTANTS', () => {
    it('should define base percentile as 100', () => {
      expect(PERCENTILE_CONSTANTS.BASE).toBe(100)
    })
  })

  describe('constants immutability', () => {
    it('should have all constants as const values', () => {
      // This is a compile-time check enforced by TypeScript's "as const"
      // We verify the values exist and are of expected types
      expect(RETIREMENT_INCOME_THRESHOLDS.MIN_MONTHLY_INCOME).toEqual(2000)
      expect(RETIREMENT_INCOME_THRESHOLDS.GOOD_MONTHLY_INCOME).toEqual(3000)
      expect(SAFE_WITHDRAWAL_RULE.CAPITAL_MULTIPLIER).toEqual(25)
      expect(SAFE_WITHDRAWAL_RULE.SAFE_WITHDRAWAL_RATE).toEqual(0.04)
      expect(DEFAULT_TAX_RATES.KAPITALERTRAGSTEUER).toEqual(0.26375)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_AKTIEN).toEqual(0.3)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_MISCH).toEqual(0.15)
      expect(DEFAULT_TAX_RATES.TEILFREISTELLUNGSQUOTE_IMMOBILIEN).toEqual(0.6)
      expect(PERCENTILE_CONSTANTS.BASE).toEqual(100)
    })
  })

  describe('business logic consistency', () => {
    it('should have retirement thresholds that work with safe withdrawal rule', () => {
      // With minimum monthly income, calculate required capital
      const minAnnualIncome = RETIREMENT_INCOME_THRESHOLDS.MIN_MONTHLY_INCOME * 12
      const requiredCapital = minAnnualIncome * SAFE_WITHDRAWAL_RULE.CAPITAL_MULTIPLIER
      
      // Verify capital calculation is reasonable (should be 600,000 EUR)
      expect(requiredCapital).toBe(600000)
    })

    it('should calculate correct withdrawal amount from capital', () => {
      // Test the 4% rule: 100,000 EUR capital should provide 4,000 EUR annually
      const capital = 100000
      const annualWithdrawal = capital * SAFE_WITHDRAWAL_RULE.SAFE_WITHDRAWAL_RATE
      expect(annualWithdrawal).toBe(4000)
    })
  })
})
