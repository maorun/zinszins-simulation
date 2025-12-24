/**
 * Abfindungs-Optimierung (Severance Payment Optimization)
 * Implementation of the German Fünftelregelung (One-Fifth Rule) according to §34 EStG
 *
 * The Fünftelregelung is a tax privilege for extraordinary income like severance payments.
 * Instead of adding the full severance to the annual income (which could push the taxpayer
 * into a higher tax bracket), the tax is calculated as follows:
 *
 * Tax = 5 × (Tax on (regular income + severance/5) - Tax on regular income)
 *
 * This calculation effectively spreads the tax burden as if the severance was received
 * over 5 years, resulting in significant tax savings.
 */

/**
 * Configuration for severance payment optimization
 */
export interface SeveranceConfig {
  /** Whether severance optimization is enabled */
  enabled: boolean

  /** Severance amount in EUR (gross before taxes) */
  severanceAmount: number

  /** Year when severance is received */
  severanceYear: number

  /** Annual gross income in the severance year (excluding severance) */
  annualGrossIncome: number

  /** Annual capital gains in the severance year */
  annualCapitalGains?: number

  /** Kapitalertragsteuer rate (default: 26.375% including Soli) */
  capitalGainsTaxRate?: number

  /** Sparerpauschbetrag (capital gains tax allowance) for the year */
  capitalGainsTaxAllowance?: number

  /** Whether to apply Günstigerprüfung for capital gains */
  applyGuenstigerpruefung?: boolean
}

/**
 * Result of severance tax calculation
 */
export interface SeveranceTaxResult {
  /** Gross severance amount */
  grossAmount: number

  /** Income tax using standard taxation (without Fünftelregelung) */
  standardIncomeTax: number

  /** Income tax using Fünftelregelung */
  fuenftelregelungIncomeTax: number

  /** Tax savings through Fünftelregelung */
  taxSavings: number

  /** Net severance after taxes (with Fünftelregelung) */
  netAmount: number

  /** Effective tax rate with Fünftelregelung */
  effectiveTaxRate: number

  /** Tax on regular income (without severance) */
  regularIncomeTax: number

  /** Total tax burden in severance year (income + capital gains) */
  totalTaxBurden: number

  /** Capital gains tax in severance year */
  capitalGainsTax: number
}

/**
 * Comparison result for different severance scenarios
 */
export interface SeveranceComparisonResult {
  /** Year of the scenario */
  year: number

  /** Annual gross income for this year */
  annualGrossIncome: number

  /** Tax calculation result for this scenario */
  taxResult: SeveranceTaxResult

  /** Recommended: whether this is the optimal year */
  isOptimal: boolean
}

/**
 * German income tax calculation according to §32a EStG (2023 formula)
 * Simplified progressive tax calculation
 *
 * @param taxableIncome - Taxable income in EUR
 * @returns Income tax amount in EUR
 */
export function calculateGermanIncomeTax(taxableIncome: number): number {
  // Tax-free amount (Grundfreibetrag 2023)
  const grundfreibetrag = 10908

  if (taxableIncome <= grundfreibetrag) {
    return 0
  }

  // Calculate amount subject to tax (zvE = zu versteuerndes Einkommen)
  const zvE = taxableIncome

  let tax = 0

  if (zvE <= 15999) {
    // Up to Grundfreibetrag: 0% tax (already handled above)
    // Between 10909 and 15999: progressive zone 1 (14% to ~24%)
    if (zvE > grundfreibetrag) {
      const y = (zvE - grundfreibetrag) / 10000
      tax = (1088.67 * y + 1400) * y
    }
  } else if (zvE <= 62809) {
    // Second progression zone (~24% to 42%)
    const z = (zvE - 15999) / 10000
    tax = (206.43 * z + 2397) * z + 1025.38
  } else if (zvE <= 277825) {
    // Third zone (42% flat)
    tax = 0.42 * zvE - 10602.13
  } else {
    // Top tax rate zone (45%)
    tax = 0.45 * zvE - 18936.88
  }

  // Add Solidaritätszuschlag (5.5% of income tax, with Freigrenze)
  const soli = calculateSolidaritaetszuschlag(tax)

  return Math.max(0, tax + soli)
}

/**
 * Calculate Solidaritätszuschlag (Solidarity Surcharge)
 * Only applies above certain thresholds (Freigrenze)
 */
function calculateSolidaritaetszuschlag(incomeTax: number): number {
  // Freigrenze 2023: 16956 EUR (for single taxpayers)
  const freigrenze = 16956

  if (incomeTax <= freigrenze) {
    return 0
  }

  // Gleitzone: 16956 - 31518 EUR
  const gleitzonenObergrenze = 31518

  if (incomeTax <= gleitzonenObergrenze) {
    // In the sliding zone, Soli is calculated progressively
    const ueberschreitung = incomeTax - freigrenze
    return ueberschreitung * 0.119 // 11.9% of the amount exceeding Freigrenze
  }

  // Above Gleitzone: 5.5% of full income tax
  return incomeTax * 0.055
}

/**
 * Calculate capital gains tax
 */
function calculateCapitalGainsTax(capitalGains: number, taxAllowance: number, taxRate: number): number {
  const taxableAmount = Math.max(0, capitalGains - taxAllowance)
  return taxableAmount * (taxRate / 100)
}

/**
 * Calculate severance tax using standard taxation (no Fünftelregelung)
 */
function calculateStandardSeveranceTax(regularIncome: number, severanceAmount: number): number {
  // Calculate tax on combined income
  const totalIncomeTax = calculateGermanIncomeTax(regularIncome + severanceAmount)

  // Calculate tax on regular income only
  const regularIncomeTax = calculateGermanIncomeTax(regularIncome)

  // Tax attributable to severance
  return totalIncomeTax - regularIncomeTax
}

/**
 * Calculate severance tax using Fünftelregelung (§34 EStG)
 *
 * Formula: Tax = 5 × (Tax on (regular income + severance/5) - Tax on regular income)
 *
 * Special case: If there is no regular income (income = 0), the severance/5 might still
 * be within Grundfreibetrag, resulting in zero tax. This is correct behavior.
 */
function calculateFuenftelregelungTax(regularIncome: number, severanceAmount: number): number {
  // Calculate tax on regular income
  const regularIncomeTax = calculateGermanIncomeTax(regularIncome)

  // Calculate tax on regular income + 1/5 of severance
  const oneFifth = severanceAmount / 5
  const taxWithOneFifth = calculateGermanIncomeTax(regularIncome + oneFifth)

  // Calculate difference and multiply by 5
  const taxDifference = taxWithOneFifth - regularIncomeTax
  const fuenftelregelungTax = taxDifference * 5

  return Math.max(0, fuenftelregelungTax)
}

/**
 * Calculate severance tax with comprehensive analysis
 */
export function calculateSeveranceTax(config: SeveranceConfig): SeveranceTaxResult {
  if (!config.enabled || config.severanceAmount <= 0) {
    return {
      grossAmount: 0,
      standardIncomeTax: 0,
      fuenftelregelungIncomeTax: 0,
      taxSavings: 0,
      netAmount: 0,
      effectiveTaxRate: 0,
      regularIncomeTax: 0,
      totalTaxBurden: 0,
      capitalGainsTax: 0,
    }
  }

  const regularIncome = config.annualGrossIncome
  const severanceAmount = config.severanceAmount

  // Calculate regular income tax (without severance)
  const regularIncomeTax = calculateGermanIncomeTax(regularIncome)

  // Calculate tax using standard method
  const standardIncomeTax = calculateStandardSeveranceTax(regularIncome, severanceAmount)

  // Calculate tax using Fünftelregelung
  const fuenftelregelungIncomeTax = calculateFuenftelregelungTax(regularIncome, severanceAmount)

  // Calculate tax savings
  const taxSavings = standardIncomeTax - fuenftelregelungIncomeTax

  // Calculate capital gains tax if applicable
  const capitalGains = config.annualCapitalGains || 0
  const capitalGainsTaxRate = config.capitalGainsTaxRate || 26.375
  const capitalGainsTaxAllowance = config.capitalGainsTaxAllowance || 1000

  const capitalGainsTax = calculateCapitalGainsTax(capitalGains, capitalGainsTaxAllowance, capitalGainsTaxRate)

  // Calculate net amount after taxes
  const netAmount = severanceAmount - fuenftelregelungIncomeTax

  // Calculate effective tax rate
  const effectiveTaxRate = (fuenftelregelungIncomeTax / severanceAmount) * 100

  // Calculate total tax burden
  const totalTaxBurden = regularIncomeTax + fuenftelregelungIncomeTax + capitalGainsTax

  return {
    grossAmount: severanceAmount,
    standardIncomeTax,
    fuenftelregelungIncomeTax,
    taxSavings,
    netAmount,
    effectiveTaxRate,
    regularIncomeTax,
    totalTaxBurden,
    capitalGainsTax,
  }
}

/**
 * Compare severance taxation across multiple years
 * Helps find the optimal year to receive the severance payment
 */
export function compareSeveranceYears(
  severanceAmount: number,
  yearlyIncomeMap: { [year: number]: number },
  capitalGainsMap?: { [year: number]: number },
  capitalGainsTaxRate = 26.375,
  capitalGainsTaxAllowance = 1000,
): SeveranceComparisonResult[] {
  const results: SeveranceComparisonResult[] = []
  let lowestTax = Infinity
  let optimalYear = 0

  for (const [yearStr, annualGrossIncome] of Object.entries(yearlyIncomeMap)) {
    const year = parseInt(yearStr, 10)
    const capitalGains = capitalGainsMap?.[year] || 0

    const config: SeveranceConfig = {
      enabled: true,
      severanceAmount,
      severanceYear: year,
      annualGrossIncome,
      annualCapitalGains: capitalGains,
      capitalGainsTaxRate,
      capitalGainsTaxAllowance,
    }

    const taxResult = calculateSeveranceTax(config)

    // Track the year with lowest total tax burden
    if (taxResult.totalTaxBurden < lowestTax) {
      lowestTax = taxResult.totalTaxBurden
      optimalYear = year
    }

    results.push({
      year,
      annualGrossIncome,
      taxResult,
      isOptimal: false, // Will be updated after loop
    })
  }

  // Mark the optimal year
  results.forEach(result => {
    result.isOptimal = result.year === optimalYear
  })

  return results.sort((a, b) => a.year - b.year)
}

/**
 * Create default severance configuration
 */
export function createDefaultSeveranceConfig(): SeveranceConfig {
  return {
    enabled: false,
    severanceAmount: 50000,
    severanceYear: new Date().getFullYear(),
    annualGrossIncome: 60000,
    annualCapitalGains: 0,
    capitalGainsTaxRate: 26.375,
    capitalGainsTaxAllowance: 1000,
    applyGuenstigerpruefung: false,
  }
}

/**
 * Calculate the percentage tax savings from using Fünftelregelung
 */
export function calculateTaxSavingsPercentage(result: SeveranceTaxResult): number {
  if (result.standardIncomeTax === 0) {
    return 0
  }
  return (result.taxSavings / result.standardIncomeTax) * 100
}

/**
 * Estimate whether Fünftelregelung is beneficial
 * Returns true if tax savings are significant (> 5%)
 */
export function isFuenftelregelungBeneficial(result: SeveranceTaxResult): boolean {
  const savingsPercentage = calculateTaxSavingsPercentage(result)
  return savingsPercentage > 5
}
