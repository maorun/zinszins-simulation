/**
 * Sensitivity Analysis Utility
 *
 * Analyzes how changes in key parameters affect the final outcome of the simulation.
 * This helps users understand which parameters have the most impact on their financial planning.
 */

import type { SimulationAnnualType } from './simulate'
import { simulate } from './simulate'
import type { SparplanElement } from './sparplan-utils'
import type { ReturnConfiguration } from './random-returns'

export interface SensitivityParameter {
  name: string
  displayName: string
  baseValue: number
  unit: string
  min: number
  max: number
  step: number
  formatValue: (value: number) => string
}

export interface SensitivityResult {
  parameterName: string
  parameterValue: number
  finalCapital: number
  totalContributions: number
  totalGains: number
  effectiveReturn: number
}

export interface SensitivityAnalysisConfig {
  startYear: number
  endYear: number
  elements: SparplanElement[]
  steuerlast: number
  teilfreistellungsquote: number
  simulationAnnual: SimulationAnnualType
  freibetragPerYear?: { [year: number]: number }
  steuerReduzierenEndkapital?: boolean
  inflationAktivSparphase?: boolean
  inflationsrateSparphase?: number
  inflationAnwendungSparphase?: 'sparplan' | 'gesamtmenge'
}

/**
 * Available parameters for sensitivity analysis
 */
export const SENSITIVITY_PARAMETERS: { [key: string]: SensitivityParameter } = {
  returnRate: {
    name: 'returnRate',
    displayName: 'Rendite',
    baseValue: 5.0,
    unit: '%',
    min: 0,
    max: 15,
    step: 1,
    formatValue: value => `${value.toFixed(1)}%`,
  },
  savingsAmount: {
    name: 'savingsAmount',
    displayName: 'Jährliche Sparrate',
    baseValue: 24000,
    unit: '€',
    min: 6000,
    max: 50000,
    step: 6000,
    formatValue: value => `${value.toLocaleString('de-DE')} €`,
  },
  taxRate: {
    name: 'taxRate',
    displayName: 'Steuerlast',
    baseValue: 26.375,
    unit: '%',
    min: 0,
    max: 45,
    step: 5,
    formatValue: value => `${value.toFixed(2)}%`,
  },
  inflationRate: {
    name: 'inflationRate',
    displayName: 'Inflationsrate',
    baseValue: 2.0,
    unit: '%',
    min: 0,
    max: 10,
    step: 1,
    formatValue: value => `${value.toFixed(1)}%`,
  },
  investmentPeriod: {
    name: 'investmentPeriod',
    displayName: 'Anlagedauer',
    baseValue: 20,
    unit: 'Jahre',
    min: 5,
    max: 50,
    step: 5,
    formatValue: value => `${value} Jahre`,
  },
}

/**
 * Run sensitivity analysis for a single parameter
 */
export function runSensitivityAnalysis(
  parameter: SensitivityParameter,
  baseConfig: SensitivityAnalysisConfig,
  returnConfig: ReturnConfiguration,
): SensitivityResult[] {
  const results: SensitivityResult[] = []

  // Generate range of values to test
  const values: number[] = []
  for (let value = parameter.min; value <= parameter.max; value += parameter.step) {
    values.push(value)
  }

  for (const value of values) {
    const config = { ...baseConfig }
    let modifiedReturnConfig = { ...returnConfig }

    // Modify the appropriate parameter
    switch (parameter.name) {
      case 'returnRate':
        modifiedReturnConfig = { mode: 'fixed', fixedRate: value / 100 }
        break

      case 'savingsAmount':
        // Modify savings plan elements
        config.elements = baseConfig.elements.map(el => ({
          ...el,
          einzahlung: value,
        }))
        break

      case 'taxRate':
        config.steuerlast = value / 100
        break

      case 'inflationRate':
        config.inflationAktivSparphase = true
        config.inflationsrateSparphase = value
        config.inflationAnwendungSparphase = 'gesamtmenge'
        break

      case 'investmentPeriod':
        // Adjust end year based on investment period
        config.endYear = config.startYear + value - 1
        break
    }

    // Run simulation with modified parameter
    const simulationResult = simulate({
      ...config,
      returnConfig: modifiedReturnConfig,
    })

    // Calculate final values from simulation results
    let finalCapital = 0
    let totalContributions = 0

    for (const element of simulationResult) {
      const years = Object.keys(element.simulation).map(Number)
      if (years.length > 0) {
        const lastYear = Math.max(...years)
        const lastYearData = element.simulation[lastYear]
        finalCapital += lastYearData.endkapital || 0

        // Sum all contributions - need to calculate from element type
        if (element.type === 'sparplan' && 'einzahlung' in element) {
          // For savings plans, multiply yearly contribution by number of years
          totalContributions += element.einzahlung * years.length
        }
        else if (element.type === 'einmalzahlung' && 'gewinn' in element) {
          // For one-time payments, just add the amount
          totalContributions += element.gewinn
        }
      }
    }

    const totalGains = finalCapital - totalContributions
    const effectiveReturn = totalContributions > 0
      ? ((finalCapital / totalContributions) - 1) * 100
      : 0

    results.push({
      parameterName: parameter.name,
      parameterValue: value,
      finalCapital,
      totalContributions,
      totalGains,
      effectiveReturn,
    })
  }

  return results
}

/**
 * Calculate the impact (sensitivity) of each parameter
 * Returns the percentage change in final capital per unit change in parameter
 */
export function calculateParameterImpact(
  results: SensitivityResult[],
  baseResult: SensitivityResult,
): number {
  if (results.length < 2) return 0

  // Calculate the slope of the relationship
  const firstResult = results[0]
  const lastResult = results[results.length - 1]

  const parameterChange = lastResult.parameterValue - firstResult.parameterValue
  const capitalChange = lastResult.finalCapital - firstResult.finalCapital

  if (parameterChange === 0 || baseResult.finalCapital === 0) return 0

  // Return the percentage change in capital per unit change in parameter
  return (capitalChange / parameterChange) / baseResult.finalCapital * 100
}

/**
 * Get the most impactful parameters based on sensitivity analysis
 */
export function getMostImpactfulParameters(
  parameterResults: Map<string, SensitivityResult[]>,
  baseResults: Map<string, SensitivityResult>,
): Array<{ parameter: string, impact: number }> {
  const impacts: Array<{ parameter: string, impact: number }> = []

  for (const [paramName, results] of parameterResults.entries()) {
    const baseResult = baseResults.get(paramName)
    if (baseResult) {
      const impact = Math.abs(calculateParameterImpact(results, baseResult))
      impacts.push({ parameter: paramName, impact })
    }
  }

  // Sort by impact (highest first)
  return impacts.sort((a, b) => b.impact - a.impact)
}
