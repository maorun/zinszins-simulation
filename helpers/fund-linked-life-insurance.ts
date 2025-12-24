/**
 * Types and utilities for German fund-linked life insurance (Fondsgebundene Lebensversicherung)
 *
 * Fund-linked life insurance combines investment (typically ETFs) with life insurance coverage.
 * Key characteristics:
 * - Regular contributions invested in funds
 * - Tax advantages: After 12 years + age 62, only 50% of gains are taxable (Halbeinkünfteverfahren)
 * - Costs: Abschlusskosten (upfront), Verwaltungskosten (ongoing), guarantee costs
 * - Death benefit included
 *
 * This is distinct from traditional capital life insurance (Kapitallebensversicherung) which
 * has guaranteed returns, and from direct ETF investment which has no insurance wrapper.
 */

/**
 * Configuration for fund-linked life insurance
 */
export interface FundLinkedLifeInsuranceConfig {
  /** Display name for this insurance policy */
  name: string

  /** Year when policy starts */
  startYear: number

  /** Year when policy ends (maturity or conversion to pension phase) */
  endYear: number

  /** Monthly contribution amount in EUR */
  monthlyContribution: number

  /** Expected annual return rate of the underlying funds (before costs) */
  expectedReturnRate: number

  /** Initial lump sum investment (Einmalzahlung) in EUR */
  initialInvestment: number

  /** Abschlusskosten (upfront costs) as percentage of total contributions (typically 2.5-5%) */
  upfrontCostPercent: number

  /** Annual Verwaltungskosten (management costs) as percentage of portfolio value (typically 0.5-1.5%) */
  annualManagementCostPercent: number

  /** Annual guarantee cost as percentage (for Garantie-Produkte, typically 0.5-2%) */
  guaranteeCostPercent: number

  /** Birth year of insured person (for age-based tax calculation) */
  birthYear: number

  /** Minimum guaranteed amount at maturity (0 for pure fund products) */
  guaranteedMinimumAmount: number

  /** Death benefit multiplier (e.g., 1.1 = 110% of portfolio value) */
  deathBenefitMultiplier: number

  /** Whether to include death benefit costs in calculations */
  includeDeathBenefitCosts: boolean

  /** Whether this insurance is enabled in calculations */
  enabled: boolean
}

/**
 * Yearly result of fund-linked life insurance calculation
 */
export interface FundLinkedLifeInsuranceYearResult {
  /** Year of calculation */
  year: number

  /** Age of insured person */
  age: number

  /** Contribution made this year */
  annualContribution: number

  /** Upfront costs deducted this year */
  upfrontCosts: number

  /** Management costs deducted this year */
  managementCosts: number

  /** Guarantee costs deducted this year */
  guaranteeCosts: number

  /** Death benefit costs this year */
  deathBenefitCosts: number

  /** Total costs this year */
  totalCosts: number

  /** Net amount invested after costs */
  netInvestedAmount: number

  /** Investment return this year (before costs) */
  investmentReturn: number

  /** Portfolio value at end of year */
  portfolioValue: number

  /** Total contributions made so far */
  totalContributions: number

  /** Total costs paid so far */
  totalCostsPaid: number

  /** Investment gains (portfolio value - total contributions) */
  investmentGains: number

  /** Whether tax benefits apply (12 years holding + age 62+) */
  taxBenefitsApply: boolean

  /** Taxable portion of gains if withdrawn (50% if tax benefits apply, 100% otherwise) */
  taxableGainsPercent: number
}

/**
 * Summary of fund-linked life insurance at a specific point in time
 */
export interface FundLinkedLifeInsuranceSummary {
  /** Policy configuration */
  config: FundLinkedLifeInsuranceConfig

  /** All yearly calculations */
  yearlyResults: FundLinkedLifeInsuranceYearResult[]

  /** Final portfolio value at maturity */
  finalPortfolioValue: number

  /** Total contributions made */
  totalContributions: number

  /** Total costs paid */
  totalCostsPaid: number

  /** Total investment gains */
  totalInvestmentGains: number

  /** Whether tax benefits apply at maturity */
  taxBenefitsApplyAtMaturity: boolean

  /** Effective annual return after all costs */
  effectiveAnnualReturn: number

  /** Cost ratio (total costs / total contributions) */
  costRatio: number
}

/**
 * Calculate year costs for fund-linked life insurance
 */
function calculateYearCosts(
  config: FundLinkedLifeInsuranceConfig,
  portfolioValue: number,
  age: number,
  yearIndex: number,
  annualUpfrontCost: number,
  upfrontCostYears: number,
): {
  upfrontCosts: number
  managementCosts: number
  guaranteeCosts: number
  deathBenefitCosts: number
  totalCosts: number
} {
  const upfrontCosts = yearIndex < upfrontCostYears ? annualUpfrontCost : 0
  const managementCosts = (portfolioValue * config.annualManagementCostPercent) / 100
  const guaranteeCosts = (portfolioValue * config.guaranteeCostPercent) / 100

  const baseMortalityCost = 0.0005 // 0.05% base
  const ageFactor = Math.max(0, age - 30) / 10000 // Increases slowly with age
  const deathBenefitCosts = config.includeDeathBenefitCosts ? portfolioValue * (baseMortalityCost + ageFactor) : 0

  const totalCosts = upfrontCosts + managementCosts + guaranteeCosts + deathBenefitCosts

  return {
    upfrontCosts,
    managementCosts,
    guaranteeCosts,
    deathBenefitCosts,
    totalCosts,
  }
}

/**
 * Calculate summary metrics from yearly results
 */
function calculateSummaryMetrics(
  config: FundLinkedLifeInsuranceConfig,
  yearlyResults: FundLinkedLifeInsuranceYearResult[],
  totalContributions: number,
  totalCostsPaid: number,
): {
  finalPortfolioValue: number
  totalInvestmentGains: number
  effectiveAnnualReturn: number
  costRatio: number
  taxBenefitsApplyAtMaturity: boolean
} {
  const finalResult = yearlyResults[yearlyResults.length - 1]
  const finalPortfolioValue = finalResult?.portfolioValue ?? 0
  const totalInvestmentGains = finalPortfolioValue - totalContributions

  const years = config.endYear - config.startYear
  const effectiveAnnualReturn =
    years > 0 && totalContributions > 0 ? (Math.pow(finalPortfolioValue / totalContributions, 1 / years) - 1) * 100 : 0

  const costRatio = totalContributions > 0 ? (totalCostsPaid / totalContributions) * 100 : 0

  return {
    finalPortfolioValue,
    totalInvestmentGains,
    effectiveAnnualReturn,
    costRatio,
    taxBenefitsApplyAtMaturity: finalResult?.taxBenefitsApply ?? false,
  }
}

/**
 * Apply guarantee if needed at maturity
 */
function applyGuarantee(portfolioValue: number, year: number, endYear: number, guaranteedMinimum: number): number {
  if (year === endYear && guaranteedMinimum > 0) {
    return Math.max(portfolioValue, guaranteedMinimum)
  }
  return portfolioValue
}

/**
 * Calculate tax benefit status for a given year
 */
function calculateTaxBenefitStatus(
  policyDuration: number,
  age: number,
): { taxBenefitsApply: boolean; taxableGainsPercent: number } {
  const taxBenefitsApply = policyDuration >= 12 && age >= 62
  const taxableGainsPercent = taxBenefitsApply ? 50 : 100
  return { taxBenefitsApply, taxableGainsPercent }
}

/**
 * Calculate portfolio value after returns, contributions and costs
 */
function calculateUpdatedPortfolio(
  portfolioBeforeCosts: number,
  costs: { totalCosts: number },
  year: number,
  endYear: number,
  guaranteedMinimum: number,
): number {
  const updated = Math.max(0, portfolioBeforeCosts - costs.totalCosts)
  return applyGuarantee(updated, year, endYear, guaranteedMinimum)
}

/** Create year result object */
function createYearResult(
  year: number,
  age: number,
  annualContribution: number,
  costs: ReturnType<typeof calculateYearCosts>,
  investmentReturn: number,
  portfolioValue: number,
  totalContributions: number,
  totalCostsPaid: number,
  policyDuration: number,
): FundLinkedLifeInsuranceYearResult {
  const investmentGains = portfolioValue - totalContributions
  const taxStatus = calculateTaxBenefitStatus(policyDuration, age)
  return {
    year,
    age,
    annualContribution,
    upfrontCosts: costs.upfrontCosts,
    managementCosts: costs.managementCosts,
    guaranteeCosts: costs.guaranteeCosts,
    deathBenefitCosts: costs.deathBenefitCosts,
    totalCosts: costs.totalCosts,
    netInvestedAmount: annualContribution - costs.upfrontCosts,
    investmentReturn,
    portfolioValue,
    totalContributions,
    totalCostsPaid,
    investmentGains,
    taxBenefitsApply: taxStatus.taxBenefitsApply,
    taxableGainsPercent: taxStatus.taxableGainsPercent,
  }
}

/** Compute yearly insurance parameters */
function computeYearParams(
  config: FundLinkedLifeInsuranceConfig,
  year: number,
  portfolioValue: number,
  annualUpfrontCost: number,
  upfrontCostYears: number,
): {
  age: number
  annualContribution: number
  yearIndex: number
  investmentReturn: number
  portfolioBeforeCosts: number
  costs: ReturnType<typeof calculateYearCosts>
} {
  const age = year - config.birthYear
  const annualContribution = config.monthlyContribution * 12
  const yearIndex = year - config.startYear
  const investmentReturn = portfolioValue * (config.expectedReturnRate / 100)
  const portfolioBeforeCosts = portfolioValue + investmentReturn + annualContribution
  const costs = calculateYearCosts(config, portfolioBeforeCosts, age, yearIndex, annualUpfrontCost, upfrontCostYears)
  return { age, annualContribution, yearIndex, investmentReturn, portfolioBeforeCosts, costs }
}

/** Process a single year in the insurance calculation */
function processInsuranceYear(
  config: FundLinkedLifeInsuranceConfig,
  year: number,
  portfolioValue: number,
  totalContributions: number,
  totalCostsPaid: number,
  annualUpfrontCost: number,
  upfrontCostYears: number,
): {
  yearResult: FundLinkedLifeInsuranceYearResult
  updatedPortfolioValue: number
  updatedTotalContributions: number
  updatedTotalCostsPaid: number
} {
  const params = computeYearParams(config, year, portfolioValue, annualUpfrontCost, upfrontCostYears)
  const updatedTotalContributions = totalContributions + params.annualContribution
  const updatedTotalCostsPaid = totalCostsPaid + params.costs.totalCosts
  const updatedPortfolioValue = calculateUpdatedPortfolio(
    params.portfolioBeforeCosts,
    params.costs,
    year,
    config.endYear,
    config.guaranteedMinimumAmount,
  )
  return {
    yearResult: createYearResult(
      year,
      params.age,
      params.annualContribution,
      params.costs,
      params.investmentReturn,
      updatedPortfolioValue,
      updatedTotalContributions,
      updatedTotalCostsPaid,
      params.yearIndex,
    ),
    updatedPortfolioValue,
    updatedTotalContributions,
    updatedTotalCostsPaid,
  }
}

/**
 * Calculate fund-linked life insurance development over time
 */
export function calculateFundLinkedLifeInsurance(
  config: FundLinkedLifeInsuranceConfig,
): FundLinkedLifeInsuranceSummary {
  const yearlyResults: FundLinkedLifeInsuranceYearResult[] = []
  let portfolioValue = config.initialInvestment
  let totalContributions = config.initialInvestment
  let totalCostsPaid = 0

  const totalPlannedContributions = config.monthlyContribution * 12 * (config.endYear - config.startYear)
  const totalUpfrontCosts = (totalPlannedContributions * config.upfrontCostPercent) / 100
  const upfrontCostYears = Math.min(5, config.endYear - config.startYear)
  const annualUpfrontCost = totalUpfrontCosts / upfrontCostYears

  for (let year = config.startYear; year <= config.endYear; year++) {
    const result = processInsuranceYear(
      config,
      year,
      portfolioValue,
      totalContributions,
      totalCostsPaid,
      annualUpfrontCost,
      upfrontCostYears,
    )

    yearlyResults.push(result.yearResult)
    portfolioValue = result.updatedPortfolioValue
    totalContributions = result.updatedTotalContributions
    totalCostsPaid = result.updatedTotalCostsPaid
  }

  const summary = calculateSummaryMetrics(config, yearlyResults, totalContributions, totalCostsPaid)

  return {
    config,
    yearlyResults,
    finalPortfolioValue: summary.finalPortfolioValue,
    totalContributions,
    totalCostsPaid,
    totalInvestmentGains: summary.totalInvestmentGains,
    taxBenefitsApplyAtMaturity: summary.taxBenefitsApplyAtMaturity,
    effectiveAnnualReturn: summary.effectiveAnnualReturn,
    costRatio: summary.costRatio,
  }
}

/**
 * Calculate tax on withdrawal from fund-linked life insurance
 */
export function calculateFundLinkedLifeInsuranceTax(
  portfolioValue: number,
  totalContributions: number,
  taxBenefitsApply: boolean,
  capitalGainsTaxRate: number,
): {
  investmentGains: number
  taxableGains: number
  taxAmount: number
  netWithdrawalAmount: number
} {
  const investmentGains = Math.max(0, portfolioValue - totalContributions)

  // If tax benefits apply (12+ years, age 62+), only 50% of gains are taxable
  const taxableGains = taxBenefitsApply ? investmentGains * 0.5 : investmentGains

  const taxAmount = taxableGains * (capitalGainsTaxRate / 100)
  const netWithdrawalAmount = portfolioValue - taxAmount

  return {
    investmentGains,
    taxableGains,
    taxAmount,
    netWithdrawalAmount,
  }
}

/**
 * Calculate direct ETF final value
 */
function calculateDirectETFFinalValue(
  initialInvestment: number,
  annualContribution: number,
  years: number,
  netReturn: number,
): number {
  let finalValue = initialInvestment * Math.pow(1 + netReturn, years)

  if (netReturn !== 0) {
    finalValue += annualContribution * ((Math.pow(1 + netReturn, years) - 1) / netReturn)
  } else {
    finalValue += annualContribution * years
  }

  return finalValue
}

/**
 * Calculate insurance values with tax
 */
function calculateInsuranceValues(
  insurance: FundLinkedLifeInsuranceSummary,
  capitalGainsTaxRate: number,
): { finalValue: number; taxAmount: number; netValue: number } {
  const finalValue = insurance.finalPortfolioValue
  const tax = calculateFundLinkedLifeInsuranceTax(
    finalValue,
    insurance.totalContributions,
    insurance.taxBenefitsApplyAtMaturity,
    capitalGainsTaxRate,
  )

  return {
    finalValue,
    taxAmount: tax.taxAmount,
    netValue: tax.netWithdrawalAmount,
  }
}

/**
 * Calculate direct ETF values with tax
 */
function calculateDirectETFValues(
  insurance: FundLinkedLifeInsuranceSummary,
  directETFReturn: number,
  directETFCosts: number,
  capitalGainsTaxRate: number,
): { finalValue: number; taxAmount: number; netValue: number } {
  const years = insurance.config.endYear - insurance.config.startYear
  const annualContribution = insurance.config.monthlyContribution * 12
  const netReturn = (directETFReturn - directETFCosts) / 100

  const finalValue = calculateDirectETFFinalValue(
    insurance.config.initialInvestment,
    annualContribution,
    years,
    netReturn,
  )

  const gains = finalValue - insurance.totalContributions
  const taxAmount = gains * (capitalGainsTaxRate / 100)
  const netValue = finalValue - taxAmount

  return { finalValue, taxAmount, netValue }
}

/**
 * Compare fund-linked life insurance with direct ETF investment
 */
export function compareFundLinkedInsuranceVsDirectETF(
  insurance: FundLinkedLifeInsuranceSummary,
  directETFReturn: number,
  directETFCosts: number,
  capitalGainsTaxRate: number,
): {
  insuranceFinalValue: number
  insuranceTaxAmount: number
  insuranceNetValue: number
  directETFFinalValue: number
  directETFTaxAmount: number
  directETFNetValue: number
  insuranceAdvantage: number
  insuranceAdvantagePercent: number
  breakEvenYear: number | null
} {
  const insuranceVals = calculateInsuranceValues(insurance, capitalGainsTaxRate)
  const etfVals = calculateDirectETFValues(insurance, directETFReturn, directETFCosts, capitalGainsTaxRate)

  const advantage = insuranceVals.netValue - etfVals.netValue
  const advantagePercent = etfVals.netValue > 0 ? (advantage / etfVals.netValue) * 100 : 0

  return {
    insuranceFinalValue: insuranceVals.finalValue,
    insuranceTaxAmount: insuranceVals.taxAmount,
    insuranceNetValue: insuranceVals.netValue,
    directETFFinalValue: etfVals.finalValue,
    directETFTaxAmount: etfVals.taxAmount,
    directETFNetValue: etfVals.netValue,
    insuranceAdvantage: advantage,
    insuranceAdvantagePercent: advantagePercent,
    breakEvenYear: null,
  }
}

/**
 * Create default fund-linked life insurance configuration
 */
export function createDefaultFundLinkedLifeInsuranceConfig(): FundLinkedLifeInsuranceConfig {
  const currentYear = new Date().getFullYear()
  const birthYear = currentYear - 40 // 40 years old

  return {
    name: 'Fondsgebundene Lebensversicherung',
    startYear: currentYear,
    endYear: currentYear + 25,
    monthlyContribution: 300,
    expectedReturnRate: 7, // 7% annual return (historical stock market average)
    initialInvestment: 0,
    upfrontCostPercent: 3, // Typical Abschlusskosten
    annualManagementCostPercent: 1, // Typical Verwaltungskosten
    guaranteeCostPercent: 0, // Pure fund product without guarantee
    birthYear,
    guaranteedMinimumAmount: 0,
    deathBenefitMultiplier: 1.1,
    includeDeathBenefitCosts: true,
    enabled: false,
  }
}
