/**
 * Types and utilities for Eigenheim vs. Miete (Own Home vs. Rent) comparison
 * This helps users make informed decisions about home ownership vs. renting over their lifetime
 */

/**
 * Configuration for homeownership scenario
 */
export interface HomeOwnershipConfig {
  /** Purchase price of the home in EUR */
  purchasePrice: number

  /** Down payment in EUR (Eigenkapital) */
  downPayment: number

  /** Annual mortgage interest rate (%) */
  mortgageInterestRate: number

  /** Mortgage term in years */
  mortgageTerm: number

  /** Annual property tax (Grundsteuer) in EUR */
  annualPropertyTax: number

  /** Annual maintenance costs as % of property value (typically 1-2%) */
  maintenanceRate: number

  /** Annual property appreciation rate (%) */
  propertyAppreciationRate: number

  /** One-time purchase costs (Notary, Real Estate Transfer Tax, etc.) as % of purchase price */
  purchaseCostsRate: number

  /** Expected selling costs when selling the home as % of sale price */
  sellingCostsRate: number

  /** Home insurance annual cost in EUR */
  homeInsurance: number

  /** HOA/community fees monthly cost in EUR (Hausgeld) */
  monthlyHOAFees: number
}

/**
 * Configuration for rental scenario
 */
export interface RentalConfig {
  /** Monthly rent in EUR (cold rent) */
  monthlyRent: number

  /** Additional monthly costs (Nebenkosten) in EUR */
  monthlyUtilities: number

  /** Annual rent increase rate (%) - typically 2-3% */
  annualRentIncrease: number

  /** One-time moving costs in EUR */
  movingCosts: number

  /** Rental deposit (typically 3 months rent) in EUR */
  rentalDeposit: number
}

/**
 * General comparison parameters
 */
export interface ComparisonConfig {
  /** Start year for the comparison */
  startYear: number

  /** Number of years to compare */
  comparisonYears: number

  /** Expected investment return rate for renter's savings (%) */
  investmentReturnRate: number

  /** Inflation rate for general costs (%) */
  inflationRate: number

  /** Whether the analysis is enabled */
  enabled: boolean
}

/**
 * Complete configuration for Eigenheim vs. Miete comparison
 */
export interface EigenheimVsMieteConfig {
  ownership: HomeOwnershipConfig
  rental: RentalConfig
  comparison: ComparisonConfig
}

/**
 * Annual costs breakdown for homeownership
 */
export interface OwnershipYearlyCosts {
  year: number
  mortgagePayment: number
  propertyTax: number
  maintenance: number
  homeInsurance: number
  hoaFees: number
  totalAnnualCost: number
  remainingMortgage: number
  homeValue: number
  homeEquity: number
  cumulativeCosts: number
}

/**
 * Annual costs breakdown for renting
 */
export interface RentalYearlyCosts {
  year: number
  rent: number
  utilities: number
  totalAnnualCost: number
  cumulativeCosts: number
  investedSavings: number
  investmentValue: number
}

/**
 * Comparison results for a specific year
 */
export interface YearlyComparison {
  year: number
  ownershipNetWorth: number
  rentalNetWorth: number
  difference: number
  ownershipCumulativeCosts: number
  rentalCumulativeCosts: number
}

/**
 * Complete comparison results
 */
export interface ComparisonResults {
  ownership: OwnershipYearlyCosts[]
  rental: RentalYearlyCosts[]
  comparison: YearlyComparison[]
  summary: ComparisonSummary
}

/**
 * Summary of the comparison
 */
export interface ComparisonSummary {
  /** Total costs for ownership over the period */
  totalOwnershipCosts: number

  /** Total costs for renting over the period */
  totalRentalCosts: number

  /** Final home equity for owner */
  finalHomeEquity: number

  /** Final investment value for renter */
  finalRentalInvestments: number

  /** Net worth advantage (ownership - rental) */
  netWorthDifference: number

  /** Break-even year (when ownership becomes more profitable, if applicable) */
  breakEvenYear: number | null

  /** Monthly cost difference in first year */
  firstYearMonthlyCostDifference: number

  /** Recommended scenario based on net worth */
  recommendation: 'ownership' | 'rental' | 'similar'
}

/**
 * Calculate monthly mortgage payment using amortization formula
 */
export function calculateMonthlyMortgagePayment(
  principal: number,
  annualInterestRate: number,
  termYears: number,
): number {
  if (principal <= 0 || termYears <= 0) {
    return 0
  }

  if (annualInterestRate === 0) {
    return principal / (termYears * 12)
  }

  const monthlyRate = annualInterestRate / 100 / 12
  const numPayments = termYears * 12

  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)

  return monthlyPayment
}

/**
 * Calculate remaining mortgage balance after a certain number of payments
 */
export function calculateRemainingMortgage(
  principal: number,
  annualInterestRate: number,
  termYears: number,
  paymentsMade: number,
): number {
  if (principal <= 0 || termYears <= 0 || paymentsMade <= 0) {
    return principal
  }

  if (paymentsMade >= termYears * 12) {
    return 0
  }

  if (annualInterestRate === 0) {
    const monthlyPayment = principal / (termYears * 12)
    return Math.max(0, principal - monthlyPayment * paymentsMade)
  }

  const monthlyRate = annualInterestRate / 100 / 12
  const monthlyPayment = calculateMonthlyMortgagePayment(principal, annualInterestRate, termYears)

  const remainingBalance =
    principal * Math.pow(1 + monthlyRate, paymentsMade) - monthlyPayment * ((Math.pow(1 + monthlyRate, paymentsMade) - 1) / monthlyRate)

  return Math.max(0, remainingBalance)
}

/**
 * Create default homeownership configuration
 */
export function createDefaultHomeOwnershipConfig(): HomeOwnershipConfig {
  return {
    purchasePrice: 400000,
    downPayment: 80000,
    mortgageInterestRate: 3.5,
    mortgageTerm: 30,
    annualPropertyTax: 800,
    maintenanceRate: 1.5,
    propertyAppreciationRate: 2.0,
    purchaseCostsRate: 10,
    sellingCostsRate: 5,
    homeInsurance: 800,
    monthlyHOAFees: 200,
  }
}

/**
 * Create default rental configuration
 */
export function createDefaultRentalConfig(): RentalConfig {
  return {
    monthlyRent: 1500,
    monthlyUtilities: 200,
    annualRentIncrease: 2.5,
    movingCosts: 2000,
    rentalDeposit: 4500,
  }
}

/**
 * Create default comparison configuration
 */
export function createDefaultComparisonConfig(startYear: number): ComparisonConfig {
    return {
    startYear,
    comparisonYears: 30,
    investmentReturnRate: 5.0,
    inflationRate: 2.0,
    enabled: true,
  }
}

/**
 * Create default complete configuration
 */
export function createDefaultEigenheimVsMieteConfig(startYear: number): EigenheimVsMieteConfig {
  return {
    ownership: createDefaultHomeOwnershipConfig(),
    rental: createDefaultRentalConfig(),
    comparison: createDefaultComparisonConfig(startYear),
  }
}

/**
 * Calculate homeownership costs year by year
 */
export function calculateOwnershipCosts(config: HomeOwnershipConfig, comparisonYears: number, inflationRate: number): OwnershipYearlyCosts[] {
  const results: OwnershipYearlyCosts[] = []

  const loanAmount = config.purchasePrice - config.downPayment
  const monthlyMortgage = calculateMonthlyMortgagePayment(loanAmount, config.mortgageInterestRate, config.mortgageTerm)
  const annualMortgage = monthlyMortgage * 12

  // One-time purchase costs
  const purchaseCosts = config.purchasePrice * (config.purchaseCostsRate / 100)

  let cumulativeCosts = config.downPayment + purchaseCosts
  let homeValue = config.purchasePrice

  for (let year = 0; year < comparisonYears; year++) {
    const paymentsMade = year * 12
    const remainingMortgage = calculateRemainingMortgage(loanAmount, config.mortgageInterestRate, config.mortgageTerm, paymentsMade)

    // Apply inflation to recurring costs
    const inflationMultiplier = Math.pow(1 + inflationRate / 100, year)

    const propertyTax = config.annualPropertyTax * inflationMultiplier
    const maintenance = homeValue * (config.maintenanceRate / 100)
    const homeInsurance = config.homeInsurance * inflationMultiplier
    const hoaFees = config.monthlyHOAFees * 12 * inflationMultiplier

    // Mortgage payment stays constant
    const totalAnnualCost = annualMortgage + propertyTax + maintenance + homeInsurance + hoaFees

    cumulativeCosts += totalAnnualCost

    // Home value appreciation
    homeValue *= 1 + config.propertyAppreciationRate / 100

    const homeEquity = homeValue - remainingMortgage

    results.push({
      year: year + 1,
      mortgagePayment: annualMortgage,
      propertyTax,
      maintenance,
      homeInsurance,
      hoaFees,
      totalAnnualCost,
      remainingMortgage,
      homeValue,
      homeEquity,
      cumulativeCosts,
    })
  }

  return results
}

/**
 * Calculate rental costs year by year
 */
export function calculateRentalCosts(
  config: RentalConfig,
  downPaymentSavings: number,
  purchaseCostsSavings: number,
  comparisonYears: number,
  investmentReturnRate: number,
): RentalYearlyCosts[] {
  const results: RentalYearlyCosts[] = []

  let monthlyRent = config.monthlyRent
  let monthlyUtilities = config.monthlyUtilities

  // Initial investment: down payment that wasn't used + purchase costs saved + deposit
  const investedSavings = downPaymentSavings + purchaseCostsSavings + config.rentalDeposit
  let investmentValue = investedSavings
  let cumulativeCosts = config.movingCosts

  for (let year = 0; year < comparisonYears; year++) {
    const annualRent = monthlyRent * 12
    const annualUtilities = monthlyUtilities * 12
    const totalAnnualCost = annualRent + annualUtilities

    cumulativeCosts += totalAnnualCost

    // Investment grows with return rate
    investmentValue *= 1 + investmentReturnRate / 100

    // Additional savings each year (difference in costs can be invested)
    // This will be calculated in the comparison function

    results.push({
      year: year + 1,
      rent: annualRent,
      utilities: annualUtilities,
      totalAnnualCost,
      cumulativeCosts,
      investedSavings,
      investmentValue,
    })

    // Apply annual rent increase
    monthlyRent *= 1 + config.annualRentIncrease / 100
    monthlyUtilities *= 1 + config.annualRentIncrease / 100
  }

  return results
}

/**
 * Adjust rental investment values based on cost differences with ownership
 */
function adjustRentalInvestments(
  rentalCosts: RentalYearlyCosts[],
  ownershipCosts: OwnershipYearlyCosts[],
  investmentReturnRate: number,
): RentalYearlyCosts[] {
  return rentalCosts.map((rentalYear, index) => {
    const ownershipYear = ownershipCosts[index]

    // If renter pays less, they can invest the difference
    const costDifference = ownershipYear.totalAnnualCost - rentalYear.totalAnnualCost

    // Start with the investment value from basic calculation
    let adjustedInvestmentValue = rentalYear.investmentValue

    if (index > 0) {
      const previousRental = rentalCosts[index - 1]
      const previousOwnership = ownershipCosts[index - 1]
      const previousDifference = previousOwnership.totalAnnualCost - previousRental.totalAnnualCost

      // Grow previous investment and add this year's savings
      adjustedInvestmentValue = previousRental.investmentValue * (1 + investmentReturnRate / 100) + Math.max(0, previousDifference)
    }

    return {
      ...rentalYear,
      investmentValue: adjustedInvestmentValue,
      investedSavings: rentalYear.investedSavings + (costDifference > 0 ? costDifference : 0),
    }
  })
}

/**
 * Calculate comparison summary from yearly data
 */
function calculateComparisonSummary(
  ownershipCosts: OwnershipYearlyCosts[],
  rentalCosts: RentalYearlyCosts[],
  comparisonData: YearlyComparison[],
  rentalDeposit: number,
): ComparisonSummary {
  const lastYear = comparisonData[comparisonData.length - 1]

  // Find break-even year (when ownership becomes more profitable)
  let breakEvenYear: number | null = null
  for (let i = 0; i < comparisonData.length; i++) {
    if (comparisonData[i].ownershipNetWorth > comparisonData[i].rentalNetWorth) {
      breakEvenYear = comparisonData[i].year
      break
    }
  }

  const finalOwnership = ownershipCosts[ownershipCosts.length - 1]
  const finalRental = rentalCosts[rentalCosts.length - 1]

  const firstYearOwnership = ownershipCosts[0]
  const firstYearRental = rentalCosts[0]

  return {
    totalOwnershipCosts: finalOwnership.cumulativeCosts,
    totalRentalCosts: finalRental.cumulativeCosts,
    finalHomeEquity: finalOwnership.homeEquity,
    finalRentalInvestments: finalRental.investmentValue + rentalDeposit,
    netWorthDifference: lastYear.difference,
    breakEvenYear,
    firstYearMonthlyCostDifference: (firstYearOwnership.totalAnnualCost - firstYearRental.totalAnnualCost) / 12,
    recommendation: Math.abs(lastYear.difference) < 10000 ? 'similar' : lastYear.difference > 0 ? 'ownership' : 'rental',
  }
}

/**
 * Perform complete Eigenheim vs. Miete comparison
 */
export function compareEigenheimVsMiete(config: EigenheimVsMieteConfig): ComparisonResults {
  const { ownership, rental, comparison } = config

  // Calculate ownership costs
  const ownershipCosts = calculateOwnershipCosts(ownership, comparison.comparisonYears, comparison.inflationRate)

  // Calculate initial savings for renter (down payment + purchase costs)
  const downPaymentSavings = ownership.downPayment
  const purchaseCostsSavings = ownership.purchasePrice * (ownership.purchaseCostsRate / 100)

  // Calculate rental costs
  const rentalCosts = calculateRentalCosts(rental, downPaymentSavings, purchaseCostsSavings, comparison.comparisonYears, comparison.investmentReturnRate)

  // Adjust rental investment value based on cost differences
  const adjustedRentalCosts = adjustRentalInvestments(rentalCosts, ownershipCosts, comparison.investmentReturnRate)

  // Create comparison array
  const comparisonData: YearlyComparison[] = ownershipCosts.map((ownershipYear, index) => {
    const rentalYear = adjustedRentalCosts[index]

    // Owner's net worth = home equity
    const ownershipNetWorth = ownershipYear.homeEquity

    // Renter's net worth = investment value + deposit
    const rentalNetWorth = rentalYear.investmentValue + rental.rentalDeposit

    return {
      year: ownershipYear.year,
      ownershipNetWorth,
      rentalNetWorth,
      difference: ownershipNetWorth - rentalNetWorth,
      ownershipCumulativeCosts: ownershipYear.cumulativeCosts,
      rentalCumulativeCosts: rentalYear.cumulativeCosts,
    }
  })

  // Calculate summary
  const summary = calculateComparisonSummary(ownershipCosts, adjustedRentalCosts, comparisonData, rental.rentalDeposit)

  return {
    ownership: ownershipCosts,
    rental: adjustedRentalCosts,
    comparison: comparisonData,
    summary,
  }
}
