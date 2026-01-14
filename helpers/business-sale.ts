/**
 * German business sale (Unternehmensverkauf) tax calculations
 * 
 * Implements tax calculations for business sales according to German tax law (§ 16 EStG).
 * Includes the §16 exemption (Freibetrag) and the fifth rule (Fünftelregelung) for
 * extraordinary income.
 */

/**
 * §16 EStG Exemption amounts based on age
 * Full exemption (45,000€) applies if seller is 55+ or permanently disabled
 * The exemption is reduced for gains above 136,000€
 */
export const BUSINESS_SALE_EXEMPTION = {
  /** Full exemption amount for sellers aged 55+ or permanently disabled */
  FULL_EXEMPTION: 45000,
  /** Threshold above which exemption is gradually reduced */
  REDUCTION_THRESHOLD: 136000,
  /** Threshold at which exemption is fully phased out */
  FULL_PHASEOUT: 181000,
} as const

/**
 * German income tax brackets for 2024 (Einkommensteuertarif)
 * Progressive tax rates from 0% to 45%
 */
export const INCOME_TAX_BRACKETS = [
  { upTo: 11604, rate: 0 }, // Grundfreibetrag (basic allowance) - no tax
  { upTo: 17005, rate: 0.14 }, // Entry zone starts at 14%
  { upTo: 66760, rate: 0.24 }, // Progressive zone up to 24%
  { upTo: 277825, rate: 0.42 }, // Top rate zone
  { upTo: Infinity, rate: 0.45 }, // Reichensteuer (wealth tax)
] as const

/**
 * Solidaritätszuschlag (solidarity surcharge) rate
 * 5.5% of income tax (Einkommensteuer)
 */
export const SOLIDARITY_SURCHARGE_RATE = 0.055

/**
 * Business sale configuration
 */
export type BusinessSaleConfig = {
  /** Sale price of the business */
  salePrice: number
  /** Book value / acquisition costs of the business */
  bookValue: number
  /** Age of the seller at time of sale */
  sellerAge: number
  /** Whether seller is permanently disabled (permanently disabled = full exemption regardless of age) */
  permanentlyDisabled?: boolean
  /** Other taxable income in the year of sale (salary, etc.) */
  otherIncome?: number
  /** Whether to apply the Fünftelregelung (fifth rule) */
  applyFifthRule?: boolean
}

/**
 * Result of business sale tax calculation
 */
export type BusinessSaleTaxResult = {
  /** Capital gain before exemptions (Veräußerungsgewinn) */
  capitalGain: number
  /** §16 EStG exemption amount applied */
  exemptionAmount: number
  /** Taxable gain after exemptions */
  taxableGain: number
  /** Income tax on the gain */
  incomeTax: number
  /** Solidarity surcharge on the income tax */
  solidaritySurcharge: number
  /** Total tax burden */
  totalTax: number
  /** Net proceeds after tax */
  netProceeds: number
  /** Effective tax rate on capital gain */
  effectiveTaxRate: number
  /** Whether Fünftelregelung was applied */
  fifthRuleApplied: boolean
  /** Tax savings from Fünftelregelung (if applicable) */
  fifthRuleSavings?: number
}

/**
 * Calculate §16 EStG exemption based on capital gain and seller's age
 * 
 * @param capitalGain - Capital gain from business sale
 * @param sellerAge - Age of seller at time of sale
 * @param permanentlyDisabled - Whether seller is permanently disabled
 * @returns Applicable exemption amount
 */
export function calculateBusinessSaleExemption(
  capitalGain: number,
  sellerAge: number,
  permanentlyDisabled = false,
): number {
  // Exemption only applies if seller is 55+ or permanently disabled
  if (sellerAge < 55 && !permanentlyDisabled) {
    return 0
  }

  // If gain is below reduction threshold, full exemption applies
  if (capitalGain <= BUSINESS_SALE_EXEMPTION.REDUCTION_THRESHOLD) {
    return Math.min(BUSINESS_SALE_EXEMPTION.FULL_EXEMPTION, capitalGain)
  }

  // If gain exceeds full phaseout threshold, no exemption
  if (capitalGain >= BUSINESS_SALE_EXEMPTION.FULL_PHASEOUT) {
    return 0
  }

  // Calculate reduced exemption
  const excessAmount = capitalGain - BUSINESS_SALE_EXEMPTION.REDUCTION_THRESHOLD
  const reductionAmount = excessAmount
  const reducedExemption = BUSINESS_SALE_EXEMPTION.FULL_EXEMPTION - reductionAmount

  return Math.max(0, reducedExemption)
}

/**
 * Calculate income tax using German progressive tax brackets
 * 
 * @param taxableIncome - Taxable income amount
 * @returns Income tax amount
 */
export function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0

  let tax = 0
  let remainingIncome = taxableIncome
  let previousThreshold = 0

  for (const bracket of INCOME_TAX_BRACKETS) {
    const bracketSize = bracket.upTo - previousThreshold
    const taxableInBracket = Math.min(remainingIncome, bracketSize)
    
    // Progressive calculation within bracket (simplified linear progression)
    if (bracket.rate > 0) {
      // For the entry and progressive zones, use the rate as maximum for that bracket
      tax += taxableInBracket * bracket.rate
    }
    
    remainingIncome -= taxableInBracket
    previousThreshold = bracket.upTo

    if (remainingIncome <= 0) break
  }

  return tax
}

/**
 * Calculate business sale taxes with Fünftelregelung (fifth rule)
 * 
 * The Fünftelregelung spreads the extraordinary income over 5 years for tax purposes,
 * reducing the progressive tax burden.
 * 
 * Formula: Tax = 5 × (Tax on [otherIncome + taxableGain/5] - Tax on otherIncome)
 * 
 * @param taxableGain - Taxable gain after exemptions
 * @param otherIncome - Other taxable income in the year
 * @returns Tax amount with fifth rule applied
 */
export function calculateTaxWithFifthRule(taxableGain: number, otherIncome: number): number {
  const onesFifthGain = taxableGain / 5
  
  // Calculate tax with and without the one-fifth gain
  const taxWithFifth = calculateIncomeTax(otherIncome + onesFifthGain)
  const taxWithoutGain = calculateIncomeTax(otherIncome)
  
  // The difference multiplied by 5 is the total tax on the gain
  const taxOnGain = (taxWithFifth - taxWithoutGain) * 5
  
  return taxOnGain
}

/**
 * Calculate complete business sale taxation
 * 
 * @param config - Business sale configuration
 * @returns Complete tax calculation result
 */
export function calculateBusinessSaleTax(config: BusinessSaleConfig): BusinessSaleTaxResult {
  // Calculate capital gain
  const capitalGain = Math.max(0, config.salePrice - config.bookValue)
  
  // Calculate §16 EStG exemption
  const exemptionAmount = calculateBusinessSaleExemption(
    capitalGain,
    config.sellerAge,
    config.permanentlyDisabled,
  )
  
  // Calculate taxable gain
  const taxableGain = Math.max(0, capitalGain - exemptionAmount)
  
  const otherIncome = config.otherIncome ?? 0
  const applyFifthRule = config.applyFifthRule ?? true
  
  // Calculate income tax
  let incomeTax: number
  let fifthRuleApplied = false
  let fifthRuleSavings: number | undefined
  
  if (applyFifthRule && taxableGain > 0) {
    // Apply Fünftelregelung
    incomeTax = calculateTaxWithFifthRule(taxableGain, otherIncome)
    fifthRuleApplied = true
    
    // Calculate savings compared to normal taxation
    const normalTax = calculateIncomeTax(otherIncome + taxableGain) - calculateIncomeTax(otherIncome)
    fifthRuleSavings = Math.max(0, normalTax - incomeTax)
  } else {
    // Normal taxation without fifth rule
    const totalIncomeTax = calculateIncomeTax(otherIncome + taxableGain)
    const otherIncomeTax = calculateIncomeTax(otherIncome)
    incomeTax = totalIncomeTax - otherIncomeTax
  }
  
  // Calculate solidarity surcharge
  const solidaritySurcharge = incomeTax * SOLIDARITY_SURCHARGE_RATE
  
  // Calculate total tax and net proceeds
  const totalTax = incomeTax + solidaritySurcharge
  const netProceeds = config.salePrice - totalTax
  const effectiveTaxRate = capitalGain > 0 ? totalTax / capitalGain : 0
  
  return {
    capitalGain,
    exemptionAmount,
    taxableGain,
    incomeTax,
    solidaritySurcharge,
    totalTax,
    netProceeds,
    effectiveTaxRate,
    fifthRuleApplied,
    fifthRuleSavings,
  }
}

/**
 * Compare tax outcomes with and without Fünftelregelung
 * 
 * @param config - Business sale configuration
 * @returns Comparison of both taxation methods
 */
export function compareBusinessSaleTaxMethods(config: BusinessSaleConfig): {
  withFifthRule: BusinessSaleTaxResult
  withoutFifthRule: BusinessSaleTaxResult
  savings: number
  savingsPercentage: number
} {
  const withFifthRule = calculateBusinessSaleTax({ ...config, applyFifthRule: true })
  const withoutFifthRule = calculateBusinessSaleTax({ ...config, applyFifthRule: false })
  
  const savings = withoutFifthRule.totalTax - withFifthRule.totalTax
  const savingsPercentage =
    withoutFifthRule.totalTax > 0 ? (savings / withoutFifthRule.totalTax) * 100 : 0
  
  return {
    withFifthRule,
    withoutFifthRule,
    savings,
    savingsPercentage,
  }
}

/**
 * Calculate optimal sale timing from tax perspective
 * 
 * Analyzes different sale years to find the optimal timing considering:
 * - Age-based exemption (55+ threshold)
 * - Other income variations over years
 * 
 * @param baseConfig - Base business sale configuration
 * @param startYear - First year to consider
 * @param endYear - Last year to consider
 * @param yearlyOtherIncome - Map of year to other income amount
 * @returns Analysis of each year with recommendation
 */
export function calculateOptimalSaleTiming(
  baseConfig: Omit<BusinessSaleConfig, 'otherIncome'>,
  startYear: number,
  endYear: number,
  yearlyOtherIncome: Map<number, number>,
): {
  yearAnalysis: Array<{
    year: number
    sellerAge: number
    otherIncome: number
    result: BusinessSaleTaxResult
  }>
  optimalYear: number
  optimalYearSavings: number
} {
  const yearAnalysis: Array<{
    year: number
    sellerAge: number
    otherIncome: number
    result: BusinessSaleTaxResult
  }> = []
  
  const currentAge = baseConfig.sellerAge
  const currentYear = new Date().getFullYear()
  
  for (let year = startYear; year <= endYear; year++) {
    const ageAtSale = currentAge + (year - currentYear)
    const otherIncome = yearlyOtherIncome.get(year) ?? 0
    
    const result = calculateBusinessSaleTax({
      ...baseConfig,
      sellerAge: ageAtSale,
      otherIncome,
    })
    
    yearAnalysis.push({
      year,
      sellerAge: ageAtSale,
      otherIncome,
      result,
    })
  }
  
  // Find year with lowest total tax
  const optimalEntry = yearAnalysis.reduce((best, current) =>
    current.result.totalTax < best.result.totalTax ? current : best
  )
  
  const worstTax = Math.max(...yearAnalysis.map(a => a.result.totalTax))
  const optimalYearSavings = worstTax - optimalEntry.result.totalTax
  
  return {
    yearAnalysis,
    optimalYear: optimalEntry.year,
    optimalYearSavings,
  }
}

/**
 * Calculate reinvestment strategy after business sale
 * 
 * Helps plan what to do with the net proceeds from the sale.
 * 
 * @param netProceeds - Net amount after taxes
 * @param reinvestmentRate - Expected annual return rate (as decimal, e.g., 0.07 for 7%)
 * @param years - Number of years to project
 * @returns Projected growth of reinvested proceeds
 */
export function calculateReinvestmentStrategy(
  netProceeds: number,
  reinvestmentRate: number,
  years: number,
): {
  yearlyGrowth: Array<{
    year: number
    balance: number
    yearlyReturn: number
    cumulativeReturn: number
  }>
  finalBalance: number
  totalReturn: number
} {
  const yearlyGrowth: Array<{
    year: number
    balance: number
    yearlyReturn: number
    cumulativeReturn: number
  }> = []
  
  let currentBalance = netProceeds
  let cumulativeReturn = 0
  
  for (let year = 1; year <= years; year++) {
    const yearlyReturn = currentBalance * reinvestmentRate
    currentBalance += yearlyReturn
    cumulativeReturn += yearlyReturn
    
    yearlyGrowth.push({
      year,
      balance: currentBalance,
      yearlyReturn,
      cumulativeReturn,
    })
  }
  
  return {
    yearlyGrowth,
    finalBalance: currentBalance,
    totalReturn: cumulativeReturn,
  }
}
