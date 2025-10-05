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
} from 'recharts'
import { formatCurrency } from '../utils/currency'
import type { SimulationResult } from '../utils/simulate'

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
 * Custom tooltip formatter for chart data
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border">
        <p className="font-semibold text-gray-800">{`Jahr: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    )
  }
  return null
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

  // Determine which values to show based on showRealValues prop
  const endkapitalKey = showRealValues ? 'endkapitalReal' : 'endkapital'
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Kapitalentwicklung
          {showRealValues && <span className="text-sm text-gray-600">(inflationsbereinigt)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="year"
                className="text-xs text-gray-600"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatYAxisTick}
                className="text-xs text-gray-600"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Area for cumulative deposits */}
              <Area
                type="monotone"
                dataKey="kumulativeEinzahlungen"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name="Kumulierte Einzahlungen"
              />

              {/* Area for total gains/interest */}
              <Area
                type="monotone"
                dataKey="zinsen"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
                name="Zinsen/Gewinne"
              />

              {/* Line for end capital */}
              <Line
                type="monotone"
                dataKey={endkapitalKey}
                stroke="#ff7c7c"
                strokeWidth={3}
                dot={{ fill: '#ff7c7c', strokeWidth: 2, r: 4 }}
                name="Endkapital"
              />

              {/* Line for taxes paid */}
              <Line
                type="monotone"
                dataKey="bezahlteSteuer"
                stroke="#ffc658"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#ffc658', strokeWidth: 1, r: 2 }}
                name="Bezahlte Steuern"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 text-xs text-gray-600 space-y-1">
          <p>
            💡
            {' '}
            <strong>Interpretation:</strong>
          </p>
          <p>
            •
            {' '}
            <span className="text-blue-600">Blaue Fläche:</span>
            {' '}
            Ihre kumulierten Einzahlungen über Zeit
          </p>
          <p>
            •
            {' '}
            <span className="text-green-600">Grüne Fläche:</span>
            {' '}
            Zinsen und Kapitalgewinne
          </p>
          <p>
            •
            {' '}
            <span className="text-red-600">Rote Linie:</span>
            {' '}
            Gesamtes Endkapital (Einzahlungen + Gewinne)
          </p>
          <p>
            •
            {' '}
            <span className="text-yellow-600">Gelbe gestrichelte Linie:</span>
            {' '}
            Bezahlte Steuern
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default InteractiveChart
