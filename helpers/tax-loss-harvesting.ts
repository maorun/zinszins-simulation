/**
 * Tax-Loss Harvesting (Steuerliche Verlustverrechnung) Helper Functions
 *
 * This module implements German tax loss harvesting calculations following the German tax code (EStG).
 * Tax loss harvesting is a strategy where realized losses from selling investments are used to offset
 * capital gains, thereby reducing taxable income and tax liability.
 *
 * Key German tax concepts:
 * - Verlustverrechnungstöpfe: Separate loss pools for different types of capital income
 * - Verlustvortrag: Losses can be carried forward to future years
 * - Vorabpauschale offset: Realized losses can offset Vorabpauschale (advance lump-sum tax)
 */

/**
 * Configuration for tax loss harvesting simulation
 */
export interface TaxLossHarvestingConfig {
  /** Whether tax loss harvesting is enabled */
  enabled: boolean
  /** Realized losses for stock sales (Aktienveräußerungen) in EUR */
  realizedStockLosses: number
  /** Realized losses for other capital income in EUR */
  realizedOtherLosses: number
  /** Loss carry-forward from previous years (Verlustvortrag) in EUR */
  lossCarryForward: number
  /** Year in which the loss harvesting is applied */
  year: number
}

/**
 * Result of tax loss harvesting calculation
 */
export interface TaxLossHarvestingResult {
  /** Total realized losses available for offset */
  totalLossesAvailable: number
  /** Amount of losses actually used to offset gains */
  lossesUsed: number
  /** Remaining losses to carry forward */
  lossCarryForward: number
  /** Tax savings from loss harvesting in EUR */
  taxSavings: number
  /** Breakdown by loss type */
  breakdown: {
    stockLosses: {
      available: number
      used: number
      remaining: number
    }
    otherLosses: {
      available: number
      used: number
      remaining: number
    }
  }
}

/**
 * Calculate tax savings from tax loss harvesting
 *
 * German tax loss harvesting rules:
 * 1. Stock losses can only offset stock gains (separate pool)
 * 2. Other capital losses can offset any capital income
 * 3. Losses can offset Vorabpauschale
 * 4. Unused losses are carried forward to next year
 * 5. Loss carry-forward has no time limit
 *
 * @param config - Tax loss harvesting configuration
 * @param capitalGains - Total capital gains for the year
 * @param vorabpauschale - Vorabpauschale amount
 * @param taxRate - Effective tax rate (after Teilfreistellung)
 * @returns Tax loss harvesting result with savings and carry-forward
 */
export function calculateTaxLossHarvesting(
  config: TaxLossHarvestingConfig,
  capitalGains: number,
  vorabpauschale: number,
  taxRate: number,
): TaxLossHarvestingResult {
  if (!config.enabled) {
    return {
      totalLossesAvailable: 0,
      lossesUsed: 0,
      lossCarryForward: 0,
      taxSavings: 0,
      breakdown: {
        stockLosses: { available: 0, used: 0, remaining: 0 },
        otherLosses: { available: 0, used: 0, remaining: 0 },
      },
    }
  }

  // Total taxable income before loss offset
  const totalTaxableIncome = capitalGains + vorabpauschale

  // Stock losses can only offset stock gains (assumed to be part of capitalGains)
  // In a more detailed implementation, we would separate stock gains from other capital gains
  const stockGainsToOffset = Math.min(capitalGains, totalTaxableIncome)
  const stockLossesAvailable = config.realizedStockLosses + config.lossCarryForward * 0.5 // Assume 50% of carry-forward is stock losses
  const stockLossesUsed = Math.min(stockLossesAvailable, stockGainsToOffset)
  const stockLossesRemaining = stockLossesAvailable - stockLossesUsed

  // Other losses can offset any remaining taxable income
  const remainingTaxableIncome = totalTaxableIncome - stockLossesUsed
  const otherLossesAvailable = config.realizedOtherLosses + config.lossCarryForward * 0.5 // Assume 50% of carry-forward is other losses
  const otherLossesUsed = Math.min(otherLossesAvailable, remainingTaxableIncome)
  const otherLossesRemaining = otherLossesAvailable - otherLossesUsed

  // Total losses used and remaining
  const totalLossesUsed = stockLossesUsed + otherLossesUsed
  const totalLossCarryForward = stockLossesRemaining + otherLossesRemaining

  // Tax savings = losses used × effective tax rate
  const taxSavings = totalLossesUsed * taxRate

  return {
    totalLossesAvailable: stockLossesAvailable + otherLossesAvailable,
    lossesUsed: totalLossesUsed,
    lossCarryForward: totalLossCarryForward,
    taxSavings,
    breakdown: {
      stockLosses: {
        available: stockLossesAvailable,
        used: stockLossesUsed,
        remaining: stockLossesRemaining,
      },
      otherLosses: {
        available: otherLossesAvailable,
        used: otherLossesUsed,
        remaining: otherLossesRemaining,
      },
    },
  }
}

/**
 * Calculate default tax loss harvesting config
 */
export function getDefaultTaxLossHarvestingConfig(year: number): TaxLossHarvestingConfig {
  return {
    enabled: false,
    realizedStockLosses: 0,
    realizedOtherLosses: 0,
    lossCarryForward: 0,
    year,
  }
}

/**
 * Validate tax loss harvesting configuration
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateTaxLossHarvestingConfig(config: TaxLossHarvestingConfig): string[] {
  const errors: string[] = []

  if (config.realizedStockLosses < 0) {
    errors.push('Realisierte Aktienverluste können nicht negativ sein')
  }

  if (config.realizedOtherLosses < 0) {
    errors.push('Realisierte sonstige Verluste können nicht negativ sein')
  }

  if (config.lossCarryForward < 0) {
    errors.push('Verlustvortrag kann nicht negativ sein')
  }

  if (config.year < 2000 || config.year > 2100) {
    errors.push('Jahr muss zwischen 2000 und 2100 liegen')
  }

  return errors
}
