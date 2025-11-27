/**
 * Alimony and Child Support Planning Module (Unterhaltszahlungen)
 *
 * Implements alimony and child support payment calculations for the Zinseszins-Simulation.
 * Follows German family law and tax regulations for Unterhaltszahlungen.
 *
 * Key German legal concepts:
 * - Kindesunterhalt: Child support payments (§1601-1615 BGB)
 * - Nachehelicher Unterhalt: Post-divorce spousal support (§1569-1586b BGB)
 * - Trennungsunterhalt: Separation support (§1361 BGB)
 * - Sonderausgaben/außergewöhnliche Belastungen: Tax deductions for alimony
 */

/**
 * Type of alimony/support payment
 */
export type AlimonyType = 'child_support' | 'spousal_support' | 'separation_support'

/**
 * Payment frequency
 */
export type PaymentFrequency = 'monthly' | 'quarterly' | 'yearly'

/**
 * Tax treatment for alimony payments
 */
export type TaxTreatment = 'sonderausgaben' | 'aussergewoehnliche_belastungen' | 'none'

/**
 * Configuration for a single alimony/child support payment
 */
export interface AlimonyPaymentConfig {
  /** Type of alimony payment */
  type: AlimonyType
  /** Monthly payment amount in EUR */
  monthlyAmount: number
  /** Payment start year */
  startYear: number
  /** Payment end year (null = indefinite) */
  endYear: number | null
  /** Number of recipients (e.g., number of children) */
  numberOfRecipients: number
  /** Payment frequency */
  frequency: PaymentFrequency
  /** Tax treatment type */
  taxTreatment: TaxTreatment
  /** Whether recipient has signed Realsplitting agreement (only for spousal support) */
  realsplittingAgreement: boolean
  /** Optional description for this payment */
  description?: string
}

/**
 * Overall alimony configuration for the simulation
 */
export interface AlimonyConfig {
  /** Whether alimony planning is active */
  enabled: boolean
  /** List of alimony/child support payments */
  payments: AlimonyPaymentConfig[]
}

/**
 * Result of alimony calculation for a specific year
 */
export interface AlimonyCalculationResult {
  /** Total annual alimony payments in EUR */
  totalAnnualPayment: number
  /** Breakdown by payment type */
  breakdown: {
    childSupport: number
    spousalSupport: number
    separationSupport: number
  }
  /** Tax-deductible amount in EUR */
  taxDeductibleAmount: number
  /** Tax savings based on tax rate in EUR */
  estimatedTaxSavings: number
  /** Number of active payments */
  activePayments: number
}

/**
 * Default configuration for a new alimony payment
 */
export function getDefaultAlimonyPayment(): AlimonyPaymentConfig {
  return {
    type: 'child_support',
    monthlyAmount: 500,
    startYear: new Date().getFullYear(),
    endYear: null,
    numberOfRecipients: 1,
    frequency: 'monthly',
    taxTreatment: 'aussergewoehnliche_belastungen',
    realsplittingAgreement: false,
    description: '',
  }
}

/**
 * Default overall alimony configuration
 */
export function getDefaultAlimonyConfig(): AlimonyConfig {
  return {
    enabled: false,
    payments: [],
  }
}

/**
 * Calculate annual payment amount from monthly amount and frequency
 *
 * @param monthlyAmount - Monthly payment in EUR
 * @param frequency - Payment frequency
 * @returns Annual payment amount in EUR
 */
export function calculateAnnualPayment(monthlyAmount: number, frequency: PaymentFrequency): number {
  const paymentsPerYear = {
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  }

  return monthlyAmount * paymentsPerYear[frequency]
}

/**
 * Check if a payment is active in a given year
 *
 * @param payment - Alimony payment configuration
 * @param year - Year to check
 * @returns true if payment is active in the given year
 */
export function isPaymentActiveInYear(payment: AlimonyPaymentConfig, year: number): boolean {
  const isAfterStart = year >= payment.startYear
  const isBeforeEnd = payment.endYear === null || year <= payment.endYear

  return isAfterStart && isBeforeEnd
}

/**
 * Calculate tax-deductible amount for alimony payments
 *
 * German tax rules for alimony:
 * - Child support (Kindesunterhalt): Generally not tax-deductible for payer
 * - Spousal support (Unterhalt): Can be deductible as Sonderausgaben (§10 Abs. 1a Nr. 1 EStG)
 *   with Realsplitting agreement (up to 13,805€ per year as of 2024)
 * - Without Realsplitting: Deductible as außergewöhnliche Belastungen with limitations
 *
 * @param payment - Alimony payment configuration
 * @param annualAmount - Annual payment amount in EUR
 * @returns Tax-deductible amount in EUR
 */
export function calculateTaxDeductibleAmount(payment: AlimonyPaymentConfig, annualAmount: number): number {
  // Child support is generally not tax-deductible
  if (payment.type === 'child_support') {
    return 0
  }

  // Spousal/separation support with Realsplitting agreement
  if (payment.realsplittingAgreement && payment.type === 'spousal_support') {
    // Maximum deductible amount under Realsplitting (§10 Abs. 1a Nr. 1 EStG)
    // As of 2024: 13,805€ per year
    const maxDeductible = 13805
    return Math.min(annualAmount, maxDeductible)
  }

  // Spousal/separation support as außergewöhnliche Belastungen
  // Limited deduction under §33a EStG
  if (payment.taxTreatment === 'aussergewoehnliche_belastungen') {
    // Simplified calculation: up to 10,908€ per year (2024) for adults
    const maxDeductible = 10908
    return Math.min(annualAmount, maxDeductible) * payment.numberOfRecipients
  }

  return 0
}

/**
 * Get empty calculation result (when disabled or no payments)
 */
function getEmptyAlimonyResult(): AlimonyCalculationResult {
  return {
    totalAnnualPayment: 0,
    breakdown: {
      childSupport: 0,
      spousalSupport: 0,
      separationSupport: 0,
    },
    taxDeductibleAmount: 0,
    estimatedTaxSavings: 0,
    activePayments: 0,
  }
}

/**
 * Categorize payment amount by type
 */
function categorizePaymentByType(
  breakdown: { childSupport: number; spousalSupport: number; separationSupport: number },
  type: AlimonyType,
  amount: number,
): void {
  if (type === 'child_support') {
    breakdown.childSupport += amount
  } else if (type === 'spousal_support') {
    breakdown.spousalSupport += amount
  } else {
    breakdown.separationSupport += amount
  }
}

/**
 * Calculate alimony payments and tax implications for a specific year
 *
 * @param config - Overall alimony configuration
 * @param year - Year to calculate for
 * @param marginalTaxRate - Marginal tax rate for tax savings estimation (0-1)
 * @returns Calculation result for the year
 */
export function calculateAlimonyForYear(
  config: AlimonyConfig,
  year: number,
  marginalTaxRate = 0.42,
): AlimonyCalculationResult {
  if (!config.enabled || config.payments.length === 0) {
    return getEmptyAlimonyResult()
  }

  let totalPayment = 0
  let totalTaxDeductible = 0
  let activePayments = 0
  const breakdown = { childSupport: 0, spousalSupport: 0, separationSupport: 0 }

  for (const payment of config.payments) {
    if (!isPaymentActiveInYear(payment, year)) {
      continue
    }

    activePayments++
    const annualAmount = calculateAnnualPayment(payment.monthlyAmount, payment.frequency)
    totalPayment += annualAmount

    categorizePaymentByType(breakdown, payment.type, annualAmount)
    totalTaxDeductible += calculateTaxDeductibleAmount(payment, annualAmount)
  }

  return {
    totalAnnualPayment: totalPayment,
    breakdown,
    taxDeductibleAmount: totalTaxDeductible,
    estimatedTaxSavings: totalTaxDeductible * marginalTaxRate,
    activePayments,
  }
}

/**
 * Validate amount fields
 */
function validateAmountFields(payment: AlimonyPaymentConfig, errors: string[]): void {
  if (payment.monthlyAmount < 0) {
    errors.push('Monatlicher Betrag kann nicht negativ sein')
  }
  if (payment.monthlyAmount > 100000) {
    errors.push('Monatlicher Betrag ist unrealistisch hoch (max. 100.000€)')
  }
}

/**
 * Validate year fields
 */
function validateYearFields(payment: AlimonyPaymentConfig, errors: string[]): void {
  if (payment.startYear < 1900 || payment.startYear > 2100) {
    errors.push('Startjahr muss zwischen 1900 und 2100 liegen')
  }

  if (payment.endYear !== null) {
    if (payment.endYear < payment.startYear) {
      errors.push('Endjahr kann nicht vor Startjahr liegen')
    }
    if (payment.endYear > 2100) {
      errors.push('Endjahr ist unrealistisch (max. 2100)')
    }
  }
}

/**
 * Validate recipient fields
 */
function validateRecipientFields(payment: AlimonyPaymentConfig, errors: string[]): void {
  if (payment.numberOfRecipients < 1) {
    errors.push('Anzahl Empfänger muss mindestens 1 sein')
  }
  if (payment.numberOfRecipients > 10) {
    errors.push('Anzahl Empfänger ist unrealistisch hoch (max. 10)')
  }
}

/**
 * Validate tax treatment fields
 */
function validateTaxTreatment(payment: AlimonyPaymentConfig, errors: string[]): void {
  if (payment.realsplittingAgreement && payment.type !== 'spousal_support') {
    errors.push('Realsplitting ist nur für Ehegattenunterhalt zulässig')
  }
}

/**
 * Validate alimony payment configuration
 *
 * @param payment - Payment configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateAlimonyPayment(payment: AlimonyPaymentConfig): string[] {
  const errors: string[] = []

  validateAmountFields(payment, errors)
  validateYearFields(payment, errors)
  validateRecipientFields(payment, errors)
  validateTaxTreatment(payment, errors)

  return errors
}

/**
 * Validate overall alimony configuration
 *
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateAlimonyConfig(config: AlimonyConfig): string[] {
  const errors: string[] = []

  if (config.payments.length > 20) {
    errors.push('Zu viele Unterhaltszahlungen konfiguriert (max. 20)')
  }

  // Validate each payment
  config.payments.forEach((payment, index) => {
    const paymentErrors = validateAlimonyPayment(payment)
    paymentErrors.forEach(error => {
      errors.push(`Zahlung ${index + 1}: ${error}`)
    })
  })

  return errors
}

/**
 * Calculate the impact on available capital after alimony payments
 *
 * @param availableCapital - Capital available before alimony in EUR
 * @param alimonyPayment - Annual alimony payment in EUR
 * @returns Remaining capital after alimony in EUR
 */
export function calculateCapitalAfterAlimony(availableCapital: number, alimonyPayment: number): number {
  return Math.max(0, availableCapital - alimonyPayment)
}

/**
 * Get recommended description for alimony payment based on type
 *
 * @param type - Type of alimony payment
 * @returns Suggested description text
 */
export function getSuggestedDescription(type: AlimonyType): string {
  const descriptions = {
    child_support: 'Kindesunterhalt',
    spousal_support: 'Nachehelicher Unterhalt',
    separation_support: 'Trennungsunterhalt',
  }

  return descriptions[type]
}
