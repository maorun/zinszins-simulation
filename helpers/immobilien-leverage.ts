/**
 * Immobilien-Leverage (Real Estate Leverage & Financing Optimization)
 *
 * This module provides calculations for optimal financing structures for real estate investments,
 * analyzing different leverage scenarios and their impact on returns and risks.
 *
 * Features:
 * - Comparison of different down payment scenarios (Eigenkapitalquoten)
 * - Leverage effect calculation (Hebeleffekt)
 * - Cash-on-cash return analysis
 * - German banking regulations (Beleihungsauslauf)
 * - Tax-optimized financing structures
 *
 * Legal Framework:
 * - § 7 EStG: AfA (Depreciation)
 * - § 9 EStG: Interest deductibility (Schuldzinsen als Werbungskosten)
 * - Banking regulations for maximum loan-to-value (LTV) ratios
 */

/**
 * Configuration for a leverage scenario
 */
export interface LeverageScenario {
  /** Name/identifier for this scenario */
  name: string
  /** Down payment as percentage of purchase price (10-100%) */
  downPaymentPercent: number
  /** Annual interest rate for the mortgage (%) */
  interestRate: number
  /** Mortgage term in years */
  termYears: number
  /** Optional: Annual principal repayment rate (Tilgung) in % (default: calculated from term) */
  repaymentRate?: number
}

/**
 * Configuration for the property being financed
 */
export interface PropertyFinancingConfig {
  /** Total purchase price including all costs in EUR */
  totalPurchasePrice: number
  /** Building value (for AfA calculation) in EUR */
  buildingValue: number
  /** Land value in EUR */
  landValue: number
  /** Annual rental income (gross) in EUR */
  annualRentalIncome: number
  /** Annual operating costs (excluding mortgage) as % of rental income (typically 20-30%) */
  operatingCostsRate: number
  /** Expected annual property appreciation rate (%) */
  appreciationRate: number
  /** Personal income tax rate for interest deductibility (%) */
  personalTaxRate: number
  /** Building year (for AfA calculation) */
  buildingYear: number
}

/**
 * Results for a single leverage scenario
 */
export interface LeverageScenarioResults {
  scenario: LeverageScenario
  /** Down payment amount in EUR */
  downPayment: number
  /** Loan amount in EUR */
  loanAmount: number
  /** Loan-to-value ratio (Beleihungsauslauf) as percentage */
  loanToValue: number
  /** Annual mortgage payment (principal + interest) in EUR */
  annualMortgagePayment: number
  /** Annual interest payment in EUR */
  annualInterest: number
  /** Annual principal repayment in EUR */
  annualPrincipal: number
  /** Total interest paid over the life of the loan in EUR */
  totalInterestCost: number
  /** Annual operating costs in EUR */
  annualOperatingCosts: number
  /** Annual AfA (depreciation) in EUR */
  annualAfa: number
  /** Annual taxable rental income (after deductions) in EUR */
  taxableRentalIncome: number
  /** Annual tax benefit from interest deduction in EUR */
  taxBenefitInterest: number
  /** Annual tax benefit from AfA in EUR */
  taxBenefitAfa: number
  /** Total annual tax benefit in EUR */
  totalTaxBenefit: number
  /** Annual net cash flow (after all costs and taxes) in EUR */
  annualNetCashFlow: number
  /** Cash-on-cash return (annual net cash flow / down payment) as % */
  cashOnCashReturn: number
  /** Return on equity without leverage (for comparison) as % */
  returnWithoutLeverage: number
  /** Leverage effect (difference between leveraged and unleveraged return) in percentage points */
  leverageEffect: number
  /** Risk indicators */
  riskIndicators: LeverageRiskIndicators
}

/**
 * Risk indicators for leverage scenarios
 */
export interface LeverageRiskIndicators {
  /** Beleihungsauslauf (Loan-to-value) as percentage (0-100%) */
  loanToValue: number
  /** Interest coverage ratio (rental income / annual interest) */
  interestCoverageRatio: number
  /** Debt service coverage ratio (operating income / total debt service) */
  debtServiceCoverageRatio: number
  /** Annual mortgage payment as % of gross rental income */
  mortgageToIncomeRatio: number
  /** Risk level assessment */
  riskLevel: 'niedrig' | 'mittel' | 'hoch' | 'sehr hoch'
  /** Warnings for this scenario */
  warnings: string[]
}

/**
 * Comparison results for multiple scenarios
 */
export interface LeverageComparisonResults {
  scenarios: LeverageScenarioResults[]
  /** Recommended scenario based on risk-adjusted returns */
  recommendedScenario: string
  /** Best scenario by cash-on-cash return */
  bestByReturn: string
  /** Best scenario by lowest risk */
  bestByRisk: string
  /** Summary statistics */
  summary: {
    minDownPayment: number
    maxDownPayment: number
    minCashOnCashReturn: number
    maxCashOnCashReturn: number
    avgLeverageEffect: number
  }
}

/**
 * Calculate monthly mortgage payment (Annuitätendarlehen)
 * German standard: Annuität (fixed total payment, changing principal/interest split)
 *
 * Formula: A = K × (p × (1 + p)^n) / ((1 + p)^n - 1)
 * where A = Annuität, K = Kreditsumme, p = Monatszins, n = Anzahl Raten
 */
export function calculateAnnuity(
  loanAmount: number,
  annualInterestRate: number,
  termYears: number,
): number {
  if (loanAmount <= 0 || termYears <= 0) {
    return 0
  }

  if (annualInterestRate === 0) {
    // No interest: simple division
    return loanAmount / (termYears * 12)
  }

  const monthlyRate = annualInterestRate / 100 / 12
  const numberOfPayments = termYears * 12

  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  return monthlyPayment
}

/**
 * Calculate total interest cost over the life of the loan
 */
export function calculateTotalInterestCost(
  loanAmount: number,
  annualInterestRate: number,
  termYears: number,
): number {
  const monthlyPayment = calculateAnnuity(loanAmount, annualInterestRate, termYears)
  const totalPayments = monthlyPayment * termYears * 12
  return totalPayments - loanAmount
}

/**
 * Calculate first year interest payment for annuity loan
 * In the first year, interest is highest as principal is highest
 */
export function calculateFirstYearInterest(
  loanAmount: number,
  annualInterestRate: number,
  termYears: number,
): number {
  if (loanAmount <= 0 || annualInterestRate === 0) {
    return 0
  }

  const monthlyPayment = calculateAnnuity(loanAmount, annualInterestRate, termYears)
  const monthlyRate = annualInterestRate / 100 / 12

  let remainingPrincipal = loanAmount
  let totalInterest = 0

  // Calculate interest for 12 months
  for (let month = 0; month < 12; month++) {
    const interestPayment = remainingPrincipal * monthlyRate
    totalInterest += interestPayment
    const principalPayment = monthlyPayment - interestPayment
    remainingPrincipal -= principalPayment
  }

  return totalInterest
}

/**
 * Calculate annual AfA (depreciation) based on building year
 */
export function calculateAfa(buildingValue: number, buildingYear: number): number {
  let afaRate: number

  if (buildingYear < 1925) {
    afaRate = 0.025 // 2.5%
  } else if (buildingYear >= 2023) {
    afaRate = 0.03 // 3%
  } else {
    afaRate = 0.02 // 2%
  }

  return buildingValue * afaRate
}

/**
 * Calculate return on equity without leverage (for comparison)
 */
export function calculateUnleveragedReturn(
  annualRentalIncome: number,
  operatingCostsRate: number,
  totalPurchasePrice: number,
  annualAfa: number,
  personalTaxRate: number,
): number {
  const operatingCosts = annualRentalIncome * (operatingCostsRate / 100)
  const netOperatingIncome = annualRentalIncome - operatingCosts

  // Tax benefit from AfA
  const taxBenefitAfa = annualAfa * (personalTaxRate / 100)

  // Net income after tax benefits
  const netIncome = netOperatingIncome + taxBenefitAfa

  // Return on total equity invested
  return (netIncome / totalPurchasePrice) * 100
}

/**
 * Check LTV-related warnings
 */
function checkLtvWarnings(loanToValue: number, warnings: string[]): void {
  if (loanToValue > 90) {
    warnings.push('Sehr hoher Beleihungsauslauf (>90%) - erhöhtes Finanzierungsrisiko')
  } else if (loanToValue > 80) {
    warnings.push('Hoher Beleihungsauslauf (>80%) - eventuell höhere Zinsen')
  }
}

/**
 * Check coverage ratio warnings
 */
function checkCoverageWarnings(
  interestCoverageRatio: number,
  debtServiceCoverageRatio: number,
  warnings: string[],
): void {
  if (interestCoverageRatio < 1.5) {
    warnings.push('Niedrige Zinsdeckung (<1,5) - geringe Sicherheitsmarge')
  }

  if (debtServiceCoverageRatio < 1.2) {
    warnings.push('Kritische Schuldendienstdeckung (<1,2) - hohes Ausfallrisiko')
  } else if (debtServiceCoverageRatio < 1.5) {
    warnings.push('Niedrige Schuldendienstdeckung (<1,5) - begrenzte finanzielle Flexibilität')
  }
}

/**
 * Determine risk level based on warnings and LTV
 */
function determineRiskLevel(warnings: string[], loanToValue: number): 'niedrig' | 'mittel' | 'hoch' | 'sehr hoch' {
  const hasMultipleWarnings = warnings.length > 2
  const hasCriticalLtv = loanToValue > 85
  const hasHighLtv = loanToValue > 70
  const hasLowLtv = loanToValue <= 60

  if (hasMultipleWarnings || hasCriticalLtv) {
    return 'sehr hoch'
  }
  if (warnings.length > 1 || hasHighLtv) {
    return 'hoch'
  }
  if (warnings.length === 1 || !hasLowLtv) {
    return 'mittel'
  }
  return 'niedrig'
}

/**
 * Assess risk level based on multiple indicators
 */
export function assessRiskLevel(indicators: Omit<LeverageRiskIndicators, 'riskLevel' | 'warnings'>): {
  riskLevel: 'niedrig' | 'mittel' | 'hoch' | 'sehr hoch'
  warnings: string[]
} {
  const warnings: string[] = []

  // Check all warning conditions
  checkLtvWarnings(indicators.loanToValue, warnings)
  checkCoverageWarnings(indicators.interestCoverageRatio, indicators.debtServiceCoverageRatio, warnings)

  // Mortgage to income ratio
  if (indicators.mortgageToIncomeRatio > 80) {
    warnings.push('Sehr hohe Belastungsquote (>80%) - wenig Spielraum für Mietausfälle')
  }

  const riskLevel = determineRiskLevel(warnings, indicators.loanToValue)

  return { riskLevel, warnings }
}

/**
 * Calculate leverage scenario results
 */
export function calculateLeverageScenario(
  scenario: LeverageScenario,
  config: PropertyFinancingConfig,
): LeverageScenarioResults {
  // Calculate loan parameters
  const downPayment = config.totalPurchasePrice * (scenario.downPaymentPercent / 100)
  const loanAmount = config.totalPurchasePrice - downPayment
  const loanToValue = (loanAmount / config.totalPurchasePrice) * 100

  // Calculate mortgage payments
  const monthlyPayment = calculateAnnuity(loanAmount, scenario.interestRate, scenario.termYears)
  const annualMortgagePayment = monthlyPayment * 12

  // Calculate first year interest and principal
  const annualInterest = calculateFirstYearInterest(loanAmount, scenario.interestRate, scenario.termYears)
  const annualPrincipal = annualMortgagePayment - annualInterest

  // Total interest over loan life
  const totalInterestCost = calculateTotalInterestCost(loanAmount, scenario.interestRate, scenario.termYears)

  // Calculate operating costs and tax-related values
  const calculationResults = calculateTaxAndCashFlow(
    config,
    annualInterest,
    annualMortgagePayment,
  )

  // Calculate returns
  const returnMetrics = calculateReturnMetrics(
    calculationResults.annualNetCashFlow,
    downPayment,
    config,
    calculationResults.annualAfa,
  )

  // Calculate risk indicators
  const riskMetrics = calculateRiskMetrics(
    config,
    loanToValue,
    annualInterest,
    annualMortgagePayment,
    calculationResults.annualOperatingCosts,
  )

  return {
    scenario,
    downPayment,
    loanAmount,
    loanToValue,
    annualMortgagePayment,
    annualInterest,
    annualPrincipal,
    totalInterestCost,
    ...calculationResults,
    ...returnMetrics,
    riskIndicators: riskMetrics,
  }
}

/**
 * Helper function to calculate tax benefits and cash flow
 */
function calculateTaxAndCashFlow(
  config: PropertyFinancingConfig,
  annualInterest: number,
  annualMortgagePayment: number,
) {
  const annualOperatingCosts = config.annualRentalIncome * (config.operatingCostsRate / 100)
  const annualAfa = calculateAfa(config.buildingValue, config.buildingYear)

  // Tax benefits
  const taxBenefitInterest = annualInterest * (config.personalTaxRate / 100)
  const taxBenefitAfa = annualAfa * (config.personalTaxRate / 100)
  const totalTaxBenefit = taxBenefitInterest + taxBenefitAfa

  // Taxable rental income
  const taxableRentalIncome = config.annualRentalIncome - annualOperatingCosts - annualInterest - annualAfa

  // Net cash flow (first year approximation)
  const annualNetCashFlow = config.annualRentalIncome - annualOperatingCosts - annualMortgagePayment + totalTaxBenefit

  return {
    annualOperatingCosts,
    annualAfa,
    taxableRentalIncome,
    taxBenefitInterest,
    taxBenefitAfa,
    totalTaxBenefit,
    annualNetCashFlow,
  }
}

/**
 * Helper function to calculate return metrics
 */
function calculateReturnMetrics(
  annualNetCashFlow: number,
  downPayment: number,
  config: PropertyFinancingConfig,
  annualAfa: number,
) {
  const cashOnCashReturn = downPayment > 0 ? (annualNetCashFlow / downPayment) * 100 : 0
  const returnWithoutLeverage = calculateUnleveragedReturn(
    config.annualRentalIncome,
    config.operatingCostsRate,
    config.totalPurchasePrice,
    annualAfa,
    config.personalTaxRate,
  )
  const leverageEffect = cashOnCashReturn - returnWithoutLeverage

  return {
    cashOnCashReturn,
    returnWithoutLeverage,
    leverageEffect,
  }
}

/**
 * Helper function to calculate risk metrics
 */
function calculateRiskMetrics(
  config: PropertyFinancingConfig,
  loanToValue: number,
  annualInterest: number,
  annualMortgagePayment: number,
  annualOperatingCosts: number,
) {
  const interestCoverageRatio = annualInterest > 0 ? config.annualRentalIncome / annualInterest : Infinity
  const netOperatingIncome = config.annualRentalIncome - annualOperatingCosts
  const debtServiceCoverageRatio = annualMortgagePayment > 0 ? netOperatingIncome / annualMortgagePayment : Infinity
  const mortgageToIncomeRatio = (annualMortgagePayment / config.annualRentalIncome) * 100

  const riskAssessment = assessRiskLevel({
    loanToValue,
    interestCoverageRatio,
    debtServiceCoverageRatio,
    mortgageToIncomeRatio,
  })

  return {
    loanToValue,
    interestCoverageRatio,
    debtServiceCoverageRatio,
    mortgageToIncomeRatio,
    ...riskAssessment,
  }
}

/**
 * Compare multiple leverage scenarios
 */
export function compareLeverageScenarios(
  scenarios: LeverageScenario[],
  config: PropertyFinancingConfig,
): LeverageComparisonResults {
  const results = scenarios.map(scenario => calculateLeverageScenario(scenario, config))

  // Find best scenarios by different criteria
  const bestByReturn = results.reduce((best, current) =>
    current.cashOnCashReturn > best.cashOnCashReturn ? current : best,
  ).scenario.name

  const riskLevelOrder: Record<string, number> = {
    niedrig: 1,
    mittel: 2,
    hoch: 3,
    'sehr hoch': 4,
  }

  const bestByRisk = results.reduce((best, current) =>
    riskLevelOrder[current.riskIndicators.riskLevel] < riskLevelOrder[best.riskIndicators.riskLevel] ? current : best,
  ).scenario.name

  // Recommended: balance of good return and acceptable risk
  const recommendedScenario = results.reduce((recommended, current) => {
    const recommendedRiskLevel = riskLevelOrder[recommended.riskIndicators.riskLevel]
    const currentRiskLevel = riskLevelOrder[current.riskIndicators.riskLevel]

    // Prefer lower risk if risk difference is significant
    if (currentRiskLevel < recommendedRiskLevel && recommendedRiskLevel >= 3) {
      return current
    }

    // If same risk level, prefer higher return
    if (currentRiskLevel === recommendedRiskLevel && current.cashOnCashReturn > recommended.cashOnCashReturn) {
      return current
    }

    // If current has acceptable risk and significantly better return
    if (currentRiskLevel <= 2 && current.cashOnCashReturn > recommended.cashOnCashReturn * 1.2) {
      return current
    }

    return recommended
  }).scenario.name

  // Summary statistics
  const summary = {
    minDownPayment: Math.min(...results.map(r => r.downPayment)),
    maxDownPayment: Math.max(...results.map(r => r.downPayment)),
    minCashOnCashReturn: Math.min(...results.map(r => r.cashOnCashReturn)),
    maxCashOnCashReturn: Math.max(...results.map(r => r.cashOnCashReturn)),
    avgLeverageEffect: results.reduce((sum, r) => sum + r.leverageEffect, 0) / results.length,
  }

  return {
    scenarios: results,
    recommendedScenario,
    bestByReturn,
    bestByRisk,
    summary,
  }
}

/**
 * Create standard leverage scenarios for comparison
 */
export function createStandardLeverageScenarios(baseInterestRate = 3.5): LeverageScenario[] {
  return [
    {
      name: 'Konservativ (40% Eigenkapital)',
      downPaymentPercent: 40,
      interestRate: baseInterestRate - 0.3, // Lower rate due to lower LTV
      termYears: 25,
    },
    {
      name: 'Ausgewogen (30% Eigenkapital)',
      downPaymentPercent: 30,
      interestRate: baseInterestRate,
      termYears: 30,
    },
    {
      name: 'Moderat gehebelt (20% Eigenkapital)',
      downPaymentPercent: 20,
      interestRate: baseInterestRate + 0.2, // Slightly higher rate
      termYears: 30,
    },
    {
      name: 'Stark gehebelt (10% Eigenkapital)',
      downPaymentPercent: 10,
      interestRate: baseInterestRate + 0.5, // Higher rate due to higher LTV
      termYears: 30,
    },
  ]
}

/**
 * Create default property financing configuration
 */
export function createDefaultPropertyFinancingConfig(): PropertyFinancingConfig {
  const totalPurchasePrice = 400000
  const buildingValue = 300000 // ~75% is building
  const landValue = 100000 // ~25% is land

  return {
    totalPurchasePrice,
    buildingValue,
    landValue,
    annualRentalIncome: 24000, // 6% gross yield
    operatingCostsRate: 25, // 25% of rental income
    appreciationRate: 2.0, // 2% annual appreciation
    personalTaxRate: 35, // 35% marginal tax rate
    buildingYear: 2020,
  }
}
