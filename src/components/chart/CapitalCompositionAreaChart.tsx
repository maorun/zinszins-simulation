/**
 * Capital Composition Area Chart
 * Stacked area chart showing composition of capital: contributions, gains, and taxes
 */

import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { type ChartOptions, type ChartData } from 'chart.js'
import { formatCurrency } from '../../utils/currency'
import { Download } from 'lucide-react'
import { Button } from '../ui/button'
import '../../utils/chart-setup'

interface ChartDataPoint {
  year: number
  contributions: number
  gains: number
  taxes: number
  endkapital: number
  // Real values (inflation-adjusted)
  contributionsReal?: number
  gainsReal?: number
  taxesReal?: number
  endkapitalReal?: number
}

interface CapitalCompositionAreaChartProps {
  data: ChartDataPoint[]
  showRealValues?: boolean
  className?: string
}

/**
 * Create datasets for the chart
 */
function createDatasets(
  contributionsData: number[],
  gainsData: number[],
  taxesData: number[]
) {
  return [
    {
      label: 'Einzahlungen',
      data: contributionsData,
      backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
    {
      label: 'Gewinne (vor Steuern)',
      data: gainsData,
      backgroundColor: 'rgba(16, 185, 129, 0.7)', // Green
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
    {
      label: 'Bezahlte Steuern',
      data: taxesData,
      backgroundColor: 'rgba(239, 68, 68, 0.7)', // Red
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
  ]
}

/**
 * Create chart data configuration for stacked area chart
 */
function createChartData(
  data: ChartDataPoint[],
  showRealValues: boolean
): ChartData<'line'> {
  const years = data.map(d => d.year.toString())

  const contributionsData = data.map(d =>
    showRealValues && d.contributionsReal !== undefined ? d.contributionsReal : d.contributions
  )

  const gainsData = data.map(d =>
    showRealValues && d.gainsReal !== undefined ? d.gainsReal : d.gains
  )

  const taxesData = data.map(d =>
    showRealValues && d.taxesReal !== undefined ? d.taxesReal : d.taxes
  )

  return {
    labels: years,
    datasets: createDatasets(contributionsData, gainsData, taxesData),
  }
}

/**
 * Create tooltip callbacks
 */
function createTooltipCallbacks() {
  return {
    title: (tooltipItems: unknown[]) => {
      const items = tooltipItems as Array<{ label: string }>
      return `Jahr ${items[0].label}`
    },
    label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
      const label = context.dataset.label || ''
      const value = context.parsed.y
      return `${label}: ${formatCurrency(value)}`
    },
    footer: (tooltipItems: unknown[]) => {
      const items = tooltipItems as Array<{ parsed: { y: number } }>
      const total = items.reduce((sum, item) => sum + item.parsed.y, 0)
      return `Gesamt: ${formatCurrency(total)}`
    },
  }
}

/**
 * Create scales configuration
 */
function createScalesConfig(showRealValues: boolean) {
  return {
    x: {
      stacked: true,
      title: {
        display: true,
        text: 'Jahr',
      },
      grid: {
        display: false,
      },
    },
    y: {
      stacked: true,
      title: {
        display: true,
        text: showRealValues ? 'Kapital (real, inflationsbereinigt)' : 'Kapital (nominal)',
      },
      ticks: {
        callback: (value: unknown) => {
          const numValue = typeof value === 'number' ? value : 0
          if (numValue >= 1000000) {
            return `${(numValue / 1000000).toFixed(1)}M €`
          } else if (numValue >= 1000) {
            return `${(numValue / 1000).toFixed(0)}k €`
          }
          return `${numValue} €`
        },
      },
    },
  }
}

/**
 * Create legend configuration
 */
function createLegendConfig() {
  return {
    display: true,
    position: 'top' as const,
    onClick: (_e: unknown, legendItem: { datasetIndex?: number }, legend: { chart: { getDatasetMeta: (i: number) => { hidden: boolean | null }; data: { datasets: Array<{ hidden?: boolean }> }; update: () => void } }) => {
      const index = legendItem.datasetIndex
      if (index === undefined) return

      const chart = legend.chart
      const meta = chart.getDatasetMeta(index)
      const isCurrentlyHidden = meta.hidden === null ? chart.data.datasets[index].hidden || false : meta.hidden

      meta.hidden = !isCurrentlyHidden
      chart.update()
    },
  }
}

/**
 * Create chart options
 */
function createChartOptions(showRealValues: boolean): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: createLegendConfig(),
      tooltip: {
        callbacks: createTooltipCallbacks(),
      },
    },
    scales: createScalesConfig(showRealValues),
  }
}

/**
 * Export chart as PNG
 */
function exportChartAsPNG(chartId: string, filename: string) {
  const canvas = document.getElementById(chartId) as HTMLCanvasElement
  if (!canvas) return

  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

/**
 * Main Capital Composition Area Chart component
 */
export function CapitalCompositionAreaChart({
  data,
  showRealValues = false,
  className = '',
}: CapitalCompositionAreaChartProps) {
  const chartData = useMemo(() => createChartData(data, showRealValues), [data, showRealValues])
  const chartOptions = useMemo(() => createChartOptions(showRealValues), [showRealValues])
  const chartId = 'capital-composition-area-chart'

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    exportChartAsPNG(chartId, `kapitalzusammensetzung-${timestamp}.png`)
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Kapitalzusammensetzung</h3>
          <p className="text-sm text-muted-foreground">
            Gestapelte Darstellung von Einzahlungen, Gewinnen und Steuern
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          PNG Export
        </Button>
      </div>
      <div style={{ height: '400px' }}>
        <Line id={chartId} data={chartData} options={chartOptions} />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        💡 Tipp: Klicken Sie auf Legendeneinträge, um Bereiche ein-/auszublenden
      </p>
    </div>
  )
}
