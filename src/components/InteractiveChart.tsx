import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Brush,
  Line,
} from 'recharts'
import type { SimulationResult } from '../utils/simulate'
import { useState } from 'react'
import { prepareChartData, formatYAxisTick } from '../utils/chart-helpers'
import { ChartTooltip } from './chart/ChartTooltip'
import { ChartControls } from './chart/ChartControls'
import { ChartInterpretationGuide } from './chart/ChartInterpretationGuide'

interface InteractiveChartProps {
  simulationData: SimulationResult
  showRealValues?: boolean
  className?: string
}

type ChartView = 'overview' | 'detailed'

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
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Kapitalentwicklung
          {showInflationAdjusted && <span className="text-sm text-gray-600">(inflationsbereinigt)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interactive Controls */}
        <ChartControls
          showInflationAdjusted={showInflationAdjusted}
          onInflationAdjustedChange={setShowInflationAdjusted}
          showTaxes={showTaxes}
          onShowTaxesChange={setShowTaxes}
          chartView={chartView}
          onChartViewChange={setChartView}
        />

        {/* Chart Container */}
        <div className={`w-full ${chartView === 'detailed' ? 'h-[500px]' : 'h-96'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: chartView === 'detailed' ? 60 : 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="year"
                className="text-xs text-gray-600"
                tick={{ fontSize: 12 }}
                angle={chartView === 'detailed' ? -45 : 0}
                textAnchor={chartView === 'detailed' ? 'end' : 'middle'}
                height={chartView === 'detailed' ? 60 : 30}
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
                name={showInflationAdjusted ? 'Zinsen/Gewinne (real)' : 'Zinsen/Gewinne'}
              />

              {/* Line for end capital */}
              <Line
                type="monotone"
                dataKey={endkapitalKey}
                stroke="#ef4444"
                strokeWidth={3}
                dot={chartView === 'detailed' ? { fill: '#ef4444', strokeWidth: 2, r: 4 } : false}
                name={showInflationAdjusted ? 'Endkapital (real)' : 'Endkapital'}
              />

              {/* Line for taxes paid - conditional */}
              {showTaxes && (
                <Line
                  type="monotone"
                  dataKey="bezahlteSteuer"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={chartView === 'detailed' ? { fill: '#f59e0b', strokeWidth: 1, r: 2 } : false}
                  name="Bezahlte Steuern"
                />
              )}

              {/* Add zoom/brush functionality for detailed view */}
              {chartView === 'detailed' && chartData.length > 5 && (
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
