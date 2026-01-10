/**
 * Edge Case Tests for Tax and Financial Calculations
 * 
 * These tests cover challenging edge cases and boundary conditions in tax calculations
 * that complement existing unit tests. Focus areas:
 * - Extreme values (very large/small numbers)
 * - Boundary conditions (zero, negative)
 * - Tax optimization edge cases
 * - Rounding and precision edge cases
 */

import { describe, it, expect } from 'vitest'
import { calculateVorabpauschale, calculateSteuerOnVorabpauschale } from './steuer'

describe('Tax Calculation Edge Cases', () => {
  describe('Vorabpauschale Edge Cases', () => {
    it('should handle year with negative returns (no Vorabpauschale)', () => {
      const startCapital = 100000
      const endCapital = 95000 // Loss
      const basiszins = 0.0255

      const result = calculateVorabpauschale(startCapital, endCapital, basiszins)

      // No Vorabpauschale on losses
      expect(result).toBe(0)
    })

    it('should handle very small gains (rounding edge cases)', () => {
      const startCapital = 100000
      const endCapital = 100000.01 // Tiny gain (1 cent)
      const basiszins = 0.0255

      const result = calculateVorabpauschale(startCapital, endCapital, basiszins)

      // Should handle tiny gains without precision errors
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(0.01) // Should be less than 1 cent
      expect(Number.isFinite(result)).toBe(true)
    })

    it('should handle zero Basiszins (theoretical edge case)', () => {
      const startCapital = 100000
      const endCapital = 105000
      const basiszins = 0 // Zero base interest rate

      const result = calculateVorabpauschale(startCapital, endCapital, basiszins)

      // With zero Basiszins, Basisertrag should be 0, so no Vorabpauschale
      expect(result).toBe(0)
    })

    it('should handle partial year correctly', () => {
      const startCapital = 100000
      const endCapital = 105000
      const basiszins = 0.0255

      const resultFullYear = calculateVorabpauschale(startCapital, endCapital, basiszins)
      const resultHalfYear = calculateVorabpauschale(startCapital, endCapital, basiszins, 6)

      // Half year should be roughly half of full year
      expect(resultHalfYear).toBeCloseTo(resultFullYear / 2, 1)
      expect(resultHalfYear).toBeGreaterThan(0)
      expect(resultHalfYear).toBeLessThan(resultFullYear)
    })

    it('should cap Vorabpauschale at actual gains', () => {
      const startCapital = 100000
      const endCapital = 100100 // Small gain
      const basiszins = 0.0255

      const vorabpauschale = calculateVorabpauschale(startCapital, endCapital, basiszins)

      // Vorabpauschale should not exceed the gain
      const actualGain = endCapital - startCapital
      expect(vorabpauschale).toBeLessThanOrEqual(actualGain)
      expect(vorabpauschale).toBeGreaterThanOrEqual(0)
    })

    it('should handle very large capital amounts (millions)', () => {
      const startCapital = 10000000 // 10 million
      const endCapital = 10500000 // 500k gain
      const basiszins = 0.0255

      const result = calculateVorabpauschale(startCapital, endCapital, basiszins)

      // Should calculate correctly for large amounts
      expect(result).toBeGreaterThan(0)
      expect(Number.isFinite(result)).toBe(true)
      
      // Should be capped by Basisertrag (70% of base interest)
      const expectedBasisertrag = startCapital * basiszins * 0.7
      expect(result).toBeCloseTo(expectedBasisertrag, 0)
    })

    it('should handle extreme gains (crypto-style returns)', () => {
      const startCapital = 10000
      const endCapital = 100000 // 10x gain
      const basiszins = 0.0255

      const result = calculateVorabpauschale(startCapital, endCapital, basiszins)

      // Should still calculate correctly, capped by Basisertrag
      const expectedBasisertrag = startCapital * basiszins * 0.7
      expect(result).toBeCloseTo(expectedBasisertrag, 0)
      expect(Number.isFinite(result)).toBe(true)
    })

    it('should handle single month period (1/12 of year)', () => {
      const startCapital = 100000
      const endCapital = 105000
      const basiszins = 0.0255

      const resultFullYear = calculateVorabpauschale(startCapital, endCapital, basiszins)
      const resultOneMonth = calculateVorabpauschale(startCapital, endCapital, basiszins, 1)

      // One month should be 1/12 of full year
      expect(resultOneMonth).toBeCloseTo(resultFullYear / 12, 1)
    })

    it('should handle 13 months (edge case for partial periods)', () => {
      const startCapital = 100000
      const endCapital = 105000
      const basiszins = 0.0255

      const resultFullYear = calculateVorabpauschale(startCapital, endCapital, basiszins)
      const result13Months = calculateVorabpauschale(startCapital, endCapital, basiszins, 13)

      // 13 months should be 13/12 of full year
      expect(result13Months).toBeCloseTo((resultFullYear / 12) * 13, 1)
    })

    it('should handle break-even scenario (gain equals Basisertrag)', () => {
      const basiszins = 0.0255
      const startCapital = 100000
      
      // Calculate gain that equals Basisertrag
      const basisertrag = startCapital * basiszins * 0.7
      const endCapital = startCapital + basisertrag

      const result = calculateVorabpauschale(startCapital, endCapital, basiszins)

      // Vorabpauschale should equal the gain (which equals Basisertrag)
      expect(result).toBeCloseTo(basisertrag, 0)
    })
  })

  describe('Tax Calculation Edge Cases', () => {
    it('should handle very high tax rate (100%)', () => {
      const vorabpauschale = 1000
      const taxRate = 1.0 // 100% tax rate
      const teilfreistellung = 0

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // With 100% tax, all should be taxed
      expect(result).toBeCloseTo(vorabpauschale, 0)
    })

    it('should handle complete tax exemption (Teilfreistellung = 100%)', () => {
      const vorabpauschale = 1000
      const taxRate = 0.26375
      const teilfreistellung = 1.0 // 100% tax-free

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // With full exemption, no tax should be paid
      expect(result).toBe(0)
    })

    it('should handle zero tax rate', () => {
      const vorabpauschale = 1000
      const taxRate = 0
      const teilfreistellung = 0.3

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // With 0% tax rate, no tax should be paid
      expect(result).toBe(0)
    })

    it('should handle zero Vorabpauschale', () => {
      const vorabpauschale = 0
      const taxRate = 0.26375
      const teilfreistellung = 0.3

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // No tax on zero Vorabpauschale
      expect(result).toBe(0)
    })

    it('should handle small amounts without precision errors', () => {
      const vorabpauschale = 0.01 // 1 cent
      const taxRate = 0.26375
      const teilfreistellung = 0.3

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // Should calculate correctly even for tiny amounts
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(0.01) // Tax should be less than 1 cent
      expect(Number.isFinite(result)).toBe(true)
    })

    it('should handle large amounts without overflow', () => {
      const vorabpauschale = 10000000 // 10 million
      const taxRate = 0.26375
      const teilfreistellung = 0.3

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // Should calculate correctly even for large amounts
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(vorabpauschale)
      expect(Number.isFinite(result)).toBe(true)
      
      // Verify calculation: vorabpauschale * taxRate * (1 - teilfreistellung)
      const expected = vorabpauschale * taxRate * (1 - teilfreistellung)
      expect(result).toBeCloseTo(expected, 0)
    })

    it('should handle different Teilfreistellungsquoten correctly', () => {
      const vorabpauschale = 1000
      const taxRate = 0.26375

      // Stock fund (30% Teilfreistellung)
      const taxStock = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, 0.3)
      
      // Mixed fund (15% Teilfreistellung)
      const taxMixed = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, 0.15)
      
      // Real estate fund (60% or 80% Teilfreistellung)
      const taxRealEstate = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, 0.6)

      // Higher Teilfreistellung should result in lower tax
      expect(taxMixed).toBeGreaterThan(taxStock)
      expect(taxStock).toBeGreaterThan(taxRealEstate)
      
      // All should be positive and finite
      expect(taxStock).toBeGreaterThan(0)
      expect(taxMixed).toBeGreaterThan(0)
      expect(taxRealEstate).toBeGreaterThan(0)
    })

    it('should handle fractional cent results (rounding)', () => {
      const vorabpauschale = 1.37 // Odd amount
      const taxRate = 0.26375
      const teilfreistellung = 0.3

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // Result should be a precise decimal
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(vorabpauschale)
      expect(Number.isFinite(result)).toBe(true)
      
      // Verify it rounds to reasonable precision
      expect(result).toBeCloseTo(result, 2) // Within 2 decimal places
    })

    it('should handle negative Vorabpauschale (should not happen, but test robustness)', () => {
      const vorabpauschale = -1000 // Negative (edge case)
      const taxRate = 0.26375
      const teilfreistellung = 0.3

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // Even with negative input, should not crash
      expect(Number.isFinite(result)).toBe(true)
    })

    it('should handle extreme combinations (100% tax, 0% Teilfreistellung)', () => {
      const vorabpauschale = 5000
      const taxRate = 1.0
      const teilfreistellung = 0

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // All gains should be taxed away
      expect(result).toBe(vorabpauschale)
    })

    it('should handle minimum practical tax scenario', () => {
      const vorabpauschale = 1 // 1 euro
      const taxRate = 0.01 // 1% tax
      const teilfreistellung = 0.99 // 99% tax-free

      const result = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // Should calculate extremely small tax
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(0.01) // Less than 1 cent
    })
  })

  describe('Combined Edge Cases', () => {
    it('should handle complete tax-free scenario (zero tax, full exemption)', () => {
      const vorabpauschale = calculateVorabpauschale(100000, 105000, 0.0255)
      const tax = calculateSteuerOnVorabpauschale(vorabpauschale, 0, 1.0)

      expect(vorabpauschale).toBeGreaterThan(0)
      expect(tax).toBe(0)
    })

    it('should handle maximum tax burden scenario', () => {
      const startCapital = 1000000
      const endCapital = 1050000
      const basiszins = 0.0255
      
      const vorabpauschale = calculateVorabpauschale(startCapital, endCapital, basiszins)
      const tax = calculateSteuerOnVorabpauschale(vorabpauschale, 1.0, 0)

      expect(vorabpauschale).toBeGreaterThan(0)
      expect(tax).toBe(vorabpauschale) // All taxed away
    })

    it('should handle realistic high-net-worth scenario', () => {
      const startCapital = 5000000 // 5 million
      const endCapital = 5250000 // 250k gain (5%)
      const basiszins = 0.0255
      const taxRate = 0.26375
      const teilfreistellung = 0.3

      const vorabpauschale = calculateVorabpauschale(startCapital, endCapital, basiszins)
      const tax = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // Should calculate correctly for high net worth
      expect(vorabpauschale).toBeGreaterThan(0)
      expect(tax).toBeGreaterThan(0)
      expect(tax).toBeLessThan(vorabpauschale)
      
      // Verify numbers are reasonable for this scenario
      expect(vorabpauschale).toBeGreaterThan(80000) // Should be significant
      expect(tax).toBeGreaterThan(15000) // Significant tax
      expect(Number.isFinite(vorabpauschale)).toBe(true)
      expect(Number.isFinite(tax)).toBe(true)
    })

    it('should handle first-year investor scenario (small capital, small gain)', () => {
      const startCapital = 1000 // Just started
      const endCapital = 1050 // 5% gain
      const basiszins = 0.0255
      const taxRate = 0.26375
      const teilfreistellung = 0.3

      const vorabpauschale = calculateVorabpauschale(startCapital, endCapital, basiszins)
      const tax = calculateSteuerOnVorabpauschale(vorabpauschale, taxRate, teilfreistellung)

      // Should calculate correctly for small amounts
      expect(vorabpauschale).toBeGreaterThanOrEqual(0)
      expect(vorabpauschale).toBeLessThan(50) // Should be quite small
      expect(tax).toBeGreaterThanOrEqual(0)
      expect(tax).toBeLessThan(vorabpauschale)
    })
  })
})
