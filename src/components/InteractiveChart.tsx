import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import type { SimulationResult } from '../utils/simulate'
import { useState } from 'react'
import { ChartControls, type ChartView } from './chart/ChartControls'
import { ChartInterpretationGuide } from './chart/ChartInterpretationGuide'
import { ChartVisualization } from './chart/ChartVisualization'
import { useChartConfig } from './chart/useChartConfig'

interface ChartDataPoint {
  year: number
  startkapital: number
  endkapital: number
  zinsen: number
  kumulativeEinzahlungen: number
  bezahlteSteuer: number
  // Real values (inflation-adjusted)
  startkapitalReal?: number
  endkapitalReal?: number
  zinsenReal?: number
}

interface InteractiveChartProps {
  simulationData: SimulationResult
  showRealValues?: boolean
  className?: string
}

/**
 * Convert simulation result to chart data format
 */
function prepareChartData(simulationData: SimulationResult): ChartDataPoint[] {
  const years = Object.keys(simulationData)
    .map(Number)
    .sort((a, b) => a - b)
  let kumulativeEinzahlungen = 0

  return years.map(year => {
    const yearData = simulationData[year]

    // Calculate cumulative deposits (approximation based on capital progression)
    const previousYear = year - 1
    const previousData = simulationData[previousYear]

    if (previousData) {
      // Estimate new deposits as the difference in starting capital minus previous year's interest
      const newDeposits = yearData.startkapital - (previousData.endkapital || 0)
      kumulativeEinzahlungen += Math.max(0, newDeposits)
    } else {
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

export function InteractiveChart({ simulationData, showRealValues = false, className = '' }: InteractiveChartProps) {
  const chartData = prepareChartData(simulationData)

  // Interactive state
  const [showInflationAdjusted, setShowInflationAdjusted] = useState(showRealValues)
  const [chartView, setChartView] = useState<ChartView>('overview')
  const [showTaxes, setShowTaxes] = useState(true)

  // Compute chart configuration
  const chartConfig = useChartConfig(chartView, chartData.length)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Kapitalentwicklung
          {showInflationAdjusted && <span className="text-sm text-gray-600">(inflationsbereinigt)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartControls
          showInflationAdjusted={showInflationAdjusted}
          onShowInflationAdjustedChange={setShowInflationAdjusted}
          showTaxes={showTaxes}
          onShowTaxesChange={setShowTaxes}
          chartView={chartView}
          onChartViewChange={setChartView}
        />

        <ChartVisualization
          chartData={chartData}
          chartConfig={chartConfig}
          showInflationAdjusted={showInflationAdjusted}
          showTaxes={showTaxes}
        />

        <ChartInterpretationGuide
          showInflationAdjusted={showInflationAdjusted}
          showTaxes={showTaxes}
          chartView={chartView}
        />
      </CardContent>
    </Card>
  )
}

export default InteractiveChart
