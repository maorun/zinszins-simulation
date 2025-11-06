import { useMemo } from 'react'
import type { SimulationData } from '../contexts/helpers/config-types'
import { calculateRiskMetrics, type PortfolioData } from '../utils/risk-metrics'

export function useRiskCalculations(simulationData: SimulationData | null) {
  // Extract portfolio data for risk calculations
  const portfolioData: PortfolioData = useMemo(() => {
    if (!simulationData) {
      return { years: [], values: [], riskFreeRate: 0.02 }
    }

    const years: number[] = []
    const values: number[] = []

    // Get data from simulation results
    const allYears = Object.keys(simulationData.sparplanElements[0]?.simulation || {})
      .map(Number)
      .filter((year) => !isNaN(year))
      .sort((a, b) => a - b)

    allYears.forEach((year) => {
      const totalValue = simulationData.sparplanElements.reduce(
        (sum: number, element: { simulation?: Record<number, { endkapital?: number }> }) => {
          return sum + (element.simulation?.[year]?.endkapital || 0)
        },
        0,
      )

      if (totalValue > 0) {
        years.push(year)
        values.push(totalValue)
      }
    })

    return {
      years,
      values,
      riskFreeRate: 0.02, // 2% risk-free rate
    }
  }, [simulationData])

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    if (portfolioData.values.length < 2) {
      return null
    }
    return calculateRiskMetrics(portfolioData)
  }, [portfolioData])

  // Check if we have meaningful risk data (not all zeros)
  const hasRiskData = useMemo(() => {
    if (!riskMetrics) return false

    // Check if there's actual variation in the data
    const hasDrawdown = riskMetrics.maxDrawdown > 0.01
    const hasVolatility = riskMetrics.volatility > 0.01
    const hasVaR = riskMetrics.valueAtRisk5 > 0.01

    return hasDrawdown || hasVolatility || hasVaR
  }, [riskMetrics])

  return {
    portfolioData,
    riskMetrics,
    hasRiskData,
  }
}
