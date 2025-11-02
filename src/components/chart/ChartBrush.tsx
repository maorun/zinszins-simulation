import { Brush } from 'recharts'

interface ChartBrushProps {
  showBrush: boolean
  chartDataLength: number
}

/**
 * Chart brush component for zoom/pan functionality
 * Renders the brush component when enabled
 */
export function ChartBrush({ showBrush, chartDataLength }: ChartBrushProps) {
  if (!showBrush) {
    return null
  }

  return (
    <Brush
      dataKey="year"
      height={30}
      stroke="#8884d8"
      startIndex={Math.max(0, chartDataLength - 10)}
      endIndex={chartDataLength - 1}
    />
  )
}
