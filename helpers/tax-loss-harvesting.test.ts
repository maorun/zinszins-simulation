import { describe, expect, it } from 'vitest'
import {
  calculateTaxLossHarvesting,
  getDefaultTaxLossHarvestingConfig,
  validateTaxLossHarvestingConfig,
  type TaxLossHarvestingConfig,
} from './tax-loss-harvesting'

describe('tax-loss-harvesting', () => {
  describe('getDefaultTaxLossHarvestingConfig', () => {
    it('should return default config with disabled state', () => {
      const config = getDefaultTaxLossHarvestingConfig(2024)

      expect(config).toEqual({
        enabled: false,
        realizedStockLosses: 0,
        realizedOtherLosses: 0,
        lossCarryForward: 0,
        year: 2024,
      })
    })
  })

  describe('validateTaxLossHarvestingConfig', () => {
    it('should validate correct configuration without errors', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 5000,
        realizedOtherLosses: 3000,
        lossCarryForward: 2000,
        year: 2024,
      }

      const errors = validateTaxLossHarvestingConfig(config)
      expect(errors).toEqual([])
    })

    it('should reject negative stock losses', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: -1000,
        realizedOtherLosses: 0,
        lossCarryForward: 0,
        year: 2024,
      }

      const errors = validateTaxLossHarvestingConfig(config)
      expect(errors).toContain('Realisierte Aktienverluste können nicht negativ sein')
    })

    it('should reject negative other losses', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 0,
        realizedOtherLosses: -500,
        lossCarryForward: 0,
        year: 2024,
      }

      const errors = validateTaxLossHarvestingConfig(config)
      expect(errors).toContain('Realisierte sonstige Verluste können nicht negativ sein')
    })

    it('should reject negative loss carry-forward', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 0,
        realizedOtherLosses: 0,
        lossCarryForward: -100,
        year: 2024,
      }

      const errors = validateTaxLossHarvestingConfig(config)
      expect(errors).toContain('Verlustvortrag kann nicht negativ sein')
    })

    it('should reject invalid years', () => {
      const config1: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 0,
        realizedOtherLosses: 0,
        lossCarryForward: 0,
        year: 1999,
      }

      const config2: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 0,
        realizedOtherLosses: 0,
        lossCarryForward: 0,
        year: 2101,
      }

      expect(validateTaxLossHarvestingConfig(config1)).toContain('Jahr muss zwischen 2000 und 2100 liegen')
      expect(validateTaxLossHarvestingConfig(config2)).toContain('Jahr muss zwischen 2000 und 2100 liegen')
    })

    it('should return multiple errors for multiple violations', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: -1000,
        realizedOtherLosses: -500,
        lossCarryForward: -100,
        year: 1999,
      }

      const errors = validateTaxLossHarvestingConfig(config)
      expect(errors).toHaveLength(4)
    })
  })

  describe('calculateTaxLossHarvesting', () => {
    it('should return zero values when disabled', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: false,
        realizedStockLosses: 5000,
        realizedOtherLosses: 3000,
        lossCarryForward: 2000,
        year: 2024,
      }

      const result = calculateTaxLossHarvesting(config, 10000, 500, 0.26375)

      expect(result.totalLossesAvailable).toBe(0)
      expect(result.lossesUsed).toBe(0)
      expect(result.lossCarryForward).toBe(0)
      expect(result.taxSavings).toBe(0)
    })

    it('should calculate tax savings when stock losses offset gains', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 5000,
        realizedOtherLosses: 0,
        lossCarryForward: 0,
        year: 2024,
      }

      const capitalGains = 10000
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateTaxLossHarvesting(config, capitalGains, vorabpauschale, taxRate)

      // 5000 stock losses should offset 5000 of the 10000 capital gains
      expect(result.lossesUsed).toBe(5000)
      expect(result.taxSavings).toBeCloseTo(5000 * 0.26375)
      expect(result.breakdown.stockLosses.used).toBe(5000)
      expect(result.breakdown.stockLosses.remaining).toBe(0)
    })

    it('should use other losses to offset remaining taxable income', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 3000,
        realizedOtherLosses: 4000,
        lossCarryForward: 0,
        year: 2024,
      }

      const capitalGains = 5000
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateTaxLossHarvesting(config, capitalGains, vorabpauschale, taxRate)

      // Stock losses: 3000 used to offset capital gains
      expect(result.breakdown.stockLosses.used).toBe(3000)

      // Other losses: Should offset remaining (5000 - 3000) + 500 = 2500
      expect(result.breakdown.otherLosses.used).toBe(2500)

      // Total losses used: 3000 + 2500 = 5500
      expect(result.lossesUsed).toBe(5500)

      // Tax savings
      expect(result.taxSavings).toBeCloseTo(5500 * 0.26375)

      // Remaining other losses: 4000 - 2500 = 1500
      expect(result.breakdown.otherLosses.remaining).toBe(1500)
      expect(result.lossCarryForward).toBe(1500)
    })

    it('should carry forward unused losses to next year', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 15000,
        realizedOtherLosses: 8000,
        lossCarryForward: 0,
        year: 2024,
      }

      const capitalGains = 5000
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateTaxLossHarvesting(config, capitalGains, vorabpauschale, taxRate)

      // All taxable income offset: 5000 + 500 = 5500
      expect(result.lossesUsed).toBe(5500)

      // Remaining losses to carry forward
      const remainingStockLosses = 15000 - 5000
      const remainingOtherLosses = 8000 - 500
      expect(result.lossCarryForward).toBe(remainingStockLosses + remainingOtherLosses)
    })

    it('should handle loss carry-forward from previous years', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 2000,
        realizedOtherLosses: 1000,
        lossCarryForward: 6000, // 3000 stock + 3000 other (50/50 split assumed)
        year: 2024,
      }

      const capitalGains = 10000
      const vorabpauschale = 1000
      const taxRate = 0.26375

      const result = calculateTaxLossHarvesting(config, capitalGains, vorabpauschale, taxRate)

      // Stock losses available: 2000 + 3000 (from carry-forward) = 5000
      expect(result.breakdown.stockLosses.available).toBe(5000)

      // Other losses available: 1000 + 3000 (from carry-forward) = 4000
      expect(result.breakdown.otherLosses.available).toBe(4000)

      // Total losses available: 9000
      expect(result.totalLossesAvailable).toBe(9000)
    })

    it('should handle zero gains scenario', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 5000,
        realizedOtherLosses: 3000,
        lossCarryForward: 0,
        year: 2024,
      }

      const result = calculateTaxLossHarvesting(config, 0, 0, 0.26375)

      // No gains to offset, all losses carried forward
      expect(result.lossesUsed).toBe(0)
      expect(result.taxSavings).toBe(0)
      expect(result.lossCarryForward).toBe(8000)
    })

    it('should calculate tax savings with realistic German tax scenario', () => {
      // Realistic scenario: Investor has 20,000€ capital gains and 8,000€ realized losses
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 8000,
        realizedOtherLosses: 0,
        lossCarryForward: 0,
        year: 2024,
      }

      const capitalGains = 20000
      const vorabpauschale = 1000
      const taxRate = 0.26375 // Standard Abgeltungssteuer rate

      const result = calculateTaxLossHarvesting(config, capitalGains, vorabpauschale, taxRate)

      // 8000€ losses offset 8000€ of capital gains
      expect(result.lossesUsed).toBe(8000)

      // Tax savings: 8000 × 26.375% = 2110€
      expect(result.taxSavings).toBeCloseTo(2110)

      // No carry-forward
      expect(result.lossCarryForward).toBe(0)
    })

    it('should handle Vorabpauschale offset correctly', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 0,
        realizedOtherLosses: 1000,
        lossCarryForward: 0,
        year: 2024,
      }

      const capitalGains = 0
      const vorabpauschale = 800
      const taxRate = 0.26375

      const result = calculateTaxLossHarvesting(config, capitalGains, vorabpauschale, taxRate)

      // Other losses can offset Vorabpauschale
      expect(result.breakdown.otherLosses.used).toBe(800)
      expect(result.taxSavings).toBeCloseTo(800 * 0.26375)
      expect(result.breakdown.otherLosses.remaining).toBe(200)
    })

    it('should handle partial loss utilization', () => {
      const config: TaxLossHarvestingConfig = {
        enabled: true,
        realizedStockLosses: 30000,
        realizedOtherLosses: 10000,
        lossCarryForward: 0,
        year: 2024,
      }

      const capitalGains = 5000
      const vorabpauschale = 500
      const taxRate = 0.26375

      const result = calculateTaxLossHarvesting(config, capitalGains, vorabpauschale, taxRate)

      // Only 5500€ of the 40000€ total losses are used
      expect(result.lossesUsed).toBe(5500)

      // Significant carry-forward
      expect(result.lossCarryForward).toBe(34500)
    })
  })
})
