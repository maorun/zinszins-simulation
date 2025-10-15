import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Brush,
} from 'recharts'
import type { SimulationResult } from '../utils/simulate'
import { useState, useMemo } from 'react'
import { ChartTooltip } from './chart/ChartTooltip'
import { ChartControls, type ChartView } from './chart/ChartControls'
import { ChartInterpretationGuide } from './chart/ChartInterpretationGuide'

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
function formatYAxisTick(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M €`
  }
  else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k €`
  }
  return `${value} €`
}

export function InteractiveChart({
  simulationData,
  showRealValues = false,
  className = '',
}: InteractiveChartProps) {
  const chartData = prepareChartData(simulationData)

  // Interactive state
  const [showInflationAdjusted, setShowInflationAdjusted] = useState(showRealValues)
  const [chartView, setChartView] = useState<ChartView>('overview')
  const [showTaxes, setShowTaxes] = useState(true)

  // Determine which values to show based on showInflationAdjusted state
  const endkapitalKey = showInflationAdjusted ? 'endkapitalReal' : 'endkapital'
  const zinsenKey = showInflationAdjusted ? 'zinsenReal' : 'zinsen'

  // Compute chart configuration to reduce complexity
  const chartConfig = useMemo(() => ({
    isDetailedView: chartView === 'detailed',
    containerHeight: chartView === 'detailed' ? 'h-[500px]' : 'h-96',
    marginBottom: chartView === 'detailed' ? 60 : 20,
    xAxisAngle: chartView === 'detailed' ? -45 : 0,
    xAxisTextAnchor: (chartView === 'detailed' ? 'end' : 'middle') as 'end' | 'middle',
    xAxisHeight: chartView === 'detailed' ? 60 : 30,
    endkapitalDot: chartView === 'detailed' ? { fill: '#ef4444', strokeWidth: 2, r: 4 } : false,
    taxDot: chartView === 'detailed' ? { fill: '#f59e0b', strokeWidth: 1, r: 2 } : false,
    showBrush: chartView === 'detailed' && chartData.length > 5,
  }), [chartView, chartData.length])

  // Compute display labels to reduce complexity
  const displayLabels = useMemo(() => ({
    zinsen: showInflationAdjusted ? 'Zinsen/Gewinne (real)' : 'Zinsen/Gewinne',
    endkapital: showInflationAdjusted ? 'Endkapital (real)' : 'Endkapital',
  }), [showInflationAdjusted])
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Kapitalentwicklung
          {showInflationAdjusted && <span className="text-sm text-gray-600">(inflationsbereinigt)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interactive Controls in Collapsible Section */}
        <ChartControls
          showInflationAdjusted={showInflationAdjusted}
          onShowInflationAdjustedChange={setShowInflationAdjusted}
          showTaxes={showTaxes}
          onShowTaxesChange={setShowTaxes}
          chartView={chartView}
          onChartViewChange={setChartView}
        />

        {/* Chart Container */}
        <div className={`w-full ${chartConfig.containerHeight}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: chartConfig.marginBottom,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="year"
                className="text-xs text-gray-600"
                tick={{ fontSize: 12 }}
                angle={chartConfig.xAxisAngle}
                textAnchor={chartConfig.xAxisTextAnchor}
                height={chartConfig.xAxisHeight}
              />
              <YAxis
                tickFormatter={formatYAxisTick}
                className="text-xs text-gray-600"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />

              {/* Area for cumulative deposits */}
              <Area
                type="monotone"
                dataKey="kumulativeEinzahlungen"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Kumulierte Einzahlungen"
              />

              {/* Area for total gains/interest */}
              <Area
                type="monotone"
                dataKey={zinsenKey}
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name={displayLabels.zinsen}
              />

              {/* Line for end capital */}
              <Line
                type="monotone"
                dataKey={endkapitalKey}
                stroke="#ef4444"
                strokeWidth={3}
                dot={chartConfig.endkapitalDot}
                name={displayLabels.endkapital}
              />

              {/* Line for taxes paid - conditional */}
              {showTaxes && (
                <Line
                  type="monotone"
                  dataKey="bezahlteSteuer"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={chartConfig.taxDot}
                  name="Bezahlte Steuern"
                />
              )}

              {/* Add zoom/brush functionality for detailed view */}
              {chartConfig.showBrush && (
                <Brush
                  dataKey="year"
                  height={30}
                  stroke="#8884d8"
                  startIndex={Math.max(0, chartData.length - 10)}
                  endIndex={chartData.length - 1}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Interpretation Guide */}
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
