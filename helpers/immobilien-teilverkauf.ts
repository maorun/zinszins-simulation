/**
 * Types and utilities for Immobilien-Teilverkauf (Real Estate Partial Sale)
 * This helps users analyze partial sale of their property while maintaining lifelong residence rights (Nießbrauchsrecht)
 */

/**
 * Configuration for real estate partial sale
 */
export interface TeilverkaufConfig {
  /** Current market value of the property in EUR */
  propertyValue: number

  /** Percentage of property to sell (typically 20-50%) */
  salePercentage: number

  /** Age at which partial sale occurs */
  saleAge: number

  /** Annual Nießbrauch fee as percentage of sold portion value */
  niessbrauchFeeRate: number

  /** One-time transaction costs as % of sale value (Notary, taxes, etc.) */
  transactionCostsRate: number

  /** Annual property appreciation rate (%) */
  appreciationRate: number

  /** Whether the partial sale is enabled */
  enabled: boolean
}

/**
 * Configuration for comparison scenarios
 */
export interface TeilverkaufComparisonConfig {
  /** Alternative monthly rent if full sale + rent scenario */
  alternativeMonthlyRent: number

  /** Annual rent increase rate (%) */
  rentIncreaseRate: number

  /** Investment return rate for proceeds from full sale (%) */
  investmentReturnRate: number

  /** Leibrente monthly payment alternative */
  leibrenteMonthlyPayment: number
}

/**
 * Complete configuration for Teilverkauf analysis
 */
export interface ImmobilienTeilverkaufConfig {
  teilverkauf: TeilverkaufConfig
  comparison: TeilverkaufComparisonConfig
}

/**
 * Result for a single year of partial sale
 */
export interface TeilverkaufYearResult {
  year: number
  age: number
  propertyValue: number
  soldPortionValue: number
  ownedPortionValue: number
  annualNiessbrauchFee: number
  cumulativeLiquidity: number
  cumulativeCosts: number
  netBenefit: number
}

/**
 * Complete result of Teilverkauf analysis
 */
export interface TeilverkaufResult {
  initialLiquidity: number
  transactionCosts: number
  soldPortionValue: number
  ownedPortionValue: number
  yearlyResults: TeilverkaufYearResult[]
  totalNiessbrauchPaid: number
  finalOwnedPortionValue: number
}

/**
 * Comparison result between Teilverkauf and alternative strategies
 */
export interface TeilverkaufComparisonResult {
  teilverkauf: {
    initialLiquidity: number
    totalCosts: number
    finalWealth: number
  }
  fullSaleRent: {
    initialLiquidity: number
    totalRentPaid: number
    finalWealth: number
  }
  leibrente: {
    initialLiquidity: number
    totalPaymentsReceived: number
    finalWealth: number
  }
}

/**
 * Create default Teilverkauf configuration
 */
export function createDefaultTeilverkaufConfig(): TeilverkaufConfig {
  return {
    propertyValue: 500000,
    salePercentage: 30,
    saleAge: 67,
    niessbrauchFeeRate: 4.5,
    transactionCostsRate: 5.0,
    appreciationRate: 2.0,
    enabled: false,
  }
}

/**
 * Create default comparison configuration
 */
export function createDefaultComparisonConfig(): TeilverkaufComparisonConfig {
  return {
    alternativeMonthlyRent: 1500,
    rentIncreaseRate: 2.5,
    investmentReturnRate: 5.0,
    leibrenteMonthlyPayment: 800,
  }
}

/**
 * Create complete default configuration
 */
export function createDefaultImmobilienTeilverkaufConfig(): ImmobilienTeilverkaufConfig {
  return {
    teilverkauf: createDefaultTeilverkaufConfig(),
    comparison: createDefaultComparisonConfig(),
  }
}

/**
 * Calculate the initial liquidity from partial sale
 */
export function calculateInitialLiquidity(
  propertyValue: number,
  salePercentage: number,
  transactionCostsRate: number,
): { liquidity: number; transactionCosts: number; soldValue: number } {
  const soldValue = propertyValue * (salePercentage / 100)
  const transactionCosts = soldValue * (transactionCostsRate / 100)
  const liquidity = soldValue - transactionCosts

  return {
    liquidity,
    transactionCosts,
    soldValue,
  }
}

/**
 * Calculate annual Nießbrauch fee
 */
export function calculateAnnualNiessbrauchFee(soldPortionValue: number, niessbrauchFeeRate: number): number {
  return soldPortionValue * (niessbrauchFeeRate / 100)
}

/**
 * Calculate property value after appreciation
 */
export function calculateAppreciatedValue(currentValue: number, appreciationRate: number, years: number): number {
  return currentValue * Math.pow(1 + appreciationRate / 100, years)
}

/**
 * Calculate yearly result for Teilverkauf
 */
function calculateTeilverkaufYearResult(
  age: number,
  startAge: number,
  config: TeilverkaufConfig,
  ownedPercentage: number,
  liquidity: number,
  cumulativeCosts: number,
): TeilverkaufYearResult {
  const year = age - startAge

  // Property appreciates each year
  const currentPropertyValue = calculateAppreciatedValue(config.propertyValue, config.appreciationRate, year)
  const currentSoldPortionValue = currentPropertyValue * (config.salePercentage / 100)
  const currentOwnedPortionValue = currentPropertyValue * (ownedPercentage / 100)

  // Nießbrauch fee is only paid after the sale occurs
  const annualNiessbrauchFee =
    age >= config.saleAge ? calculateAnnualNiessbrauchFee(currentSoldPortionValue, config.niessbrauchFeeRate) : 0

  // Cumulative liquidity is the initial liquidity (not invested, just available)
  const cumulativeLiquidity = age >= config.saleAge ? liquidity : 0

  const netBenefit = cumulativeLiquidity - cumulativeCosts

  return {
    year: startAge + year,
    age,
    propertyValue: currentPropertyValue,
    soldPortionValue: currentSoldPortionValue,
    ownedPortionValue: currentOwnedPortionValue,
    annualNiessbrauchFee,
    cumulativeLiquidity,
    cumulativeCosts,
    netBenefit,
  }
}

/**
 * Calculate Teilverkauf scenario for a given time period
 */
export function calculateTeilverkauf(
  config: TeilverkaufConfig,
  startAge: number,
  endAge: number,
): TeilverkaufResult {
  const { liquidity, transactionCosts, soldValue } = calculateInitialLiquidity(
    config.propertyValue,
    config.salePercentage,
    config.transactionCostsRate,
  )

  const ownedPercentage = 100 - config.salePercentage
  const initialOwnedValue = config.propertyValue * (ownedPercentage / 100)

  const yearlyResults: TeilverkaufYearResult[] = []
  let cumulativeCosts = transactionCosts
  let totalNiessbrauchPaid = 0

  for (let age = startAge; age <= endAge; age++) {
    const yearResult = calculateTeilverkaufYearResult(age, startAge, config, ownedPercentage, liquidity, cumulativeCosts)

    if (age >= config.saleAge) {
      cumulativeCosts += yearResult.annualNiessbrauchFee
      totalNiessbrauchPaid += yearResult.annualNiessbrauchFee
    }

    yearlyResults.push({ ...yearResult, cumulativeCosts })
  }

  const finalOwnedPortionValue = yearlyResults[yearlyResults.length - 1]?.ownedPortionValue || initialOwnedValue

  return {
    initialLiquidity: liquidity,
    transactionCosts,
    soldPortionValue: soldValue,
    ownedPortionValue: initialOwnedValue,
    yearlyResults,
    totalNiessbrauchPaid,
    finalOwnedPortionValue,
  }
}

/**
 * Calculate full sale + rent scenario
 */
export function calculateFullSaleRent(
  propertyValue: number,
  monthlyRent: number,
  rentIncreaseRate: number,
  investmentReturnRate: number,
  transactionCostsRate: number,
  startAge: number,
  endAge: number,
): { initialLiquidity: number; totalRentPaid: number; finalWealth: number } {
  // Full sale proceeds
  const transactionCosts = propertyValue * (transactionCostsRate / 100)
  const initialLiquidity = propertyValue - transactionCosts

  let totalRentPaid = 0
  let currentRent = monthlyRent
  let investedWealth = initialLiquidity

  for (let age = startAge; age <= endAge; age++) {
    // Pay annual rent
    const annualRent = currentRent * 12
    totalRentPaid += annualRent

    // Deduct rent from invested wealth and grow the rest
    investedWealth = (investedWealth - annualRent) * (1 + investmentReturnRate / 100)

    // Rent increases annually
    currentRent *= 1 + rentIncreaseRate / 100
  }

  return {
    initialLiquidity,
    totalRentPaid,
    finalWealth: Math.max(0, investedWealth),
  }
}

/**
 * Calculate Leibrente scenario
 */
export function calculateLeibrente(
  monthlyPayment: number,
  startAge: number,
  endAge: number,
): { totalPaymentsReceived: number; initialLiquidity: number; finalWealth: number } {
  const years = endAge - startAge + 1
  const totalPaymentsReceived = monthlyPayment * 12 * years

  return {
    initialLiquidity: 0, // No upfront payment in Leibrente
    totalPaymentsReceived,
    finalWealth: totalPaymentsReceived, // Simplified: assumes payments are used but counted as wealth
  }
}

/**
 * Compare Teilverkauf with alternative strategies
 */
export function compareTeilverkaufStrategies(
  teilverkaufConfig: TeilverkaufConfig,
  comparisonConfig: TeilverkaufComparisonConfig,
  startAge: number,
  endAge: number,
): TeilverkaufComparisonResult {
  // Calculate Teilverkauf scenario
  const teilverkaufResult = calculateTeilverkauf(teilverkaufConfig, startAge, endAge)

  // Calculate full sale + rent scenario
  const fullSaleRent = calculateFullSaleRent(
    teilverkaufConfig.propertyValue,
    comparisonConfig.alternativeMonthlyRent,
    comparisonConfig.rentIncreaseRate,
    comparisonConfig.investmentReturnRate,
    teilverkaufConfig.transactionCostsRate,
    startAge,
    endAge,
  )

  // Calculate Leibrente scenario
  const leibrente = calculateLeibrente(comparisonConfig.leibrenteMonthlyPayment, startAge, endAge)

  return {
    teilverkauf: {
      initialLiquidity: teilverkaufResult.initialLiquidity,
      totalCosts: teilverkaufResult.totalNiessbrauchPaid + teilverkaufResult.transactionCosts,
      finalWealth: teilverkaufResult.initialLiquidity + teilverkaufResult.finalOwnedPortionValue,
    },
    fullSaleRent: {
      initialLiquidity: fullSaleRent.initialLiquidity,
      totalRentPaid: fullSaleRent.totalRentPaid,
      finalWealth: fullSaleRent.finalWealth,
    },
    leibrente: {
      initialLiquidity: leibrente.initialLiquidity,
      totalPaymentsReceived: leibrente.totalPaymentsReceived,
      finalWealth: leibrente.finalWealth,
    },
  }
}
