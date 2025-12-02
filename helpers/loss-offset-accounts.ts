/**
 * Verlustverrechnungstöpfe (Loss Offset Accounts) System
 *
 * This module implements the German tax loss offset account system (Verlustverrechnungstöpfe)
 * which tracks losses from different investment types in separate pools and carries them forward
 * across years according to German tax law (EStG).
 *
 * Key German tax concepts:
 * - Aktienverlusttopf: Stock loss pool - can only offset stock gains
 * - Sonstiger Verlusttopf: Other capital loss pool - can offset any capital income
 * - Verlustvortrag: Unlimited carry-forward of losses to future years
 * - No time limit on loss carry-forward
 *
 * Reference: § 20 EStG (Einkommensteuergesetz)
 */

/**
 * Types of loss accounts according to German tax law
 */
export type LossAccountType = 'stock' | 'other'

/**
 * Loss offset account state for a specific year
 */
export interface LossAccountState {
  /** Stock losses available (Aktienverlusttopf) in EUR */
  stockLosses: number
  /** Other capital losses available (Sonstiger Verlusttopf) in EUR */
  otherLosses: number
  /** Year for which this state applies */
  year: number
}

/**
 * Configuration for realized losses in a specific year
 */
export interface RealizedLossesConfig {
  /** Realized stock losses (from selling stocks/equity funds) in EUR */
  stockLosses: number
  /** Realized other capital losses (bonds, mixed funds, etc.) in EUR */
  otherLosses: number
  /** Year when losses were realized */
  year: number
}

/**
 * Result of loss offset calculation for a specific year
 */
export interface LossOffsetResult {
  /** Capital gains before loss offset in EUR */
  capitalGainsBeforeOffset: number
  /** Stock gains portion in EUR */
  stockGains: number
  /** Other capital gains in EUR */
  otherGains: number
  /** Vorabpauschale amount in EUR */
  vorabpauschale: number
  /** Stock losses used for offset in EUR */
  stockLossesUsed: number
  /** Other losses used for offset in EUR */
  otherLossesUsed: number
  /** Total losses used in EUR */
  totalLossesUsed: number
  /** Taxable income after loss offset in EUR */
  taxableIncomeAfterOffset: number
  /** Tax savings from loss offset in EUR */
  taxSavings: number
  /** Remaining losses to carry forward */
  remainingLosses: LossAccountState
}

/**
 * Calculate loss offset for a specific year
 *
 * Applies German loss offset rules:
 * 1. Stock losses can only offset stock gains
 * 2. Other losses can offset any capital income including Vorabpauschale
 * 3. Losses are offset before calculating taxes
 * 4. Unused losses are carried forward to next year
 *
 * @param previousLosses - Loss account state from previous year
 * @param realizedLosses - New losses realized in current year
 * @param stockGains - Stock gains (from equity funds) in current year
 * @param otherGains - Other capital gains in current year
 * @param vorabpauschale - Vorabpauschale amount for current year
 * @param taxRate - Effective tax rate (Kapitalertragsteuer × (1 - Teilfreistellung))
 * @param year - Current year
 * @returns Loss offset calculation result
 */
export function calculateLossOffset(
  previousLosses: LossAccountState,
  realizedLosses: RealizedLossesConfig,
  stockGains: number,
  otherGains: number,
  vorabpauschale: number,
  taxRate: number,
  year: number,
): LossOffsetResult {
  // Available losses = previous year's carryforward + current year's realized losses
  const availableStockLosses = previousLosses.stockLosses + realizedLosses.stockLosses
  const availableOtherLosses = previousLosses.otherLosses + realizedLosses.otherLosses

  // Step 1: Offset stock losses against stock gains
  const stockLossesUsed = Math.min(availableStockLosses, stockGains)
  const remainingStockGains = stockGains - stockLossesUsed
  const remainingStockLosses = availableStockLosses - stockLossesUsed

  // Step 2: Calculate total taxable income after stock loss offset
  // Other losses can offset: remaining stock gains + other gains + Vorabpauschale
  const taxableBeforeOtherLossOffset = remainingStockGains + otherGains + vorabpauschale

  // Step 3: Offset other losses against all remaining taxable income
  const otherLossesUsed = Math.min(availableOtherLosses, taxableBeforeOtherLossOffset)
  const remainingOtherLosses = availableOtherLosses - otherLossesUsed

  // Final taxable income
  const taxableIncomeAfterOffset = Math.max(0, taxableBeforeOtherLossOffset - otherLossesUsed)

  // Calculate tax savings
  const totalLossesUsed = stockLossesUsed + otherLossesUsed
  const taxSavings = totalLossesUsed * taxRate

  return {
    capitalGainsBeforeOffset: stockGains + otherGains,
    stockGains,
    otherGains,
    vorabpauschale,
    stockLossesUsed,
    otherLossesUsed,
    totalLossesUsed,
    taxableIncomeAfterOffset,
    taxSavings,
    remainingLosses: {
      stockLosses: remainingStockLosses,
      otherLosses: remainingOtherLosses,
      year,
    },
  }
}

/**
 * Create initial empty loss account state
 * @param year - Year for the initial state
 * @returns Empty loss account state
 */
export function createInitialLossAccountState(year: number): LossAccountState {
  return {
    stockLosses: 0,
    otherLosses: 0,
    year,
  }
}

/**
 * Create default realized losses config (no losses)
 * @param year - Year for the config
 * @returns Default config with zero losses
 */
export function createDefaultRealizedLosses(year: number): RealizedLossesConfig {
  return {
    stockLosses: 0,
    otherLosses: 0,
    year,
  }
}

/**
 * Validate loss account state
 * @param state - Loss account state to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateLossAccountState(state: LossAccountState): string[] {
  const errors: string[] = []

  if (state.stockLosses < 0) {
    errors.push('Aktienverlusttopf kann nicht negativ sein')
  }

  if (state.otherLosses < 0) {
    errors.push('Sonstiger Verlusttopf kann nicht negativ sein')
  }

  if (state.year < 2000 || state.year > 2100) {
    errors.push('Jahr muss zwischen 2000 und 2100 liegen')
  }

  return errors
}

/**
 * Validate realized losses configuration
 * @param config - Realized losses config to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateRealizedLosses(config: RealizedLossesConfig): string[] {
  const errors: string[] = []

  if (config.stockLosses < 0) {
    errors.push('Realisierte Aktienverluste können nicht negativ sein')
  }

  if (config.otherLosses < 0) {
    errors.push('Realisierte sonstige Verluste können nicht negativ sein')
  }

  if (config.year < 2000 || config.year > 2100) {
    errors.push('Jahr muss zwischen 2000 und 2100 liegen')
  }

  return errors
}

/**
 * Format loss amount for display (German number format)
 * @param amount - Loss amount in EUR
 * @returns Formatted string with € symbol
 */
export function formatLossAmount(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get display name for loss account type
 * @param type - Loss account type
 * @returns German display name
 */
export function getLossAccountTypeName(type: LossAccountType): string {
  const names: Record<LossAccountType, string> = {
    stock: 'Aktienverlusttopf',
    other: 'Sonstiger Verlusttopf',
  }
  return names[type]
}

/**
 * Get description for loss account type
 * @param type - Loss account type
 * @returns German description
 */
export function getLossAccountTypeDescription(type: LossAccountType): string {
  const descriptions: Record<LossAccountType, string> = {
    stock: 'Verluste aus Aktienverkäufen können nur mit Aktiengewinnen verrechnet werden',
    other:
      'Verluste aus anderen Kapitalanlagen (Anleihen, Mischfonds, etc.) können mit allen Kapitalerträgen verrechnet werden',
  }
  return descriptions[type]
}
