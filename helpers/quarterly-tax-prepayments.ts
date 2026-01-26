/**
 * Quarterly Tax Prepayments (Abgeltungssteuer-Vorauszahlung) Helper Functions
 *
 * This module implements calculations for quarterly capital gains tax prepayments
 * required for self-employed individuals and freelancers in Germany.
 *
 * German tax law context:
 * - Self-employed individuals with significant capital income must make quarterly prepayments
 * - Payment deadlines: March 10, June 10, September 10, December 10
 * - Prepayments help avoid Nachzahlungszinsen (late payment interest of 6% p.a. per § 233a AO)
 * - Tax office can require prepayments if annual tax liability exceeds €400
 */

/**
 * Configuration for quarterly tax prepayment calculation
 */
export interface QuarterlyTaxPrepaymentConfig {
  /** Whether quarterly prepayments are enabled */
  enabled: boolean
  /** Expected annual capital income in EUR */
  expectedAnnualCapitalIncome: number
  /** Capital gains tax rate (Abgeltungssteuer, typically 25% + Soli) */
  capitalGainsTaxRate: number
  /** Annual tax-free allowance (Freibetrag) in EUR */
  taxFreeAllowance: number
  /** Partial exemption rate for equity funds (Teilfreistellungsquote) */
  partialExemptionRate: number
  /** Year for which prepayments are calculated */
  year: number
  /** Already paid withholding tax (Bereits gezahlte Abgeltungsteuer) in EUR */
  alreadyPaidWithholdingTax?: number
}

/**
 * Payment date for a quarterly tax prepayment
 */
export interface PaymentDate {
  /** Quarter number (1-4) */
  quarter: 1 | 2 | 3 | 4
  /** Payment deadline (ISO date string) */
  deadline: string
  /** Human-readable deadline (e.g., "10.03.2024") */
  deadlineFormatted: string
}

/**
 * Result of quarterly tax prepayment calculation
 */
export interface QuarterlyTaxPrepaymentResult {
  /** Total annual tax liability in EUR */
  annualTaxLiability: number
  /** Quarterly prepayment amount in EUR */
  quarterlyPrepayment: number
  /** Payment deadlines for all four quarters */
  paymentDates: PaymentDate[]
  /** Taxable income after allowances in EUR */
  taxableIncome: number
  /** Tax savings from tax-free allowance */
  taxFreeAllowanceSavings: number
  /** Tax savings from partial exemption */
  partialExemptionSavings: number
  /** Late payment interest rate (6% p.a.) */
  latePaymentInterestRate: number
  /** Estimated late payment interest if a quarter is missed (for 3 months) */
  estimatedLatePaymentInterest: number
  /** Already paid withholding tax (by banks) in EUR */
  alreadyPaidWithholdingTax: number
  /** Remaining tax liability after already paid withholding tax */
  remainingTaxLiability: number
  /** Remaining quarterly prepayment after considering already paid tax */
  remainingQuarterlyPrepayment: number
}

/**
 * Quarterly prepayment deadlines (German tax law)
 */
const QUARTERLY_DEADLINES = [
  { quarter: 1 as const, day: 10, month: 3 }, // March 10
  { quarter: 2 as const, day: 10, month: 6 }, // June 10
  { quarter: 3 as const, day: 10, month: 9 }, // September 10
  { quarter: 4 as const, day: 10, month: 12 }, // December 10
]

/**
 * Late payment interest rate per § 233a AO (6% per annum)
 */
const LATE_PAYMENT_INTEREST_RATE = 0.06

/**
 * Calculate payment dates for quarterly tax prepayments
 * @param year - Year for which to calculate payment dates
 * @returns Array of payment dates with deadlines
 */
export function calculatePaymentDates(year: number): PaymentDate[] {
  return QUARTERLY_DEADLINES.map((deadline) => {
    const date = new Date(year, deadline.month - 1, deadline.day)
    return {
      quarter: deadline.quarter,
      deadline: date.toISOString().split('T')[0],
      deadlineFormatted: `${deadline.day.toString().padStart(2, '0')}.${deadline.month.toString().padStart(2, '0')}.${year}`,
    }
  })
}

/**
 * Calculate quarterly tax prepayments for self-employed individuals
 *
 * German tax prepayment rules:
 * 1. Tax office requires prepayments if annual tax exceeds €400
 * 2. Prepayments are due quarterly on fixed dates
 * 3. Each quarter pays 1/4 of estimated annual tax
 * 4. Tax-free allowance (Freibetrag) reduces taxable income
 * 5. Partial exemption (Teilfreistellung) reduces tax base for equity funds
 * 6. Late payments incur 6% p.a. interest (§ 233a AO)
 *
 * @param config - Quarterly tax prepayment configuration
 * @returns Calculation result with prepayment amounts and deadlines
 */
export function calculateQuarterlyTaxPrepayments(
  config: QuarterlyTaxPrepaymentConfig,
): QuarterlyTaxPrepaymentResult {
  const alreadyPaidWithholdingTax = config.alreadyPaidWithholdingTax ?? 0

  if (!config.enabled) {
    return {
      annualTaxLiability: 0,
      quarterlyPrepayment: 0,
      paymentDates: calculatePaymentDates(config.year),
      taxableIncome: 0,
      taxFreeAllowanceSavings: 0,
      partialExemptionSavings: 0,
      latePaymentInterestRate: LATE_PAYMENT_INTEREST_RATE,
      estimatedLatePaymentInterest: 0,
      alreadyPaidWithholdingTax,
      remainingTaxLiability: 0,
      remainingQuarterlyPrepayment: 0,
    }
  }

  // Step 1: Apply partial exemption (Teilfreistellung) for equity funds
  const incomeAfterPartialExemption = config.expectedAnnualCapitalIncome * (1 - config.partialExemptionRate / 100)
  const partialExemptionSavings =
    (config.expectedAnnualCapitalIncome - incomeAfterPartialExemption) * (config.capitalGainsTaxRate / 100)

  // Step 2: Apply tax-free allowance (Freibetrag)
  const taxableIncome = Math.max(0, incomeAfterPartialExemption - config.taxFreeAllowance)
  const taxFreeAllowanceUsed = Math.min(config.taxFreeAllowance, incomeAfterPartialExemption)
  const taxFreeAllowanceSavings = taxFreeAllowanceUsed * (config.capitalGainsTaxRate / 100)

  // Step 3: Calculate annual tax liability
  const annualTaxLiability = taxableIncome * (config.capitalGainsTaxRate / 100)

  // Step 4: Subtract already paid withholding tax (from banks) from total liability
  const remainingTaxLiability = Math.max(0, annualTaxLiability - alreadyPaidWithholdingTax)

  // Step 5: Calculate quarterly prepayment (1/4 of remaining tax liability)
  const remainingQuarterlyPrepayment = remainingTaxLiability / 4

  // Step 6: Calculate quarterly prepayment without considering already paid tax (for comparison)
  const quarterlyPrepayment = annualTaxLiability / 4

  // Step 7: Calculate estimated late payment interest for one quarter (3 months)
  const estimatedLatePaymentInterest = (remainingQuarterlyPrepayment * LATE_PAYMENT_INTEREST_RATE * 3) / 12

  return {
    annualTaxLiability,
    quarterlyPrepayment,
    paymentDates: calculatePaymentDates(config.year),
    taxableIncome,
    taxFreeAllowanceSavings,
    partialExemptionSavings,
    latePaymentInterestRate: LATE_PAYMENT_INTEREST_RATE,
    estimatedLatePaymentInterest,
    alreadyPaidWithholdingTax,
    remainingTaxLiability,
    remainingQuarterlyPrepayment,
  }
}

/**
 * Calculate overpayment or underpayment scenario
 * @param prepaidAmount - Total amount prepaid during the year
 * @param actualTaxLiability - Actual tax liability based on final annual income
 * @returns Positive value = refund expected, Negative value = additional payment required
 */
export function calculatePrepaymentAdjustment(prepaidAmount: number, actualTaxLiability: number): number {
  return prepaidAmount - actualTaxLiability
}

/**
 * Calculate default quarterly tax prepayment config
 */
export function getDefaultQuarterlyTaxPrepaymentConfig(year: number): QuarterlyTaxPrepaymentConfig {
  return {
    enabled: false,
    expectedAnnualCapitalIncome: 0,
    capitalGainsTaxRate: 26.375, // 25% Abgeltungssteuer + 5.5% Solidaritätszuschlag
    taxFreeAllowance: 1000, // Standard Sparer-Pauschbetrag (single person)
    partialExemptionRate: 30, // Standard for equity funds (Aktienfonds)
    year,
    alreadyPaidWithholdingTax: 0, // No withholding tax paid by default
  }
}

/**
 * Validate quarterly tax prepayment configuration
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateQuarterlyTaxPrepaymentConfig(config: QuarterlyTaxPrepaymentConfig): string[] {
  const errors: string[] = []

  const validations = [
    {
      condition: config.expectedAnnualCapitalIncome < 0,
      message: 'Erwartete jährliche Kapitalerträge können nicht negativ sein',
    },
    {
      condition: config.capitalGainsTaxRate < 0 || config.capitalGainsTaxRate > 100,
      message: 'Kapitalertragsteuersatz muss zwischen 0% und 100% liegen',
    },
    {
      condition: config.taxFreeAllowance < 0,
      message: 'Freibetrag kann nicht negativ sein',
    },
    {
      condition: config.partialExemptionRate < 0 || config.partialExemptionRate > 100,
      message: 'Teilfreistellungsquote muss zwischen 0% und 100% liegen',
    },
    {
      condition: config.year < 2000 || config.year > 2100,
      message: 'Jahr muss zwischen 2000 und 2100 liegen',
    },
    {
      condition: (config.alreadyPaidWithholdingTax ?? 0) < 0,
      message: 'Bereits gezahlte Abgeltungsteuer kann nicht negativ sein',
    },
  ]

  validations.forEach((validation) => {
    if (validation.condition) {
      errors.push(validation.message)
    }
  })

  return errors
}

/**
 * Check if quarterly prepayments are likely required
 * German tax office typically requires prepayments if annual tax exceeds €400
 * @param annualTaxLiability - Expected annual tax liability
 * @returns true if prepayments are likely required
 */
export function arePrepaymentsRequired(annualTaxLiability: number): boolean {
  return annualTaxLiability > 400
}

/**
 * Calculate optimization suggestions to minimize prepayments
 * @param config - Current configuration
 * @returns Array of optimization suggestions
 */
export function getOptimizationSuggestions(config: QuarterlyTaxPrepaymentConfig): string[] {
  const suggestions: string[] = []

  // Check if tax-free allowance is optimally used
  if (config.taxFreeAllowance < 1000) {
    suggestions.push(
      'Nutzen Sie den vollen Sparer-Pauschbetrag von 1.000 € (Singles) oder 2.000 € (Paare) durch einen Freistellungsauftrag bei Ihrer Bank.',
    )
  }

  // Check if partial exemption is considered for equity funds
  if (config.partialExemptionRate === 0) {
    suggestions.push(
      'Bei Aktienfonds können Sie von der Teilfreistellung (30%) profitieren, die Ihre Steuerlast reduziert.',
    )
  }

  // Suggest timing optimization for high tax liabilities
  const result = calculateQuarterlyTaxPrepayments(config)
  if (result.annualTaxLiability > 10000) {
    suggestions.push(
      'Bei hoher Steuerlast können Sie die Vorauszahlungen strategisch planen, um Liquiditätsengpässe zu vermeiden.',
    )
  }

  // Check if already paid withholding tax significantly reduces prepayments
  const alreadyPaid = config.alreadyPaidWithholdingTax ?? 0
  if (alreadyPaid > 0 && result.remainingTaxLiability < result.annualTaxLiability * 0.3) {
    suggestions.push(
      `Die bereits von Ihrer Bank einbehaltene Abgeltungsteuer (${formatCurrency(alreadyPaid)}) reduziert Ihre Vorauszahlungspflicht erheblich.`,
    )
  }

  // Warn if already paid tax exceeds total liability
  if (alreadyPaid > result.annualTaxLiability) {
    suggestions.push(
      'Achtung: Die bereits gezahlte Abgeltungsteuer übersteigt Ihre Gesamtsteuerlast. Sie können eine Erstattung bei Ihrer Steuererklärung beantragen.',
    )
  }

  return suggestions
}

/**
 * Format currency amount in German format
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
