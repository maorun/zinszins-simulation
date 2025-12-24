/**
 * Quellensteuer (Foreign Withholding Tax) Calculations
 *
 * This module handles the calculation of foreign withholding tax credits
 * according to German tax law and double taxation treaties (DBA).
 *
 * Key Principles:
 * - Foreign withholding tax can be credited against German capital gains tax
 * - Maximum credit is limited to the German tax that would be due on the foreign income
 * - Double taxation treaties (DBA) may reduce withholding tax rates
 * - Only applies to German tax residents with foreign investment income
 */

/**
 * Common countries with their standard withholding tax rates and DBA rates
 */
export interface CountryWithholdingTaxRate {
  country: string
  countryCode: string
  standardRate: number // Standard withholding tax rate (as decimal, e.g., 0.15 for 15%)
  dbaRate: number // Reduced rate under double taxation treaty (as decimal)
  description: string
}

/**
 * Standard withholding tax rates for common investment countries
 * Based on German double taxation treaties (DBA - Doppelbesteuerungsabkommen)
 */
export const COMMON_WITHHOLDING_TAX_RATES: CountryWithholdingTaxRate[] = [
  {
    country: 'USA',
    countryCode: 'US',
    standardRate: 0.3, // 30% standard
    dbaRate: 0.15, // 15% under DBA
    description: 'USA - reduziert auf 15% durch DBA',
  },
  {
    country: 'Schweiz',
    countryCode: 'CH',
    standardRate: 0.35, // 35% standard
    dbaRate: 0.15, // 15% under DBA
    description: 'Schweiz - reduziert auf 15% durch DBA',
  },
  {
    country: 'Österreich',
    countryCode: 'AT',
    standardRate: 0.27, // 27.5% standard
    dbaRate: 0.15, // 15% under DBA
    description: 'Österreich - reduziert auf 15% durch DBA',
  },
  {
    country: 'Frankreich',
    countryCode: 'FR',
    standardRate: 0.3, // 30% standard
    dbaRate: 0.15, // 15% under DBA
    description: 'Frankreich - reduziert auf 15% durch DBA',
  },
  {
    country: 'Großbritannien',
    countryCode: 'GB',
    standardRate: 0.0, // 0% standard (no withholding tax on dividends)
    dbaRate: 0.0, // 0% under DBA
    description: 'Großbritannien - keine Quellensteuer',
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    standardRate: 0.2, // 20% standard
    dbaRate: 0.15, // 15% under DBA (can be reduced to 10% for significant holdings)
    description: 'Japan - reduziert auf 15% durch DBA',
  },
  {
    country: 'Kanada',
    countryCode: 'CA',
    standardRate: 0.25, // 25% standard
    dbaRate: 0.15, // 15% under DBA
    description: 'Kanada - reduziert auf 15% durch DBA',
  },
  {
    country: 'Australien',
    countryCode: 'AU',
    standardRate: 0.3, // 30% standard
    dbaRate: 0.15, // 15% under DBA
    description: 'Australien - reduziert auf 15% durch DBA',
  },
]

/**
 * Configuration for withholding tax calculation
 */
export interface QuellensteuerconfigConfiguration {
  enabled: boolean
  foreignIncome: number // Total foreign dividends/interest in EUR
  withholdingTaxRate: number // Actual withholding tax rate paid (as decimal)
  countryCode?: string // Optional country code for automatic rate lookup
}

/**
 * Result of withholding tax credit calculation
 */
export interface QuellensteuerconfigCalculationResult {
  foreignIncome: number // Foreign income before taxes
  foreignWithholdingTaxPaid: number // Foreign tax already paid
  germanTaxDue: number // German capital gains tax on foreign income
  creditableAmount: number // Amount that can be credited
  remainingGermanTax: number // German tax still due after credit
  explanation: string
  limitApplied: boolean // Whether credit was limited by German tax due
}

/**
 * Calculate the creditable foreign withholding tax amount
 *
 * @param foreignIncome - Gross foreign dividend/interest income in EUR
 * @param withholdingTaxRate - Foreign withholding tax rate (as decimal, e.g., 0.15 for 15%)
 * @param germanCapitalGainsTaxRate - German capital gains tax rate (typically 0.26375)
 * @param teilfreistellung - Partial exemption rate for equity funds (e.g., 0.3 for 30%)
 * @returns Calculation result with creditable amount and explanations
 */
export function calculateQuellensteuerconfigCredit(
  foreignIncome: number,
  withholdingTaxRate: number,
  germanCapitalGainsTaxRate: number,
  teilfreistellung = 0,
): QuellensteuerconfigCalculationResult {
  // Calculate foreign withholding tax actually paid
  const foreignWithholdingTaxPaid = foreignIncome * withholdingTaxRate

  // Calculate German tax that would be due on this income
  // Apply Teilfreistellung (partial exemption for equity funds)
  const taxableIncome = foreignIncome * (1 - teilfreistellung)
  const germanTaxDue = taxableIncome * germanCapitalGainsTaxRate

  // Credit is limited to the lower of:
  // 1. Foreign tax actually paid
  // 2. German tax that would be due on this income
  const creditableAmount = Math.min(foreignWithholdingTaxPaid, germanTaxDue)

  // Remaining German tax to pay after applying credit
  const remainingGermanTax = Math.max(0, germanTaxDue - creditableAmount)

  // Determine if credit was limited
  const limitApplied = foreignWithholdingTaxPaid > germanTaxDue

  // Generate explanation
  let explanation = `Bei ausländischen Kapitalerträgen von ${foreignIncome.toFixed(2)} € `
  explanation += `wurde eine Quellensteuer von ${(withholdingTaxRate * 100).toFixed(1)}% `
  explanation += `(${foreignWithholdingTaxPaid.toFixed(2)} €) einbehalten. `

  if (teilfreistellung > 0) {
    explanation += `Nach Teilfreistellung von ${(teilfreistellung * 100).toFixed(0)}% `
    explanation += `beträgt das steuerpflichtige Einkommen ${taxableIncome.toFixed(2)} €. `
  }

  explanation += `Die deutsche Kapitalertragsteuer beträgt ${germanTaxDue.toFixed(2)} €. `

  if (limitApplied) {
    explanation += `Die anrechenbare Quellensteuer ist auf die deutsche Steuer begrenzt `
    explanation += `(Anrechnung: ${creditableAmount.toFixed(2)} €). `
    explanation += `Der nicht anrechenbare Betrag von ${(foreignWithholdingTaxPaid - creditableAmount).toFixed(2)} € `
    explanation += `kann nach § 32d Abs. 5 EStG nicht erstattet werden.`
  } else {
    explanation += `Die komplette ausländische Quellensteuer von ${creditableAmount.toFixed(2)} € `
    explanation += `kann auf die deutsche Steuer angerechnet werden.`
  }

  return {
    foreignIncome,
    foreignWithholdingTaxPaid,
    germanTaxDue,
    creditableAmount,
    remainingGermanTax,
    explanation,
    limitApplied,
  }
}

/**
 * Get withholding tax rate for a specific country
 *
 * @param countryCode - ISO country code (e.g., 'US', 'CH')
 * @returns Country withholding tax information or undefined if not found
 */
export function getWithholdingTaxRateForCountry(countryCode: string): CountryWithholdingTaxRate | undefined {
  return COMMON_WITHHOLDING_TAX_RATES.find(c => c.countryCode === countryCode)
}

/**
 * Calculate total withholding tax credit for multiple foreign income sources
 *
 * @param foreignIncomes - Array of foreign income configurations
 * @param germanCapitalGainsTaxRate - German capital gains tax rate
 * @param teilfreistellung - Partial exemption rate
 * @returns Total creditable amount and detailed breakdown
 */
export function calculateTotalQuellensteuerconfigCredit(
  foreignIncomes: QuellensteuerconfigConfiguration[],
  germanCapitalGainsTaxRate: number,
  teilfreistellung = 0,
): {
  totalCreditableAmount: number
  totalForeignIncome: number
  totalForeignTaxPaid: number
  totalGermanTaxDue: number
  totalRemainingGermanTax: number
  details: QuellensteuerconfigCalculationResult[]
} {
  const enabledIncomes = foreignIncomes.filter(income => income.enabled)

  const details = enabledIncomes.map(income =>
    calculateQuellensteuerconfigCredit(
      income.foreignIncome,
      income.withholdingTaxRate,
      germanCapitalGainsTaxRate,
      teilfreistellung,
    ),
  )

  const totalCreditableAmount = details.reduce((sum, detail) => sum + detail.creditableAmount, 0)
  const totalForeignIncome = details.reduce((sum, detail) => sum + detail.foreignIncome, 0)
  const totalForeignTaxPaid = details.reduce((sum, detail) => sum + detail.foreignWithholdingTaxPaid, 0)
  const totalGermanTaxDue = details.reduce((sum, detail) => sum + detail.germanTaxDue, 0)
  const totalRemainingGermanTax = details.reduce((sum, detail) => sum + detail.remainingGermanTax, 0)

  return {
    totalCreditableAmount,
    totalForeignIncome,
    totalForeignTaxPaid,
    totalGermanTaxDue,
    totalRemainingGermanTax,
    details,
  }
}

/**
 * Validate withholding tax configuration
 *
 * @param config - Withholding tax configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateQuellensteuerconfigConfiguration(config: QuellensteuerconfigConfiguration): string[] {
  const errors: string[] = []

  if (config.enabled) {
    if (config.foreignIncome < 0) {
      errors.push('Ausländische Einkünfte dürfen nicht negativ sein')
    }

    if (config.withholdingTaxRate < 0 || config.withholdingTaxRate > 1) {
      errors.push('Quellensteuersatz muss zwischen 0% und 100% liegen')
    }

    // Warn if withholding tax rate seems unusually high
    if (config.withholdingTaxRate > 0.5) {
      errors.push('Warnung: Quellensteuersatz über 50% ist ungewöhnlich hoch')
    }
  }

  return errors
}

/**
 * Create default withholding tax configuration
 */
export function createDefaultQuellensteuerconfigConfiguration(): QuellensteuerconfigConfiguration {
  return {
    enabled: false,
    foreignIncome: 0,
    withholdingTaxRate: 0.15, // Default to 15% (common DBA rate)
    countryCode: 'US',
  }
}
