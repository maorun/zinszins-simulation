import type { SimulationResult } from './simulate'

export interface ChartDataPoint {
  year: number
  startkapital: number
  endkapital: number
  zinsen: number
  kumulativeEinzahlungen: number
  bezahlteSteuer: number
  startkapitalReal?: number
  endkapitalReal?: number
  zinsenReal?: number
}

/**
 * Convert simulation result to chart data format
 */
export function prepareChartData(simulationData: SimulationResult): ChartDataPoint[] {
  const years = Object.keys(simulationData).map(Number).sort((a, b) => a - b)
  let kumulativeEinzahlungen = 0

  return years.map((year) => {
    const yearData = simulationData[year]

    // Calculate cumulative deposits (approximation based on capital progression)
    const previousYear = year - 1
    const previousData = simulationData[previousYear]

    if (previousData) {
      // Estimate new deposits as the difference in starting capital minus previous year's interest
      const newDeposits = yearData.startkapital - (previousData.endkapital || 0)
      kumulativeEinzahlungen += Math.max(0, newDeposits)
    }
    else {
      // First year - starting capital is the first deposit
      kumulativeEinzahlungen = yearData.startkapital
    }

    return {
      year,
      startkapital: yearData.startkapital,
      endkapital: yearData.endkapital,
      zinsen: yearData.zinsen,
      kumulativeEinzahlungen,
      bezahlteSteuer: yearData.bezahlteSteuer,
      startkapitalReal: yearData.startkapitalReal,
      endkapitalReal: yearData.endkapitalReal,
      zinsenReal: yearData.zinsenReal,
    }
  })
}

/**
 * Format number for Y-axis display (shorter format for large numbers)
 */
export function formatYAxisTick(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M €`
  }
  else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k €`
  }
  return `${value} €`
}
