import { XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChartTooltip } from './ChartTooltip'

interface ChartAxesAndGridProps {
  xAxisAngle: number
  xAxisTextAnchor: 'end' | 'middle'
  xAxisHeight: number
  formatYAxisTick: (value: number) => string
}

/**
 * Chart axes, grid, tooltip and legend component
 * Renders the structural elements of the chart
 */
export function ChartAxesAndGrid({
  xAxisAngle,
  xAxisTextAnchor,
  xAxisHeight,
  formatYAxisTick,
}: ChartAxesAndGridProps) {
  return (
    <>
      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
      <XAxis
        dataKey="year"
        className="text-xs text-gray-600"
        tick={{ fontSize: 12 }}
        angle={xAxisAngle}
        textAnchor={xAxisTextAnchor}
        height={xAxisHeight}
      />
      <YAxis
        tickFormatter={formatYAxisTick}
        className="text-xs text-gray-600"
        tick={{ fontSize: 12 }}
      />
      <Tooltip content={<ChartTooltip />} />
      <Legend />
    </>
  )
}
