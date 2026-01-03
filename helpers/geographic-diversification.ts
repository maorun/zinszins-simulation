/**
 * Geographic Diversification for Multi-Asset Portfolios
 *
 * This module implements regional allocation within international stock holdings
 * with automatic withholding tax calculations based on geographic distribution.
 *
 * Key Features:
 * - Regional breakdown of international equity holdings
 * - Automatic Quellensteuer (withholding tax) calculations per region
 * - Integration with existing Multi-Asset Portfolio system
 * - German tax law compliance (§ 32d EStG - Anrechnung ausländischer Steuern)
 */

import {
  COMMON_WITHHOLDING_TAX_RATES,
  type CountryWithholdingTaxRate,
} from './quellensteuer'

/**
 * Geographic regions for international portfolio diversification
 */
export type GeographicRegion =
  | 'north_america' // North America (USA, Canada)
  | 'europe' // Europe (excluding Germany/domestic markets)
  | 'asia_pacific' // Asia-Pacific developed markets (Japan, Australia, etc.)
  | 'emerging_markets' // Emerging markets (China, India, Brazil, etc.)

/**
 * Geographic region configuration with tax treatment
 */
export interface GeographicRegionConfig {
  /** Display name in German */
  name: string
  /** Region description */
  description: string
  /** Expected annual return for this region (as decimal, e.g., 0.08 for 8%) */
  expectedReturn: number
  /** Annual volatility/standard deviation (as decimal, e.g., 0.20 for 20%) */
  volatility: number
  /** Target allocation percentage within international stocks (0-1) */
  targetAllocation: number
  /** Whether this region is enabled in the portfolio */
  enabled: boolean
  /** Typical withholding tax rate for this region (as decimal, e.g., 0.15 for 15%) */
  withholdingTaxRate: number
  /** Representative country codes for this region (for reference) */
  representativeCountries: string[]
  /** Estimated dividend yield for this region (as decimal, e.g., 0.02 for 2%) */
  dividendYield: number
}

/**
 * Default geographic region configurations
 * Based on historical data and typical portfolio allocations
 */
export const DEFAULT_GEOGRAPHIC_REGIONS: Record<
  GeographicRegion,
  GeographicRegionConfig
> = {
  north_america: {
    name: 'Nordamerika',
    description: 'USA, Kanada - S&P 500, NASDAQ, TSX',
    expectedReturn: 0.09, // 9% historical average (US market focus)
    volatility: 0.18, // 18% volatility
    targetAllocation: 0.55, // 55% of international allocation
    enabled: true,
    withholdingTaxRate: 0.15, // 15% under DBA (US standard)
    representativeCountries: ['US', 'CA'],
    dividendYield: 0.017, // ~1.7% average dividend yield
  },
  europe: {
    name: 'Europa (ex-Deutschland)',
    description: 'STOXX Europe 600 (excl. Germany) - UK, Frankreich, Schweiz, etc.',
    expectedReturn: 0.07, // 7% historical average
    volatility: 0.19, // 19% volatility
    targetAllocation: 0.28, // 28% of international allocation
    enabled: true,
    withholdingTaxRate: 0.12, // ~12% weighted average (UK 0%, FR 15%, CH 15%)
    representativeCountries: ['GB', 'FR', 'CH', 'NL'],
    dividendYield: 0.028, // ~2.8% average dividend yield (higher than US)
  },
  asia_pacific: {
    name: 'Asien-Pazifik',
    description: 'Japan, Australien, Südkorea, Hongkong',
    expectedReturn: 0.075, // 7.5% historical average
    volatility: 0.2, // 20% volatility
    targetAllocation: 0.17, // 17% of international allocation
    enabled: true,
    withholdingTaxRate: 0.15, // 15% under DBA (Japan/Australia standard)
    representativeCountries: ['JP', 'AU', 'KR', 'HK'],
    dividendYield: 0.023, // ~2.3% average dividend yield
  },
  emerging_markets: {
    name: 'Schwellenländer',
    description: 'China, Indien, Brasilien, Südafrika - MSCI Emerging Markets',
    expectedReturn: 0.08, // 8% historical average (higher risk/return)
    volatility: 0.25, // 25% volatility (higher risk)
    targetAllocation: 0.1, // 10% of international allocation
    enabled: false, // Disabled by default (higher risk)
    withholdingTaxRate: 0.1, // 10% typical rate (varies by country)
    representativeCountries: ['CN', 'IN', 'BR', 'ZA'],
    dividendYield: 0.026, // ~2.6% average dividend yield
  },
}

/**
 * Configuration for geographic diversification
 */
export interface GeographicDiversificationConfig {
  /** Whether geographic diversification is enabled */
  enabled: boolean
  /** Regional configurations */
  regions: Record<GeographicRegion, GeographicRegionConfig>
  /** Whether to automatically calculate withholding taxes */
  automaticWithholdingTaxCalculation: boolean
}

/**
 * Create default geographic diversification configuration
 */
export function createDefaultGeographicDiversificationConfig(): GeographicDiversificationConfig {
  // Deep clone regions to avoid modifying defaults
  const regions: Record<GeographicRegion, GeographicRegionConfig> = {} as Record<
    GeographicRegion,
    GeographicRegionConfig
  >

  for (const [key, value] of Object.entries(DEFAULT_GEOGRAPHIC_REGIONS)) {
    regions[key as GeographicRegion] = { ...value }
  }

  return {
    enabled: false,
    regions,
    automaticWithholdingTaxCalculation: true,
  }
}

/**
 * Validate allocation range
 */
function validateAllocationRange(
  value: number,
  regionName: string,
  errors: string[],
): void {
  if (value < 0 || value > 1) {
    errors.push(`${regionName}: Allokation muss zwischen 0% und 100% liegen`)
  }
}

/**
 * Validate return range
 */
function validateReturnRange(
  value: number,
  regionName: string,
  errors: string[],
): void {
  if (value < -1 || value > 1) {
    errors.push(
      `${regionName}: Erwartete Rendite muss zwischen -100% und 100% liegen`,
    )
  }
}

/**
 * Validate volatility range
 */
function validateVolatilityRange(
  value: number,
  regionName: string,
  errors: string[],
): void {
  if (value < 0 || value > 2) {
    errors.push(`${regionName}: Volatilität muss zwischen 0% und 200% liegen`)
  }
}

/**
 * Validate withholding tax rate range
 */
function validateWithholdingTaxRate(
  value: number,
  regionName: string,
  errors: string[],
): void {
  if (value < 0 || value > 1) {
    errors.push(
      `${regionName}: Quellensteuersatz muss zwischen 0% und 100% liegen`,
    )
  }
}

/**
 * Validate dividend yield range
 */
function validateDividendYield(
  value: number,
  regionName: string,
  errors: string[],
): void {
  if (value < 0 || value > 0.2) {
    errors.push(
      `${regionName}: Dividendenrendite muss zwischen 0% und 20% liegen`,
    )
  }
}

/**
 * Validate individual region configuration
 */
function validateRegionConfig(
  region: GeographicRegionConfig,
  regionName: string,
): string[] {
  const errors: string[] = []

  validateAllocationRange(region.targetAllocation, regionName, errors)
  validateReturnRange(region.expectedReturn, regionName, errors)
  validateVolatilityRange(region.volatility, regionName, errors)
  validateWithholdingTaxRate(region.withholdingTaxRate, regionName, errors)
  validateDividendYield(region.dividendYield, regionName, errors)

  return errors
}

/**
 * Validate geographic diversification configuration
 *
 * @param config - Geographic diversification configuration
 * @returns Array of validation error messages (empty if valid)
 */
export function validateGeographicDiversificationConfig(
  config: GeographicDiversificationConfig,
): string[] {
  const errors: string[] = []

  if (!config.enabled) {
    return errors // No validation needed if disabled
  }

  // Check that enabled regions have allocations that sum to 1.0
  const enabledRegions = Object.values(config.regions).filter((r) => r.enabled)

  if (enabledRegions.length === 0) {
    errors.push(
      'Mindestens eine geografische Region muss aktiviert sein, wenn geografische Diversifikation aktiviert ist',
    )
    return errors
  }

  const totalAllocation = enabledRegions.reduce(
    (sum, region) => sum + region.targetAllocation,
    0,
  )

  // Allow small rounding errors (within 0.1%)
  if (Math.abs(totalAllocation - 1.0) > 0.001) {
    errors.push(
      `Die Summe der regionalen Allokationen muss 100% ergeben (aktuell: ${(totalAllocation * 100).toFixed(1)}%)`,
    )
  }

  // Validate individual regions
  for (const [, region] of Object.entries(config.regions)) {
    if (!region.enabled) continue
    errors.push(...validateRegionConfig(region, region.name))
  }

  return errors
}

/**
 * Normalize regional allocations to sum to 1.0
 *
 * @param config - Geographic diversification configuration
 * @returns Configuration with normalized allocations
 */
export function normalizeGeographicAllocations(
  config: GeographicDiversificationConfig,
): GeographicDiversificationConfig {
  if (!config.enabled) {
    return config
  }

  const enabledRegions = Object.entries(config.regions).filter(
    ([_, region]) => region.enabled,
  )

  if (enabledRegions.length === 0) {
    return config
  }

  const totalAllocation = enabledRegions.reduce(
    (sum, [_, region]) => sum + region.targetAllocation,
    0,
  )

  if (totalAllocation === 0) {
    // Equal distribution if all allocations are 0
    const equalAllocation = 1.0 / enabledRegions.length
    const normalizedRegions = { ...config.regions }

    for (const [regionKey] of enabledRegions) {
      normalizedRegions[regionKey as GeographicRegion] = {
        ...normalizedRegions[regionKey as GeographicRegion],
        targetAllocation: equalAllocation,
      }
    }

    return {
      ...config,
      regions: normalizedRegions,
    }
  }

  // Normalize to sum to 1.0
  const normalizedRegions = { ...config.regions }

  for (const [regionKey] of enabledRegions) {
    const region = normalizedRegions[regionKey as GeographicRegion]
    normalizedRegions[regionKey as GeographicRegion] = {
      ...region,
      targetAllocation: region.targetAllocation / totalAllocation,
    }
  }

  return {
    ...config,
    regions: normalizedRegions,
  }
}

/**
 * Calculate portfolio-weighted expected return for geographic diversification
 *
 * @param config - Geographic diversification configuration
 * @returns Weighted expected return (as decimal)
 */
export function calculateGeographicPortfolioReturn(
  config: GeographicDiversificationConfig,
): number {
  if (!config.enabled) {
    return 0
  }

  const enabledRegions = Object.values(config.regions).filter((r) => r.enabled)

  if (enabledRegions.length === 0) {
    return 0
  }

  return enabledRegions.reduce(
    (sum, region) => sum + region.expectedReturn * region.targetAllocation,
    0,
  )
}

/**
 * Calculate portfolio-weighted volatility for geographic diversification
 * Note: This is a simplified calculation without correlation matrix
 *
 * @param config - Geographic diversification configuration
 * @returns Weighted volatility (as decimal)
 */
export function calculateGeographicPortfolioVolatility(
  config: GeographicDiversificationConfig,
): number {
  if (!config.enabled) {
    return 0
  }

  const enabledRegions = Object.values(config.regions).filter((r) => r.enabled)

  if (enabledRegions.length === 0) {
    return 0
  }

  // Simplified weighted average (ignores correlations)
  return enabledRegions.reduce(
    (sum, region) => sum + region.volatility * region.targetAllocation,
    0,
  )
}

/**
 * Calculate withholding tax for a single region
 */
function calculateRegionWithholdingTax(
  regionKey: GeographicRegion,
  region: GeographicRegionConfig,
  internationalHoldingsValue: number,
  germanCapitalGainsTaxRate: number,
  teilfreistellung: number,
): {
  region: GeographicRegion
  name: string
  holdingsValue: number
  dividendIncome: number
  withholdingTaxPaid: number
  creditableAmount: number
  remainingGermanTax: number
} {
  // Calculate regional holdings value
  const holdingsValue = internationalHoldingsValue * region.targetAllocation

  // Calculate dividend income for this region
  const dividendIncome = holdingsValue * region.dividendYield

  // Calculate foreign withholding tax paid
  const withholdingTaxPaid = dividendIncome * region.withholdingTaxRate

  // Calculate German tax that would be due on this income (with Teilfreistellung)
  const taxableDividendIncome = dividendIncome * (1 - teilfreistellung)
  const germanTaxDue = taxableDividendIncome * germanCapitalGainsTaxRate

  // Credit is limited to the lower of foreign tax paid or German tax due
  const creditableAmount = Math.min(withholdingTaxPaid, germanTaxDue)

  // Remaining German tax to pay after credit
  const remainingGermanTax = Math.max(0, germanTaxDue - creditableAmount)

  return {
    region: regionKey,
    name: region.name,
    holdingsValue,
    dividendIncome,
    withholdingTaxPaid,
    creditableAmount,
    remainingGermanTax,
  }
}

/**
 * Create empty withholding tax result
 */
function createEmptyWithholdingTaxResult() {
  return {
    totalWithholdingTaxPaid: 0,
    totalCreditableAmount: 0,
    totalRemainingGermanTax: 0,
    regionalBreakdown: [],
  }
}

/**
 * Sum regional breakdown values
 */
function sumRegionalBreakdown(
  regionalBreakdown: Array<{
    withholdingTaxPaid: number
    creditableAmount: number
    remainingGermanTax: number
  }>,
) {
  return {
    totalWithholdingTaxPaid: regionalBreakdown.reduce(
      (sum, item) => sum + item.withholdingTaxPaid,
      0,
    ),
    totalCreditableAmount: regionalBreakdown.reduce(
      (sum, item) => sum + item.creditableAmount,
      0,
    ),
    totalRemainingGermanTax: regionalBreakdown.reduce(
      (sum, item) => sum + item.remainingGermanTax,
      0,
    ),
  }
}

/**
 * Calculate total withholding tax for international holdings
 *
 * @param internationalHoldingsValue - Total value of international holdings in EUR
 * @param config - Geographic diversification configuration
 * @param germanCapitalGainsTaxRate - German capital gains tax rate (typically 0.26375)
 * @param teilfreistellung - Partial exemption rate for equity funds (typically 0.3 for 30%)
 * @returns Total withholding tax impact and detailed breakdown
 */
export function calculateGeographicWithholdingTax(
  internationalHoldingsValue: number,
  config: GeographicDiversificationConfig,
  germanCapitalGainsTaxRate: number,
  teilfreistellung = 0.3,
): {
  totalWithholdingTaxPaid: number
  totalCreditableAmount: number
  totalRemainingGermanTax: number
  regionalBreakdown: Array<{
    region: GeographicRegion
    name: string
    holdingsValue: number
    dividendIncome: number
    withholdingTaxPaid: number
    creditableAmount: number
    remainingGermanTax: number
  }>
} {
  if (!config.enabled) {
    return createEmptyWithholdingTaxResult()
  }

  const enabledRegions = Object.entries(config.regions).filter(
    ([_, region]) => region.enabled,
  )

  if (enabledRegions.length === 0) {
    return createEmptyWithholdingTaxResult()
  }

  const regionalBreakdown = enabledRegions.map(([regionKey, region]) =>
    calculateRegionWithholdingTax(
      regionKey as GeographicRegion,
      region,
      internationalHoldingsValue,
      germanCapitalGainsTaxRate,
      teilfreistellung,
    ),
  )

  const totals = sumRegionalBreakdown(regionalBreakdown)

  return {
    ...totals,
    regionalBreakdown,
  }
}

/**
 * Get representative country information for a region
 *
 * @param region - Geographic region
 * @returns Array of country withholding tax information
 */
export function getRegionCountryInfo(
  region: GeographicRegion,
): CountryWithholdingTaxRate[] {
  const regionConfig = DEFAULT_GEOGRAPHIC_REGIONS[region]
  return regionConfig.representativeCountries
    .map((code) => COMMON_WITHHOLDING_TAX_RATES.find((c) => c.countryCode === code))
    .filter((c): c is CountryWithholdingTaxRate => c !== undefined)
}

/**
 * Get all geographic regions
 *
 * @returns Array of all geographic region keys
 */
export function getAllGeographicRegions(): GeographicRegion[] {
  return Object.keys(DEFAULT_GEOGRAPHIC_REGIONS) as GeographicRegion[]
}

/**
 * Get display name for a geographic region
 *
 * @param region - Geographic region
 * @returns German display name
 */
export function getGeographicRegionName(region: GeographicRegion): string {
  return DEFAULT_GEOGRAPHIC_REGIONS[region].name
}
