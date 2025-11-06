import { useMemo } from 'react'
import type { ChartView } from './ChartControls'

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

/**
 * Configuration presets for chart views
 */
const CHART_VIEW_CONFIGS = {
  detailed: {
    containerHeight: 'h-[500px]',
    marginBottom: 60,
    xAxisAngle: -45,
    xAxisTextAnchor: 'end' as const,
    xAxisHeight: 60,
    endkapitalDot: { fill: '#ef4444', strokeWidth: 2, r: 4 } as const,
    taxDot: { fill: '#f59e0b', strokeWidth: 1, r: 2 } as const,
  },
  overview: {
    containerHeight: 'h-96',
    marginBottom: 20,
    xAxisAngle: 0,
    xAxisTextAnchor: 'middle' as const,
    xAxisHeight: 30,
    endkapitalDot: false as const,
    taxDot: false as const,
  },
}

/**
 * Hook to compute chart configuration based on view mode and data length
 * Extracted to reduce complexity in InteractiveChart component
 */
export function useChartConfig(chartView: ChartView, dataLength: number): ChartConfig {
  return useMemo(() => {
    const isDetailed = chartView === 'detailed'
    const preset = isDetailed ? CHART_VIEW_CONFIGS.detailed : CHART_VIEW_CONFIGS.overview

    return {
      isDetailedView: isDetailed,
      ...preset,
      showBrush: isDetailed && dataLength > 5,
    }
  }, [chartView, dataLength])
}
