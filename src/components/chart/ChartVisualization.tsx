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
import { ChartTooltip } from './ChartTooltip'

interface ChartDataPoint {
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

interface ChartConfig {
  isDetailedView: boolean
  containerHeight: string
  marginBottom: number
  xAxisAngle: number
  xAxisTextAnchor: 'end' | 'middle'
  xAxisHeight: number
  endkapitalDot: { fill: string, strokeWidth: number, r: number } | false
  taxDot: { fill: string, strokeWidth: number, r: number } | false
  showBrush: boolean
}

interface ChartVisualizationProps {
  chartData: ChartDataPoint[]
  chartConfig: ChartConfig
  showInflationAdjusted: boolean
  showTaxes: boolean
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

/**
 * Chart visualization component for capital development
 * Renders the recharts AreaChart with all configured series
 */
// eslint-disable-next-line max-lines-per-function -- Large component function
export function ChartVisualization({
  chartData,
  chartConfig,
  showInflationAdjusted,
  showTaxes,
}: ChartVisualizationProps) {
  const endkapitalKey = showInflationAdjusted ? 'endkapitalReal' : 'endkapital'
  const zinsenKey = showInflationAdjusted ? 'zinsenReal' : 'zinsen'

  const zinsenLabel = showInflationAdjusted ? 'Zinsen/Gewinne (real)' : 'Zinsen/Gewinne'
  const endkapitalLabel = showInflationAdjusted ? 'Endkapital (real)' : 'Endkapital'

  return (
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
            name={zinsenLabel}
          />

          {/* Line for end capital */}
          <Line
            type="monotone"
            dataKey={endkapitalKey}
            stroke="#ef4444"
            strokeWidth={3}
            dot={chartConfig.endkapitalDot}
            name={endkapitalLabel}
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
  )
}
