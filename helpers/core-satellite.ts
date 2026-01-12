/**
 * Core-Satellite Strategy Implementation
 *
 * The Core-Satellite strategy is a portfolio construction approach that combines:
 * - CORE (70-90%): Passive, broadly diversified, low-cost index funds (ETFs)
 * - SATELLITE (10-30%): Active positions, theme funds, individual stocks, or tactical overweights
 *
 * Benefits:
 * - Lower overall costs (core is passive/low-cost)
 * - Controlled active risk (satellites are limited)
 * - Flexibility for personal convictions or market opportunities
 * - Clear performance attribution (core vs. satellite performance)
 *
 * This implementation is designed for German investors and integrates with
 * the existing Multi-Asset Portfolio system.
 */

import type { AssetClass } from './multi-asset-portfolio'

/**
 * Position types in the Core-Satellite strategy
 */
export type PositionType = 'core' | 'satellite'

/**
 * Satellite strategy types
 */
export type SatelliteStrategy =
  | 'sector_overweight' // Overweight specific sectors (Tech, Healthcare, etc.)
  | 'regional_tilt' // Geographic tilt (Emerging Markets, Small Caps, etc.)
  | 'thematic' // Theme funds (AI, Clean Energy, Blockchain, etc.)
  | 'individual_stocks' // Individual stock picks
  | 'factor_tilt' // Factor tilts (Value, Growth, Quality, etc.)
  | 'tactical_allocation' // Tactical market timing positions

/**
 * Configuration for a satellite position
 */
export interface SatellitePosition {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Strategy type */
  strategy: SatelliteStrategy
  /** Expected return (e.g., 0.10 for 10% - often higher expectations than core) */
  expectedReturn: number
  /** Volatility (often higher than core) */
  volatility: number
  /** Target allocation as percentage of total portfolio (0-1) */
  targetAllocation: number
  /** Whether this position is enabled */
  enabled: boolean
  /** Description */
  description: string
  /** Annual costs (TER) in percentage (0-1) */
  costs: number
  /** Underlying asset class for tax purposes */
  underlyingAssetClass: AssetClass
}

/**
 * Core portfolio configuration
 */
export interface CoreConfiguration {
  /** Core allocation as percentage of total portfolio (0-1, typically 0.7-0.9) */
  coreAllocation: number
  /** Asset class allocations within core (must sum to 1.0) */
  assetClassAllocations: Partial<Record<AssetClass, number>>
  /** Average annual costs (TER) of core positions */
  averageCosts: number
  /** Core portfolio description */
  description: string
}

/**
 * Complete Core-Satellite portfolio configuration
 */
export interface CoreSatelliteConfig {
  /** Whether Core-Satellite strategy is enabled */
  enabled: boolean
  /** Core portfolio configuration */
  core: CoreConfiguration
  /** Satellite positions */
  satellites: SatellitePosition[]
  /** Rebalancing rules */
  rebalancing: {
    /** Rebalancing frequency */
    frequency: 'monthly' | 'quarterly' | 'yearly'
    /** Rebalancing threshold (percentage deviation that triggers rebalancing) */
    threshold: number
    /** Whether to maintain strict core/satellite split */
    maintainCoreSatelliteSplit: boolean
  }
}

/**
 * Default Core-Satellite configuration
 */
export const DEFAULT_CORE_SATELLITE_CONFIG: CoreSatelliteConfig = {
  enabled: false,
  core: {
    coreAllocation: 0.8, // 80% core
    assetClassAllocations: {
      stocks_domestic: 0.3,
      stocks_international: 0.3,
      bonds_government: 0.25,
      bonds_corporate: 0.15,
    },
    averageCosts: 0.002, // 0.2% TER
    description: 'Breit diversifiziertes Core-Portfolio mit kostengünstigen ETFs',
  },
  satellites: [],
  rebalancing: {
    frequency: 'yearly',
    threshold: 0.05, // 5% deviation triggers rebalancing
    maintainCoreSatelliteSplit: true,
  },
}

/**
 * Calculate effective portfolio allocation combining core and satellites
 */
export function calculateEffectiveAllocation(config: CoreSatelliteConfig): {
  assetClassAllocations: Record<AssetClass, number>
  totalAllocation: number
  corePercentage: number
  satellitePercentage: number
} {
  const enabledSatellites = config.satellites.filter((s) => s.enabled)

  // Calculate total satellite allocation
  const satelliteAllocation = enabledSatellites.reduce((sum, sat) => sum + sat.targetAllocation, 0)

  // Effective core allocation (might be less than configured if satellites exceed limits)
  const effectiveCoreAllocation = Math.max(0, 1 - satelliteAllocation)

  // Start with zero allocations
  const assetClassAllocations: Record<AssetClass, number> = {
    stocks_domestic: 0,
    stocks_international: 0,
    bonds_government: 0,
    bonds_corporate: 0,
    real_estate: 0,
    commodities: 0,
    cash: 0,
  }

  // Add core allocations
  Object.entries(config.core.assetClassAllocations).forEach(([assetClass, allocation]) => {
    if (allocation) {
      assetClassAllocations[assetClass as AssetClass] += effectiveCoreAllocation * allocation
    }
  })

  // Add satellite allocations mapped to their underlying asset classes
  enabledSatellites.forEach((satellite) => {
    assetClassAllocations[satellite.underlyingAssetClass] += satellite.targetAllocation
  })

  const totalAllocation = Object.values(assetClassAllocations).reduce((sum, val) => sum + val, 0)

  return {
    assetClassAllocations,
    totalAllocation,
    corePercentage: effectiveCoreAllocation,
    satellitePercentage: satelliteAllocation,
  }
}

/**
 * Calculate expected portfolio return and risk
 */
export function calculatePortfolioMetrics(config: CoreSatelliteConfig): {
  expectedReturn: number
  portfolioRisk: number
  costs: number
  coreReturn: number
  satelliteReturn: number
} {
  const enabledSatellites = config.satellites.filter((s) => s.enabled)

  // Calculate core portfolio metrics
  const coreReturn = calculateCoreReturn(config.core)
  const coreRisk = calculateCoreRisk(config.core)
  const coreCosts = config.core.averageCosts

  // Calculate satellite metrics
  const satelliteAllocation = enabledSatellites.reduce((sum, sat) => sum + sat.targetAllocation, 0)

  let satelliteReturn = 0
  let satelliteRisk = 0
  let satelliteCosts = 0

  if (satelliteAllocation > 0) {
    enabledSatellites.forEach((satellite) => {
      const weight = satellite.targetAllocation / satelliteAllocation
      satelliteReturn += weight * satellite.expectedReturn
      satelliteRisk += weight * satellite.volatility // Simplified, assumes diversification
      satelliteCosts += weight * satellite.costs
    })
  }

  // Effective allocations
  const effectiveCoreAllocation = Math.max(0, 1 - satelliteAllocation)

  // Portfolio-level metrics
  const expectedReturn = effectiveCoreAllocation * coreReturn + satelliteAllocation * satelliteReturn
  const portfolioRisk =
    Math.sqrt(
      Math.pow(effectiveCoreAllocation * coreRisk, 2) + Math.pow(satelliteAllocation * satelliteRisk, 2),
    ) // Simplified correlation assumption

  const costs = effectiveCoreAllocation * coreCosts + satelliteAllocation * satelliteCosts

  return {
    expectedReturn: expectedReturn - costs, // Net return after costs
    portfolioRisk,
    costs,
    coreReturn: coreReturn - coreCosts,
    satelliteReturn: satelliteReturn - satelliteCosts,
  }
}

/**
 * Helper: Calculate core portfolio return
 */
function calculateCoreReturn(core: CoreConfiguration): number {
  let totalReturn = 0
  let totalAllocation = 0

  // Simplified expected returns by asset class
  const assetClassReturns: Record<AssetClass, number> = {
    stocks_domestic: 0.08,
    stocks_international: 0.075,
    bonds_government: 0.03,
    bonds_corporate: 0.04,
    real_estate: 0.06,
    commodities: 0.04,
    cash: 0.02,
  }

  Object.entries(core.assetClassAllocations).forEach(([assetClass, allocation]) => {
    if (allocation) {
      totalReturn += allocation * assetClassReturns[assetClass as AssetClass]
      totalAllocation += allocation
    }
  })

  return totalAllocation > 0 ? totalReturn / totalAllocation : 0
}

/**
 * Helper: Calculate core portfolio risk
 */
function calculateCoreRisk(core: CoreConfiguration): number {
  // Simplified risk calculation
  let totalRisk = 0
  let totalAllocation = 0

  const assetClassRisks: Record<AssetClass, number> = {
    stocks_domestic: 0.2,
    stocks_international: 0.18,
    bonds_government: 0.05,
    bonds_corporate: 0.08,
    real_estate: 0.15,
    commodities: 0.2,
    cash: 0.01,
  }

  Object.entries(core.assetClassAllocations).forEach(([assetClass, allocation]) => {
    if (allocation) {
      totalRisk += allocation * assetClassRisks[assetClass as AssetClass]
      totalAllocation += allocation
    }
  })

  return totalAllocation > 0 ? totalRisk / totalAllocation : 0
}

/**
 * Validate Core-Satellite configuration
 */
export function validateCoreSatelliteConfig(config: CoreSatelliteConfig): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check core allocation sums to 1.0
  const coreAllocationSum = Object.values(config.core.assetClassAllocations).reduce(
    (sum, val) => sum + (val || 0),
    0,
  )

  if (Math.abs(coreAllocationSum - 1.0) > 0.01) {
    errors.push(`Core-Allokationen müssen 100% ergeben (aktuell: ${(coreAllocationSum * 100).toFixed(1)}%)`)
  }

  // Check total satellite allocation
  const enabledSatellites = config.satellites.filter((s) => s.enabled)
  const satelliteAllocation = enabledSatellites.reduce((sum, sat) => sum + sat.targetAllocation, 0)

  if (satelliteAllocation > 0.3) {
    warnings.push(
      `Satelliten-Anteil sehr hoch (${(satelliteAllocation * 100).toFixed(1)}%). Empfohlen: max. 30%`,
    )
  }

  if (satelliteAllocation > 1.0) {
    errors.push(`Satelliten-Allokationen überschreiten 100% (${(satelliteAllocation * 100).toFixed(1)}%)`)
  }

  // Check if core + satellites exceed 100%
  const totalAllocation = (1 - satelliteAllocation) + satelliteAllocation
  if (totalAllocation > 1.01) {
    errors.push(`Gesamt-Allokation überschreitet 100% (${(totalAllocation * 100).toFixed(1)}%)`)
  }

  // Warning if core allocation is too small
  if ((1 - satelliteAllocation) < 0.7) {
    warnings.push(`Core-Anteil unter 70% (${((1 - satelliteAllocation) * 100).toFixed(1)}%). Empfohlen: 70-90%`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Default configurations for satellite strategies
 */
const SATELLITE_STRATEGY_DEFAULTS: Record<
  SatelliteStrategy,
  Pick<SatellitePosition, 'name' | 'expectedReturn' | 'volatility' | 'costs' | 'description' | 'underlyingAssetClass'>
> = {
  sector_overweight: {
    name: 'Sektor-Übergewichtung',
    expectedReturn: 0.10,
    volatility: 0.25,
    costs: 0.005,
    description: 'Übergewichtung bestimmter Sektoren (z.B. Technologie, Healthcare)',
    underlyingAssetClass: 'stocks_international',
  },
  regional_tilt: {
    name: 'Regionale Ausrichtung',
    expectedReturn: 0.09,
    volatility: 0.22,
    costs: 0.004,
    description: 'Geografischer Schwerpunkt (z.B. Emerging Markets, Small Caps)',
    underlyingAssetClass: 'stocks_international',
  },
  thematic: {
    name: 'Themen-Investition',
    expectedReturn: 0.12,
    volatility: 0.30,
    costs: 0.007,
    description: 'Themen-Fonds (z.B. KI, Clean Energy, Blockchain)',
    underlyingAssetClass: 'stocks_international',
  },
  individual_stocks: {
    name: 'Einzelaktien',
    expectedReturn: 0.11,
    volatility: 0.35,
    costs: 0.001,
    description: 'Ausgewählte Einzelaktien',
    underlyingAssetClass: 'stocks_domestic',
  },
  factor_tilt: {
    name: 'Faktor-Ausrichtung',
    expectedReturn: 0.09,
    volatility: 0.20,
    costs: 0.003,
    description: 'Faktor-Strategien (Value, Growth, Quality)',
    underlyingAssetClass: 'stocks_international',
  },
  tactical_allocation: {
    name: 'Taktische Allokation',
    expectedReturn: 0.08,
    volatility: 0.18,
    costs: 0.003,
    description: 'Taktisches Market-Timing',
    underlyingAssetClass: 'stocks_international',
  },
}

/**
 * Create a default satellite position
 */
export function createDefaultSatellitePosition(strategy: SatelliteStrategy): SatellitePosition {
  const defaults = SATELLITE_STRATEGY_DEFAULTS[strategy]

  return {
    id: `satellite-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    strategy,
    targetAllocation: 0.05, // 5% default
    enabled: true,
    ...defaults,
  }
}

/**
 * Performance attribution - breakdown of returns by source
 */
export function calculatePerformanceAttribution(
  config: CoreSatelliteConfig,
  actualReturns: {
    core: number
    satellites: Record<string, number> // satellite ID -> actual return
  },
): {
  totalReturn: number
  coreContribution: number
  satelliteContribution: number
  satelliteBreakdown: Array<{
    id: string
    name: string
    contribution: number
  }>
} {
  const enabledSatellites = config.satellites.filter((s) => s.enabled)
  const satelliteAllocation = enabledSatellites.reduce((sum, sat) => sum + sat.targetAllocation, 0)
  const effectiveCoreAllocation = Math.max(0, 1 - satelliteAllocation)

  // Core contribution
  const coreContribution = effectiveCoreAllocation * actualReturns.core

  // Satellite contributions
  const satelliteBreakdown = enabledSatellites.map((satellite) => {
    const actualReturn = actualReturns.satellites[satellite.id] || satellite.expectedReturn
    return {
      id: satellite.id,
      name: satellite.name,
      contribution: satellite.targetAllocation * actualReturn,
    }
  })

  const satelliteContribution = satelliteBreakdown.reduce((sum, sat) => sum + sat.contribution, 0)

  return {
    totalReturn: coreContribution + satelliteContribution,
    coreContribution,
    satelliteContribution,
    satelliteBreakdown,
  }
}
