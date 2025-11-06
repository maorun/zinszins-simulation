import { ResponsiveContainer, AreaChart } from 'recharts'
import { ChartAxesAndGrid } from './ChartAxesAndGrid'
import { ChartAreas } from './ChartAreas'
import { ChartLines } from './ChartLines'
import { ChartBrush } from './ChartBrush'

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
  endkapitalDot: { fill: string; strokeWidth: number; r: number } | false
  taxDot: { fill: string; strokeWidth: number; r: number } | false
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
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k €`
  }
  return `${value} €`
}

/**
 * Chart visualization component for capital development
 * Renders the recharts AreaChart with all configured series
 */
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
          <ChartAxesAndGrid
            xAxisAngle={chartConfig.xAxisAngle}
            xAxisTextAnchor={chartConfig.xAxisTextAnchor}
            xAxisHeight={chartConfig.xAxisHeight}
            formatYAxisTick={formatYAxisTick}
          />

          <ChartAreas zinsenKey={zinsenKey} zinsenLabel={zinsenLabel} />

          <ChartLines
            endkapitalKey={endkapitalKey}
            endkapitalLabel={endkapitalLabel}
            endkapitalDot={chartConfig.endkapitalDot}
            showTaxes={showTaxes}
            taxDot={chartConfig.taxDot}
          />

          <ChartBrush showBrush={chartConfig.showBrush} chartDataLength={chartData.length} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
