/**
 * Progressionsvorbehalt (Progression Clause) Calculations
 *
 * The Progressionsvorbehalt is a German tax mechanism where certain tax-exempt income
 * (such as foreign income, unemployment benefits, parental allowance, etc.) affects
 * the tax rate applied to taxable income, even though the exempt income itself isn't taxed.
 *
 * The mechanism works as follows:
 * 1. Calculate the tax rate that would apply if both taxable and exempt income were taxable
 * 2. Apply this higher rate to the actual taxable income
 * 3. The result is higher taxes on the taxable income due to the progression effect
 *
 * This is particularly relevant for German taxpayers with foreign income, social benefits,
 * or other progression-relevant income sources.
 */

export interface ProgressionsvorbehaltConfig {
  /**
   * Whether Progressionsvorbehalt calculation is enabled
   */
  enabled: boolean

  /**
   * Amount of progression-relevant income per year (in euros)
   * This includes tax-exempt income that affects the tax rate:
   * - Foreign income (e.g., from employment abroad)
   * - Unemployment benefits (Arbeitslosengeld I)
   * - Parental allowance (Elterngeld)
   * - Short-time work compensation (Kurzarbeitergeld)
   * - Insolvency compensation (Insolvenzgeld)
   */
  progressionRelevantIncomePerYear: Record<number, number>
}

export const DEFAULT_PROGRESSIONSVORBEHALT_CONFIG: ProgressionsvorbehaltConfig = {
  enabled: false,
  progressionRelevantIncomePerYear: {},
}

/**
 * German income tax calculation (simplified progressive tax formula)
 * Based on the 2024 German tax schedule (Einkommensteuertarif)
 *
 * This is a simplified calculation for demonstration purposes.
 * Real-world applications should use the exact formulas from the German tax law (EStG §32a).
 *
 * @param taxableIncome - The taxable income amount in euros
 * @param grundfreibetrag - The basic tax allowance (Grundfreibetrag)
 * @returns The calculated income tax amount in euros
 */
export function calculateGermanIncomeTax(taxableIncome: number, grundfreibetrag = 11604): number {
  // Adjusted taxable income after Grundfreibetrag
  const adjustedIncome = Math.max(0, taxableIncome - grundfreibetrag)

  if (adjustedIncome === 0) {
    return 0
  }

  // Simplified progressive tax calculation
  // This is an approximation of the German tax schedule
  // Zone 1: 14% - 24% (€11,604 - €62,809)
  // Zone 2: 24% - 42% (€62,810 - €277,825)
  // Zone 3: 42% (above €277,825)
  // Top tax rate: 45% (above €277,826 - Reichensteuer)

  let tax = 0

  // Zone 1: Progressive from 14% to 24%
  const zone1Limit = 62809 - grundfreibetrag
  if (adjustedIncome <= zone1Limit) {
    // Linear progression from 14% to 24%
    const avgRate = 0.14 + (adjustedIncome / zone1Limit) * 0.1
    tax = adjustedIncome * avgRate
  }
  // Zone 2: Progressive from 24% to 42%
  else if (adjustedIncome <= 277825 - grundfreibetrag) {
    const zone1Tax = zone1Limit * 0.19 // Average rate in zone 1
    const zone2Income = adjustedIncome - zone1Limit
    const zone2Limit = 277825 - grundfreibetrag - zone1Limit
    const avgRate = 0.24 + (zone2Income / zone2Limit) * 0.18
    tax = zone1Tax + zone2Income * avgRate
  }
  // Zone 3: 42%
  else if (adjustedIncome <= 277826 - grundfreibetrag) {
    const zone1Tax = zone1Limit * 0.19
    const zone2Tax = (277825 - grundfreibetrag - zone1Limit) * 0.33
    const zone3Income = adjustedIncome - (277825 - grundfreibetrag)
    tax = zone1Tax + zone2Tax + zone3Income * 0.42
  }
  // Top rate: 45% (Reichensteuer)
  else {
    const zone1Tax = zone1Limit * 0.19
    const zone2Tax = (277825 - grundfreibetrag - zone1Limit) * 0.33
    const zone3Income = 277826 - grundfreibetrag - (277825 - grundfreibetrag)
    const zone3Tax = zone3Income * 0.42
    const topIncome = adjustedIncome - (277826 - grundfreibetrag)
    tax = zone1Tax + zone2Tax + zone3Tax + topIncome * 0.45
  }

  return Math.max(0, tax)
}

/**
 * Calculate the effective tax rate using Progressionsvorbehalt
 *
 * @param taxableIncome - The actual taxable income (e.g., withdrawals from investments)
 * @param progressionRelevantIncome - Tax-exempt income that affects the tax rate
 * @param grundfreibetrag - The basic tax allowance (Grundfreibetrag)
 * @returns The effective tax rate as a decimal (0.0 - 1.0)
 */
export function calculateProgressionRate(
  taxableIncome: number,
  progressionRelevantIncome: number,
  grundfreibetrag = 11604,
): number {
  // If there's no progression-relevant income or no taxable income, return the normal rate
  if (progressionRelevantIncome <= 0 || taxableIncome <= 0) {
    if (taxableIncome <= 0) return 0
    const normalTax = calculateGermanIncomeTax(taxableIncome, grundfreibetrag)
    return normalTax / taxableIncome
  }

  // Total income (taxable + progression-relevant)
  const totalIncome = taxableIncome + progressionRelevantIncome

  // The correct Progressionsvorbehalt formula (besonderer Steuersatz):
  // Tax = Tax(taxable + progression) - Tax(progression)
  // This ensures progression income pushes taxable income into higher brackets
  // without taxing the progression income itself

  // Calculate tax on total income (hypothetically, as if all were taxable)
  const taxOnTotalIncome = calculateGermanIncomeTax(totalIncome, grundfreibetrag)

  // Calculate tax on just the progression-relevant income (hypothetically)
  const taxOnProgressionIncome = calculateGermanIncomeTax(progressionRelevantIncome, grundfreibetrag)

  // The effective tax for the taxable income is the difference
  const effectiveTaxForTaxableIncome = Math.max(0, taxOnTotalIncome - taxOnProgressionIncome)

  // Calculate the rate
  const effectiveRate = taxableIncome > 0 ? effectiveTaxForTaxableIncome / taxableIncome : 0

  return Math.max(0, effectiveRate)
}

/**
 * Calculate income tax with Progressionsvorbehalt
 *
 * @param taxableIncome - The actual taxable income (e.g., withdrawals from investments)
 * @param progressionRelevantIncome - Tax-exempt income that affects the tax rate
 * @param grundfreibetrag - The basic tax allowance (Grundfreibetrag)
 * @param kirchensteuerAktiv - Whether Kirchensteuer is active
 * @param kirchensteuersatz - Kirchensteuer rate (typically 8% or 9%)
 * @returns The calculated income tax amount in euros
 */
export function calculateIncomeTaxWithProgressionsvorbehalt(
  taxableIncome: number,
  progressionRelevantIncome: number,
  grundfreibetrag = 11604,
  kirchensteuerAktiv = false,
  kirchensteuersatz = 9,
): number {
  if (taxableIncome <= 0) {
    return 0
  }

  // Calculate the effective tax rate using progression
  const effectiveRate = calculateProgressionRate(taxableIncome, progressionRelevantIncome, grundfreibetrag)

  // Apply the effective rate to the taxable income
  // Important: Grundfreibetrag is already considered in the rate calculation
  const baseIncomeTax = taxableIncome * effectiveRate

  // Calculate Kirchensteuer as percentage of income tax
  const kirchensteuer = kirchensteuerAktiv ? baseIncomeTax * (kirchensteuersatz / 100) : 0

  return baseIncomeTax + kirchensteuer
}

/**
 * Get progression-relevant income for a specific year
 *
 * @param year - The year to get the income for
 * @param config - The Progressionsvorbehalt configuration
 * @returns The progression-relevant income for the year, or 0 if not configured
 */
export function getProgressionRelevantIncomeForYear(year: number, config: ProgressionsvorbehaltConfig): number {
  if (!config.enabled) {
    return 0
  }

  return config.progressionRelevantIncomePerYear[year] || 0
}
