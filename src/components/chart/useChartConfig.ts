import { useMemo } from 'react'
import type { ChartView } from './ChartControls'

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

/**
 * Hook to compute chart configuration based on view mode and data length
 * Extracted to reduce complexity in InteractiveChart component
 */
export function useChartConfig(chartView: ChartView, dataLength: number): ChartConfig {
  return useMemo(() => {
    const isDetailed = chartView === 'detailed'
    
    return {
      isDetailedView: isDetailed,
      containerHeight: isDetailed ? 'h-[500px]' : 'h-96',
      marginBottom: isDetailed ? 60 : 20,
      xAxisAngle: isDetailed ? -45 : 0,
      xAxisTextAnchor: isDetailed ? 'end' : 'middle',
      xAxisHeight: isDetailed ? 60 : 30,
      endkapitalDot: isDetailed ? { fill: '#ef4444', strokeWidth: 2, r: 4 } : false,
      taxDot: isDetailed ? { fill: '#f59e0b', strokeWidth: 1, r: 2 } : false,
      showBrush: isDetailed && dataLength > 5,
    }
  }, [chartView, dataLength])
}
