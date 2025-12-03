/**
 * Tests for Verlustverrechnungstöpfe (Loss Offset Accounts) System
 */

import { describe, it, expect } from 'vitest'
import {
  calculateLossOffset,
  createInitialLossAccountState,
  createDefaultRealizedLosses,
  validateLossAccountState,
  validateRealizedLosses,
  formatLossAmount,
  getLossAccountTypeName,
  getLossAccountTypeDescription,
  type LossAccountState,
  type RealizedLossesConfig,
} from './loss-offset-accounts'

describe('Loss Offset Accounts', () => {
  describe('calculateLossOffset', () => {
    it('should calculate correct offset with no losses', () => {
      const previousLosses = createInitialLossAccountState(2022)
      const realizedLosses = createDefaultRealizedLosses(2023)
      const stockGains = 5000
      const otherGains = 3000
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateLossOffset(
        previousLosses,
        realizedLosses,
        stockGains,
        otherGains,
        vorabpauschale,
        taxRate,
        2023,
      )

      expect(result.stockLossesUsed).toBe(0)
      expect(result.otherLossesUsed).toBe(0)
      expect(result.totalLossesUsed).toBe(0)
      expect(result.taxableIncomeAfterOffset).toBe(8500) // 5000 + 3000 + 500
      expect(result.taxSavings).toBe(0)
      expect(result.remainingLosses.stockLosses).toBe(0)
      expect(result.remainingLosses.otherLosses).toBe(0)
    })

    it('should offset stock losses against stock gains only', () => {
      const previousLosses = createInitialLossAccountState(2022)
      const realizedLosses: RealizedLossesConfig = {
        stockLosses: 2000,
        otherLosses: 0,
        year: 2023,
      }
      const stockGains = 5000
      const otherGains = 3000
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateLossOffset(
        previousLosses,
        realizedLosses,
        stockGains,
        otherGains,
        vorabpauschale,
        taxRate,
        2023,
      )

      expect(result.stockLossesUsed).toBe(2000)
      expect(result.otherLossesUsed).toBe(0)
      expect(result.totalLossesUsed).toBe(2000)
      expect(result.taxableIncomeAfterOffset).toBe(6500) // (5000-2000) + 3000 + 500
      expect(result.taxSavings).toBeCloseTo(527.5, 2) // 2000 * 0.26375
      expect(result.remainingLosses.stockLosses).toBe(0)
      expect(result.remainingLosses.otherLosses).toBe(0)
    })

    it('should carry forward unused stock losses', () => {
      const previousLosses = createInitialLossAccountState(2022)
      const realizedLosses: RealizedLossesConfig = {
        stockLosses: 8000,
        otherLosses: 0,
        year: 2023,
      }
      const stockGains = 5000
      const otherGains = 3000
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateLossOffset(
        previousLosses,
        realizedLosses,
        stockGains,
        otherGains,
        vorabpauschale,
        taxRate,
        2023,
      )

      expect(result.stockLossesUsed).toBe(5000) // Can only offset stock gains
      expect(result.otherLossesUsed).toBe(0)
      expect(result.totalLossesUsed).toBe(5000)
      expect(result.taxableIncomeAfterOffset).toBe(3500) // 0 + 3000 + 500
      expect(result.remainingLosses.stockLosses).toBe(3000) // 8000 - 5000 carried forward
      expect(result.remainingLosses.otherLosses).toBe(0)
    })

    it('should offset other losses against all capital income', () => {
      const previousLosses = createInitialLossAccountState(2022)
      const realizedLosses: RealizedLossesConfig = {
        stockLosses: 0,
        otherLosses: 4000,
        year: 2023,
      }
      const stockGains = 2000
      const otherGains = 1500
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateLossOffset(
        previousLosses,
        realizedLosses,
        stockGains,
        otherGains,
        vorabpauschale,
        taxRate,
        2023,
      )

      expect(result.stockLossesUsed).toBe(0)
      expect(result.otherLossesUsed).toBe(4000) // Offsets all taxable income
      expect(result.totalLossesUsed).toBe(4000)
      expect(result.taxableIncomeAfterOffset).toBe(0) // 2000 + 1500 + 500 - 4000
      expect(result.taxSavings).toBeCloseTo(1055, 2) // 4000 * 0.26375
      expect(result.remainingLosses.stockLosses).toBe(0)
      expect(result.remainingLosses.otherLosses).toBe(0)
    })

    it('should carry forward unused other losses', () => {
      const previousLosses = createInitialLossAccountState(2022)
      const realizedLosses: RealizedLossesConfig = {
        stockLosses: 0,
        otherLosses: 6000,
        year: 2023,
      }
      const stockGains = 2000
      const otherGains = 1000
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateLossOffset(
        previousLosses,
        realizedLosses,
        stockGains,
        otherGains,
        vorabpauschale,
        taxRate,
        2023,
      )

      expect(result.stockLossesUsed).toBe(0)
      expect(result.otherLossesUsed).toBe(3500) // 2000 + 1000 + 500
      expect(result.totalLossesUsed).toBe(3500)
      expect(result.taxableIncomeAfterOffset).toBe(0)
      expect(result.remainingLosses.stockLosses).toBe(0)
      expect(result.remainingLosses.otherLosses).toBe(2500) // 6000 - 3500 carried forward
    })

    it('should combine previous losses with current year losses', () => {
      const previousLosses: LossAccountState = {
        stockLosses: 1000,
        otherLosses: 500,
        year: 2022,
      }
      const realizedLosses: RealizedLossesConfig = {
        stockLosses: 2000,
        otherLosses: 1500,
        year: 2023,
      }
      const stockGains = 2500
      const otherGains = 1000
      const vorabpauschale = 200
      const taxRate = 0.26375

      const result = calculateLossOffset(
        previousLosses,
        realizedLosses,
        stockGains,
        otherGains,
        vorabpauschale,
        taxRate,
        2023,
      )

      // Stock losses: 1000 (previous) + 2000 (current) = 3000 total
      expect(result.stockLossesUsed).toBe(2500) // Offset all stock gains
      expect(result.remainingLosses.stockLosses).toBe(500) // 3000 - 2500

      // Other losses: 500 (previous) + 1500 (current) = 2000 total
      // Can offset: 0 (remaining stock) + 1000 (other) + 200 (vorabpauschale) = 1200
      expect(result.otherLossesUsed).toBe(1200)
      expect(result.remainingLosses.otherLosses).toBe(800) // 2000 - 1200

      expect(result.totalLossesUsed).toBe(3700) // 2500 + 1200
      expect(result.taxableIncomeAfterOffset).toBe(0)
    })

    it('should handle complex multi-year scenario', () => {
      // Year 1: Realize losses
      const year1Losses = createInitialLossAccountState(2022)
      const year1Realized: RealizedLossesConfig = {
        stockLosses: 10000,
        otherLosses: 5000,
        year: 2023,
      }
      const year1Result = calculateLossOffset(
        year1Losses,
        year1Realized,
        1000, // Small gains
        500,
        100,
        0.26375,
        2023,
      )

      // Most losses carried forward
      expect(year1Result.remainingLosses.stockLosses).toBe(9000)
      expect(year1Result.remainingLosses.otherLosses).toBe(4400) // 5000 - 600 (500 + 100)

      // Year 2: Use carried forward losses
      const year2Realized: RealizedLossesConfig = {
        stockLosses: 0,
        otherLosses: 0,
        year: 2024,
      }
      const year2Result = calculateLossOffset(
        year1Result.remainingLosses,
        year2Realized,
        8000,
        4000,
        500,
        0.26375,
        2024,
      )

      // Use some carried forward losses
      expect(year2Result.stockLossesUsed).toBe(8000)
      expect(year2Result.otherLossesUsed).toBe(4400) // Use all available
      expect(year2Result.remainingLosses.stockLosses).toBe(1000) // 9000 - 8000
      expect(year2Result.remainingLosses.otherLosses).toBe(0)
      expect(year2Result.taxableIncomeAfterOffset).toBe(100) // (8000-8000) + 4000 + 500 - 4400
    })

    it('should handle zero gains with losses', () => {
      const previousLosses: LossAccountState = {
        stockLosses: 5000,
        otherLosses: 3000,
        year: 2022,
      }
      const realizedLosses = createDefaultRealizedLosses(2023)

      const result = calculateLossOffset(
        previousLosses,
        realizedLosses,
        0, // No gains
        0,
        0,
        0.26375,
        2023,
      )

      // No gains to offset, all losses carried forward
      expect(result.stockLossesUsed).toBe(0)
      expect(result.otherLossesUsed).toBe(0)
      expect(result.totalLossesUsed).toBe(0)
      expect(result.taxSavings).toBe(0)
      expect(result.remainingLosses.stockLosses).toBe(5000)
      expect(result.remainingLosses.otherLosses).toBe(3000)
    })

    it('should offset Vorabpauschale with other losses', () => {
      const previousLosses = createInitialLossAccountState(2022)
      const realizedLosses: RealizedLossesConfig = {
        stockLosses: 0,
        otherLosses: 1000,
        year: 2023,
      }
      const stockGains = 0
      const otherGains = 0
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateLossOffset(
        previousLosses,
        realizedLosses,
        stockGains,
        otherGains,
        vorabpauschale,
        taxRate,
        2023,
      )

      expect(result.stockLossesUsed).toBe(0)
      expect(result.otherLossesUsed).toBe(500) // Offset Vorabpauschale
      expect(result.taxableIncomeAfterOffset).toBe(0)
      expect(result.remainingLosses.otherLosses).toBe(500) // 1000 - 500 carried forward
    })
  })

  describe('createInitialLossAccountState', () => {
    it('should create empty state with correct year', () => {
      const state = createInitialLossAccountState(2023)

      expect(state.stockLosses).toBe(0)
      expect(state.otherLosses).toBe(0)
      expect(state.year).toBe(2023)
    })
  })

  describe('createDefaultRealizedLosses', () => {
    it('should create default config with zero losses', () => {
      const config = createDefaultRealizedLosses(2023)

      expect(config.stockLosses).toBe(0)
      expect(config.otherLosses).toBe(0)
      expect(config.year).toBe(2023)
    })
  })

  describe('validateLossAccountState', () => {
    it('should validate correct state', () => {
      const state: LossAccountState = {
        stockLosses: 1000,
        otherLosses: 500,
        year: 2023,
      }

      const errors = validateLossAccountState(state)
      expect(errors).toHaveLength(0)
    })

    it('should reject negative stock losses', () => {
      const state: LossAccountState = {
        stockLosses: -1000,
        otherLosses: 500,
        year: 2023,
      }

      const errors = validateLossAccountState(state)
      expect(errors).toContain('Aktienverlusttopf kann nicht negativ sein')
    })

    it('should reject negative other losses', () => {
      const state: LossAccountState = {
        stockLosses: 1000,
        otherLosses: -500,
        year: 2023,
      }

      const errors = validateLossAccountState(state)
      expect(errors).toContain('Sonstiger Verlusttopf kann nicht negativ sein')
    })

    it('should reject invalid year', () => {
      const state: LossAccountState = {
        stockLosses: 1000,
        otherLosses: 500,
        year: 1999,
      }

      const errors = validateLossAccountState(state)
      expect(errors).toContain('Jahr muss zwischen 2000 und 2100 liegen')
    })

    it('should return multiple errors for multiple violations', () => {
      const state: LossAccountState = {
        stockLosses: -1000,
        otherLosses: -500,
        year: 1999,
      }

      const errors = validateLossAccountState(state)
      expect(errors).toHaveLength(3)
    })
  })

  describe('validateRealizedLosses', () => {
    it('should validate correct config', () => {
      const config: RealizedLossesConfig = {
        stockLosses: 1000,
        otherLosses: 500,
        year: 2023,
      }

      const errors = validateRealizedLosses(config)
      expect(errors).toHaveLength(0)
    })

    it('should reject negative stock losses', () => {
      const config: RealizedLossesConfig = {
        stockLosses: -1000,
        otherLosses: 500,
        year: 2023,
      }

      const errors = validateRealizedLosses(config)
      expect(errors).toContain('Realisierte Aktienverluste können nicht negativ sein')
    })

    it('should reject negative other losses', () => {
      const config: RealizedLossesConfig = {
        stockLosses: 1000,
        otherLosses: -500,
        year: 2023,
      }

      const errors = validateRealizedLosses(config)
      expect(errors).toContain('Realisierte sonstige Verluste können nicht negativ sein')
    })

    it('should reject invalid year', () => {
      const config: RealizedLossesConfig = {
        stockLosses: 1000,
        otherLosses: 500,
        year: 2101,
      }

      const errors = validateRealizedLosses(config)
      expect(errors).toContain('Jahr muss zwischen 2000 und 2100 liegen')
    })
  })

  describe('formatLossAmount', () => {
    it('should format positive amounts correctly', () => {
      expect(formatLossAmount(1234.56)).toBe('1.234,56\u00A0€')
    })

    it('should format zero correctly', () => {
      expect(formatLossAmount(0)).toBe('0,00\u00A0€')
    })

    it('should format large amounts correctly', () => {
      expect(formatLossAmount(123456.78)).toBe('123.456,78\u00A0€')
    })

    it('should format small amounts correctly', () => {
      expect(formatLossAmount(0.01)).toBe('0,01\u00A0€')
    })
  })

  describe('getLossAccountTypeName', () => {
    it('should return correct name for stock', () => {
      expect(getLossAccountTypeName('stock')).toBe('Aktienverlusttopf')
    })

    it('should return correct name for other', () => {
      expect(getLossAccountTypeName('other')).toBe('Sonstiger Verlusttopf')
    })
  })

  describe('getLossAccountTypeDescription', () => {
    it('should return correct description for stock', () => {
      const description = getLossAccountTypeDescription('stock')
      expect(description).toContain('Aktienverkäufen')
      expect(description).toContain('Aktiengewinnen')
    })

    it('should return correct description for other', () => {
      const description = getLossAccountTypeDescription('other')
      expect(description).toContain('anderen Kapitalanlagen')
      expect(description).toContain('allen Kapitalerträgen')
    })
  })
})
