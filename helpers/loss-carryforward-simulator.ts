/**
 * Extended Loss Carryforward Strategy Simulator
 *
 * This module extends the basic loss offset system with comprehensive simulation
 * and optimization capabilities for multi-year loss carryforward planning.
 *
 * Features:
 * - Multi-year loss realization scenario simulation
 * - Optimal timing calculation for gain/loss realization
 * - Strategy comparison between different approaches
 * - Timeline visualization data generation
 * - Detailed recommendations based on § 20 Abs. 6 EStG
 *
 * German tax law references:
 * - § 20 Abs. 6 EStG: Verlustverrechnung bei Kapitalerträgen
 * - § 20 Abs. 6 Satz 5 EStG: Verrechnungsbeschränkung bei Aktienverlusten
 */

import {
  createInitialLossAccountState,
  createDefaultRealizedLosses,
  analyzeMultiYearLossUsage,
  formatLossAmount,
  type LossAccountState,
  type RealizedLossesConfig,
  type MultiYearLossTracking,
  type YearLossAnalysis,
  type LossRecommendation,
} from './loss-offset-accounts'

/**
 * Loss realization strategy types
 */
export type LossRealizationStrategy =
  | 'immediate' // Realize all gains immediately when losses available
  | 'gradual' // Spread gain realization evenly over planning period
  | 'optimized' // Optimize timing based on tax efficiency
  | 'conservative' // Minimize risk, prioritize carryforward utilization
  | 'aggressive' // Maximize near-term tax savings

/**
 * Configuration for loss carryforward simulation
 */
export interface LossCarryforwardSimulatorConfig {
  /** Starting loss carryforward amounts */
  initialLosses: LossAccountState
  /** Projected realized losses per year */
  projectedRealizedLosses: Record<number, RealizedLossesConfig>
  /** Projected gains per year if all gains are realized */
  projectedMaxGains: Record<number, { stockGains: number; otherGains: number }>
  /** Strategy for gain realization timing */
  strategy: LossRealizationStrategy
  /** Tax rate for calculating savings */
  taxRate: number
  /** Start year for simulation */
  startYear: number
  /** End year for simulation */
  endYear: number
  /** Minimum gain to realize per year (prevents too small transactions) */
  minAnnualGainRealization?: number
}

/**
 * Result of a single scenario simulation
 */
export interface LossSimulationScenario {
  /** Strategy used for this scenario */
  strategy: LossRealizationStrategy
  /** Year-by-year analysis results */
  yearlyResults: YearLossAnalysis[]
  /** Total tax savings over entire period */
  totalTaxSavings: number
  /** Final unused losses at end of period */
  finalUnusedLosses: LossAccountState
  /** Number of years with loss usage */
  yearsWithLossUsage: number
  /** Average annual tax savings */
  averageAnnualSavings: number
  /** Efficiency score (0-100) */
  efficiencyScore: number
  /** Description of strategy execution */
  strategyDescription: string
}

/**
 * Comparison result between multiple scenarios
 */
export interface ScenarioComparisonResult {
  /** All simulated scenarios */
  scenarios: LossSimulationScenario[]
  /** Best scenario based on overall efficiency */
  recommendedScenario: LossSimulationScenario
  /** Scenario with highest total savings */
  highestSavingsScenario: LossSimulationScenario
  /** Scenario with fastest loss utilization */
  fastestUtilizationScenario: LossSimulationScenario
  /** Comparative analysis */
  comparison: {
    maxSavingsDifference: number
    maxEfficiencyDifference: number
    strategicRecommendations: LossRecommendation[]
  }
}

/**
 * Optimal timing recommendation for a specific year
 */
export interface OptimalTimingRecommendation {
  year: number
  recommendedStockGainRealization: number
  recommendedOtherGainRealization: number
  projectedTaxSavings: number
  reasoning: string
  priority: 'low' | 'medium' | 'high'
}

/**
 * Timeline visualization data point
 */
export interface TimelineDataPoint {
  year: number
  availableStockLosses: number
  availableOtherLosses: number
  realizedStockGains: number
  realizedOtherGains: number
  stockLossesUsed: number
  otherLossesUsed: number
  taxSavings: number
  carryforwardStockLosses: number
  carryforwardOtherLosses: number
}

/**
 * Simulate loss carryforward scenario with specified strategy
 *
 * @param config - Simulator configuration
 * @returns Simulation scenario result
 */
export function simulateLossCarryforwardScenario(
  config: LossCarryforwardSimulatorConfig,
): LossSimulationScenario {
  // Determine gain realization schedule based on strategy
  const gainRealizationSchedule = calculateGainRealizationSchedule(config)

  // Build multi-year tracking with scheduled gains
  const tracking: MultiYearLossTracking = {
    yearlyStates: {
      [config.startYear]: config.initialLosses,
    },
    yearlyRealizedLosses: config.projectedRealizedLosses,
    projectedGains: gainRealizationSchedule,
  }

  // Analyze using multi-year loss usage analysis
  const analysis = analyzeMultiYearLossUsage(tracking, config.taxRate, config.startYear, config.endYear)

  // Calculate metrics
  const yearsWithLossUsage = analysis.yearlyAnalyses.filter(
    year => year.projectedLossUsage.totalUsed > 0,
  ).length

  const averageAnnualSavings = analysis.totalProjectedSavings / (config.endYear - config.startYear + 1)

  const finalYear = analysis.yearlyAnalyses[analysis.yearlyAnalyses.length - 1]
  const finalUnusedLosses = finalYear ? finalYear.carryForwardToNextYear : createInitialLossAccountState(config.endYear + 1)

  // Calculate efficiency score
  const totalInitialLosses = config.initialLosses.stockLosses + config.initialLosses.otherLosses
  const totalFinalLosses = finalUnusedLosses.stockLosses + finalUnusedLosses.otherLosses
  const lossesUtilized = Math.max(0, totalInitialLosses - totalFinalLosses + 
    Object.values(config.projectedRealizedLosses).reduce(
      (sum, loss) => sum + loss.stockLosses + loss.otherLosses, 
      0
    ))
  const totalLossesAvailable = totalInitialLosses + Object.values(config.projectedRealizedLosses).reduce(
    (sum, loss) => sum + loss.stockLosses + loss.otherLosses,
    0,
  )
  const efficiencyScore = totalLossesAvailable > 0 ? Math.round((lossesUtilized / totalLossesAvailable) * 100) : 0

  return {
    strategy: config.strategy,
    yearlyResults: analysis.yearlyAnalyses,
    totalTaxSavings: analysis.totalProjectedSavings,
    finalUnusedLosses,
    yearsWithLossUsage,
    averageAnnualSavings,
    efficiencyScore,
    strategyDescription: getStrategyDescription(config.strategy),
  }
}

/**
 * Calculate gain realization schedule based on strategy
 */
function calculateGainRealizationSchedule(
  config: LossCarryforwardSimulatorConfig,
): Record<number, { stockGains: number; otherGains: number }> {
  switch (config.strategy) {
    case 'immediate':
      return calculateImmediateStrategy(config)
    case 'gradual':
      return calculateGradualStrategy(config)
    case 'optimized':
      return calculateOptimizedStrategy(config)
    case 'conservative':
      return calculateConservativeStrategy(config)
    case 'aggressive':
      return calculateAggressiveStrategy(config)
    default:
      // Default to gradual
      return calculateGradualStrategy(config)
  }
}

/**
 * Immediate strategy: Realize all available gains when losses are available
 */
function calculateImmediateStrategy(
  config: LossCarryforwardSimulatorConfig,
): Record<number, { stockGains: number; otherGains: number }> {
  const schedule: Record<number, { stockGains: number; otherGains: number }> = {}
  let remainingStockLosses = config.initialLosses.stockLosses
  let remainingOtherLosses = config.initialLosses.otherLosses

  for (let year = config.startYear; year <= config.endYear; year++) {
    const maxGains = config.projectedMaxGains[year] || { stockGains: 0, otherGains: 0 }
    const newLosses = config.projectedRealizedLosses[year] || createDefaultRealizedLosses(year)

    remainingStockLosses += newLosses.stockLosses
    remainingOtherLosses += newLosses.otherLosses

    // Realize all gains if losses available
    const stockGainsToRealize = Math.min(maxGains.stockGains, remainingStockLosses)
    const otherGainsToRealize = Math.min(maxGains.otherGains, remainingOtherLosses)

    schedule[year] = {
      stockGains: stockGainsToRealize,
      otherGains: otherGainsToRealize,
    }

    remainingStockLosses = Math.max(0, remainingStockLosses - stockGainsToRealize)
    remainingOtherLosses = Math.max(0, remainingOtherLosses - otherGainsToRealize)
  }

  return schedule
}

/**
 * Gradual strategy: Spread gain realization evenly over planning period
 */
function calculateGradualStrategy(
  config: LossCarryforwardSimulatorConfig,
): Record<number, { stockGains: number; otherGains: number }> {
  const schedule: Record<number, { stockGains: number; otherGains: number }> = {}
  const totalYears = config.endYear - config.startYear + 1

  // Calculate total available gains
  const totalStockGains = Object.values(config.projectedMaxGains).reduce(
    (sum, gains) => sum + gains.stockGains,
    0,
  )
  const totalOtherGains = Object.values(config.projectedMaxGains).reduce(
    (sum, gains) => sum + gains.otherGains,
    0,
  )

  const targetAnnualStockGains = totalStockGains / totalYears
  const targetAnnualOtherGains = totalOtherGains / totalYears

  for (let year = config.startYear; year <= config.endYear; year++) {
    const maxGains = config.projectedMaxGains[year] || { stockGains: 0, otherGains: 0 }

    schedule[year] = {
      stockGains: Math.min(maxGains.stockGains, targetAnnualStockGains),
      otherGains: Math.min(maxGains.otherGains, targetAnnualOtherGains),
    }
  }

  return schedule
}

/**
 * Optimized strategy: Maximize tax efficiency through optimal timing
 */
function calculateOptimizedStrategy(
  config: LossCarryforwardSimulatorConfig,
): Record<number, { stockGains: number; otherGains: number }> {
  const schedule: Record<number, { stockGains: number; otherGains: number }> = {}
  let currentStockLosses = config.initialLosses.stockLosses
  let currentOtherLosses = config.initialLosses.otherLosses

  // Priority: Use losses as soon as possible, but spread to maintain tax efficiency
  for (let year = config.startYear; year <= config.endYear; year++) {
    const maxGains = config.projectedMaxGains[year] || { stockGains: 0, otherGains: 0 }
    const newLosses = config.projectedRealizedLosses[year] || createDefaultRealizedLosses(year)

    currentStockLosses += newLosses.stockLosses
    currentOtherLosses += newLosses.otherLosses

    // Realize gains to match losses, with buffer
    const targetStockUsage = Math.min(maxGains.stockGains, currentStockLosses * 0.8)
    const targetOtherUsage = Math.min(maxGains.otherGains, currentOtherLosses * 0.8)

    schedule[year] = {
      stockGains: targetStockUsage,
      otherGains: targetOtherUsage,
    }

    currentStockLosses -= targetStockUsage
    currentOtherLosses -= targetOtherUsage
  }

  return schedule
}

/**
 * Conservative strategy: Maintain high carryforward buffer
 */
function calculateConservativeStrategy(
  config: LossCarryforwardSimulatorConfig,
): Record<number, { stockGains: number; otherGains: number }> {
  const schedule: Record<number, { stockGains: number; otherGains: number }> = {}
  let currentStockLosses = config.initialLosses.stockLosses
  let currentOtherLosses = config.initialLosses.otherLosses

  for (let year = config.startYear; year <= config.endYear; year++) {
    const maxGains = config.projectedMaxGains[year] || { stockGains: 0, otherGains: 0 }
    const newLosses = config.projectedRealizedLosses[year] || createDefaultRealizedLosses(year)

    currentStockLosses += newLosses.stockLosses
    currentOtherLosses += newLosses.otherLosses

    // Only realize gains if losses significantly exceed them
    const stockGainsToRealize = currentStockLosses > maxGains.stockGains * 1.5 ? maxGains.stockGains * 0.5 : 0
    const otherGainsToRealize = currentOtherLosses > maxGains.otherGains * 1.5 ? maxGains.otherGains * 0.5 : 0

    schedule[year] = {
      stockGains: stockGainsToRealize,
      otherGains: otherGainsToRealize,
    }

    currentStockLosses -= stockGainsToRealize
    currentOtherLosses -= otherGainsToRealize
  }

  return schedule
}

/**
 * Aggressive strategy: Maximize near-term savings
 */
function calculateAggressiveStrategy(
  config: LossCarryforwardSimulatorConfig,
): Record<number, { stockGains: number; otherGains: number }> {
  const schedule: Record<number, { stockGains: number; otherGains: number }> = {}
  let remainingStockLosses = config.initialLosses.stockLosses
  let remainingOtherLosses = config.initialLosses.otherLosses

  // Front-load gain realization
  for (let year = config.startYear; year <= config.endYear; year++) {
    const maxGains = config.projectedMaxGains[year] || { stockGains: 0, otherGains: 0 }
    const newLosses = config.projectedRealizedLosses[year] || createDefaultRealizedLosses(year)

    remainingStockLosses += newLosses.stockLosses
    remainingOtherLosses += newLosses.otherLosses

    // In first few years, realize maximum gains
    const yearsSinceStart = year - config.startYear
    const aggressionFactor = Math.max(0.5, 1 - yearsSinceStart * 0.15) // Decreases over time

    const stockGainsToRealize = Math.min(maxGains.stockGains * aggressionFactor, remainingStockLosses)
    const otherGainsToRealize = Math.min(maxGains.otherGains * aggressionFactor, remainingOtherLosses)

    schedule[year] = {
      stockGains: stockGainsToRealize,
      otherGains: otherGainsToRealize,
    }

    remainingStockLosses -= stockGainsToRealize
    remainingOtherLosses -= otherGainsToRealize
  }

  return schedule
}

/**
 * Get human-readable description of strategy
 */
function getStrategyDescription(strategy: LossRealizationStrategy): string {
  const descriptions: Record<LossRealizationStrategy, string> = {
    immediate:
      'Sofortige Gewinnrealisierung: Alle verfügbaren Gewinne werden sofort realisiert, wenn Verluste zur Verrechnung vorhanden sind',
    gradual:
      'Schrittweise Gewinnrealisierung: Gewinne werden gleichmäßig über den Planungszeitraum verteilt realisiert',
    optimized:
      'Optimierte Strategie: Gewinnrealisierung wird zeitlich optimiert, um maximale Steuereffizienz zu erreichen',
    conservative:
      'Konservative Strategie: Hoher Verlustvortragspuffer wird aufrechterhalten, Gewinne nur bei deutlichem Überschuss realisiert',
    aggressive:
      'Aggressive Strategie: Maximierung der Steuerersparnisse in den ersten Jahren durch frontgeladene Gewinnrealisierung',
  }
  return descriptions[strategy]
}

/**
 * Compare multiple loss realization strategies
 *
 * @param config - Base simulator configuration
 * @param strategies - Array of strategies to compare
 * @returns Comparison result with recommendations
 */
export function compareStrategies(
  config: Omit<LossCarryforwardSimulatorConfig, 'strategy'>,
  strategies: LossRealizationStrategy[],
): ScenarioComparisonResult {
  // Simulate all strategies
  const scenarios = strategies.map(strategy =>
    simulateLossCarryforwardScenario({
      ...config,
      strategy,
    }),
  )

  // Find best scenarios by different criteria
  const highestSavingsScenario = scenarios.reduce((best, current) =>
    current.totalTaxSavings > best.totalTaxSavings ? current : best,
  )

  const fastestUtilizationScenario = scenarios.reduce((best, current) =>
    current.efficiencyScore > best.efficiencyScore ? current : best,
  )

  // Overall recommendation: Balance between savings and efficiency
  const recommendedScenario = scenarios.reduce((best, current) => {
    const currentScore = current.totalTaxSavings * 0.6 + current.efficiencyScore * 100
    const bestScore = best.totalTaxSavings * 0.6 + best.efficiencyScore * 100
    return currentScore > bestScore ? current : best
  })

  // Calculate comparison metrics
  const savingsValues = scenarios.map(s => s.totalTaxSavings)
  const efficiencyValues = scenarios.map(s => s.efficiencyScore)

  const maxSavingsDifference = Math.max(...savingsValues) - Math.min(...savingsValues)
  const maxEfficiencyDifference = Math.max(...efficiencyValues) - Math.min(...efficiencyValues)

  // Generate strategic recommendations
  const strategicRecommendations = generateStrategicRecommendations(
    scenarios,
    recommendedScenario,
    config.startYear,
  )

  return {
    scenarios,
    recommendedScenario,
    highestSavingsScenario,
    fastestUtilizationScenario,
    comparison: {
      maxSavingsDifference,
      maxEfficiencyDifference,
      strategicRecommendations,
    },
  }
}

/**
 * Generate strategic recommendations from scenario comparison
 */
function generateStrategicRecommendations(
  scenarios: LossSimulationScenario[],
  recommendedScenario: LossSimulationScenario,
  startYear: number,
): LossRecommendation[] {
  const recommendations: LossRecommendation[] = []

  // Overall strategy recommendation
  recommendations.push({
    type: 'optimize_timing',
    priority: 'high',
    title: `Empfohlene Strategie: ${getStrategyName(recommendedScenario.strategy)}`,
    description: `Diese Strategie bietet das beste Gleichgewicht zwischen Steuerersparnissen (${formatLossAmount(recommendedScenario.totalTaxSavings)}) und Verlustnutzung (${recommendedScenario.efficiencyScore}% Effizienz)`,
    year: startYear,
    potentialSavings: recommendedScenario.totalTaxSavings,
  })

  // Check if aggressive strategy would yield significantly more savings
  const aggressiveScenario = scenarios.find(s => s.strategy === 'aggressive')
  if (
    aggressiveScenario &&
    recommendedScenario.strategy !== 'aggressive' &&
    aggressiveScenario.totalTaxSavings > recommendedScenario.totalTaxSavings * 1.1
  ) {
    recommendations.push({
      type: 'realize_gains',
      priority: 'medium',
      title: 'Alternative: Aggressive Strategie für höhere Ersparnisse',
      description: `Die aggressive Strategie würde ${formatLossAmount(aggressiveScenario.totalTaxSavings - recommendedScenario.totalTaxSavings)} mehr Steuern sparen, erfordert aber frühere Gewinnrealisierung`,
      year: startYear,
      potentialSavings: aggressiveScenario.totalTaxSavings - recommendedScenario.totalTaxSavings,
    })
  }

  // Check if conservative strategy maintains better buffer
  const conservativeScenario = scenarios.find(s => s.strategy === 'conservative')
  if (
    conservativeScenario &&
    conservativeScenario.finalUnusedLosses.stockLosses + conservativeScenario.finalUnusedLosses.otherLosses >
      recommendedScenario.finalUnusedLosses.stockLosses + recommendedScenario.finalUnusedLosses.otherLosses
  ) {
    recommendations.push({
      type: 'defer_gains',
      priority: 'low',
      title: 'Alternative: Konservative Strategie für mehr Flexibilität',
      description:
        'Die konservative Strategie erhält einen höheren Verlustvortragspuffer und bietet mehr Flexibilität für unerwartete Gewinne',
      year: startYear,
    })
  }

  return recommendations
}

/**
 * Get human-readable strategy name
 */
function getStrategyName(strategy: LossRealizationStrategy): string {
  const names: Record<LossRealizationStrategy, string> = {
    immediate: 'Sofortige Realisierung',
    gradual: 'Schrittweise Realisierung',
    optimized: 'Optimierte Realisierung',
    conservative: 'Konservative Strategie',
    aggressive: 'Aggressive Strategie',
  }
  return names[strategy]
}

/**
 * Calculate optimal timing recommendations for each year
 *
 * @param config - Simulator configuration
 * @returns Array of yearly timing recommendations
 */
export function calculateOptimalTiming(
  config: Omit<LossCarryforwardSimulatorConfig, 'strategy'>,
): OptimalTimingRecommendation[] {
  // Run optimized strategy simulation
  const scenario = simulateLossCarryforwardScenario({
    ...config,
    strategy: 'optimized',
  })

  // Generate recommendations for each year
  return scenario.yearlyResults.map(yearResult => {
    const maxGains = config.projectedMaxGains[yearResult.year] || { stockGains: 0, otherGains: 0 }

    // Calculate optimal amounts
    const optimalStockGains = Math.min(
      maxGains.stockGains,
      yearResult.availableLosses.stockLosses * 0.8, // Use 80% of available losses
    )

    const optimalOtherGains = Math.min(
      maxGains.otherGains,
      yearResult.availableLosses.otherLosses * 0.8,
    )

    const projectedSavings = (optimalStockGains + optimalOtherGains) * config.taxRate

    // Determine priority based on available losses and potential savings
    let priority: 'low' | 'medium' | 'high' = 'low'
    if (projectedSavings > 5000 && yearResult.availableLosses.stockLosses + yearResult.availableLosses.otherLosses > 20000) {
      priority = 'high'
    } else if (projectedSavings > 2000) {
      priority = 'medium'
    }

    // Generate reasoning
    let reasoning = `Mit verfügbaren Verlusten von ${formatLossAmount(yearResult.availableLosses.stockLosses + yearResult.availableLosses.otherLosses)} `
    if (optimalStockGains > 0 || optimalOtherGains > 0) {
      reasoning += `können durch Gewinnrealisierung ${formatLossAmount(projectedSavings)} Steuern gespart werden.`
    } else {
      reasoning += 'sollten keine Gewinne realisiert werden, da keine effizienten Verwertungsmöglichkeiten bestehen.'
    }

    return {
      year: yearResult.year,
      recommendedStockGainRealization: optimalStockGains,
      recommendedOtherGainRealization: optimalOtherGains,
      projectedTaxSavings: projectedSavings,
      reasoning,
      priority,
    }
  })
}

/**
 * Generate timeline visualization data
 *
 * @param scenario - Simulation scenario result
 * @returns Array of timeline data points
 */
export function generateTimelineData(scenario: LossSimulationScenario): TimelineDataPoint[] {
  return scenario.yearlyResults.map(yearResult => ({
    year: yearResult.year,
    availableStockLosses: yearResult.availableLosses.stockLosses,
    availableOtherLosses: yearResult.availableLosses.otherLosses,
    realizedStockGains: yearResult.projectedGains.stockGains,
    realizedOtherGains: yearResult.projectedGains.otherGains,
    stockLossesUsed: yearResult.projectedLossUsage.stockLossesUsed,
    otherLossesUsed: yearResult.projectedLossUsage.otherLossesUsed,
    taxSavings: yearResult.projectedTaxSavings,
    carryforwardStockLosses: yearResult.carryForwardToNextYear.stockLosses,
    carryforwardOtherLosses: yearResult.carryForwardToNextYear.otherLosses,
  }))
}

/**
 * Validate year range
 */
function validateYearRange(startYear: number, endYear: number, errors: string[]): void {
  if (startYear >= endYear) {
    errors.push('Endjahr muss nach Startjahr liegen')
  }

  if (startYear < 2000 || endYear > 2100) {
    errors.push('Jahre müssen zwischen 2000 und 2100 liegen')
  }
}

/**
 * Validate initial losses
 */
function validateInitialLosses(initialLosses: LossAccountState, errors: string[]): void {
  if (initialLosses.stockLosses < 0 || initialLosses.otherLosses < 0) {
    errors.push('Anfangsverluste können nicht negativ sein')
  }
}

/**
 * Validate simulator configuration
 *
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateSimulatorConfig(config: LossCarryforwardSimulatorConfig): string[] {
  const errors: string[] = []

  validateYearRange(config.startYear, config.endYear, errors)

  if (config.taxRate < 0 || config.taxRate > 1) {
    errors.push('Steuersatz muss zwischen 0 und 1 (0% und 100%) liegen')
  }

  validateInitialLosses(config.initialLosses, errors)

  if (config.minAnnualGainRealization !== undefined && config.minAnnualGainRealization < 0) {
    errors.push('Minimale jährliche Gewinnrealisierung kann nicht negativ sein')
  }

  return errors
}

/**
 * Get default simulator configuration
 *
 * @param startYear - Starting year
 * @param endYear - Ending year
 * @returns Default configuration
 */
export function getDefaultSimulatorConfig(startYear: number, endYear: number): LossCarryforwardSimulatorConfig {
  return {
    initialLosses: createInitialLossAccountState(startYear),
    projectedRealizedLosses: {},
    projectedMaxGains: {},
    strategy: 'optimized',
    taxRate: 0.26375, // Standard German capital gains tax
    startYear,
    endYear,
    minAnnualGainRealization: 500,
  }
}
