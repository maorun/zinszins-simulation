/**
 * Year-over-Year Bar Chart
 * Shows annual breakdown of contributions, gains, and taxes
 */

import { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { type ChartOptions, type ChartData } from 'chart.js'
import { formatCurrency } from '../../utils/currency'
import { Download } from 'lucide-react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import '../../utils/chart-setup'

interface ChartDataPoint {
  year: number
  contributions: number
  gains: number
  taxes: number
  // Real values (inflation-adjusted)
  contributionsReal?: number
  gainsReal?: number
  taxesReal?: number
}

interface YearOverYearBarChartProps {
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
  taxesData: number[],
  isStacked: boolean
) {
  return [
    {
      label: 'Einzahlungen',
      data: contributionsData,
      backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      stack: isStacked ? 'stack' : '0',
    },
    {
      label: 'Gewinne',
      data: gainsData,
      backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
      stack: isStacked ? 'stack' : '1',
    },
    {
      label: 'Steuern',
      data: taxesData,
      backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 1,
      stack: isStacked ? 'stack' : '2',
    },
  ]
}

/**
 * Create chart data configuration for grouped/stacked bar chart
 */
function createChartData(
  data: ChartDataPoint[],
  showRealValues: boolean,
  isStacked: boolean
): ChartData<'bar'> {
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
    datasets: createDatasets(contributionsData, gainsData, taxesData, isStacked),
  }
}

/**
 * Create tooltip callbacks
 */
function createTooltipCallbacks(isStacked: boolean) {
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
      if (isStacked) {
        const items = tooltipItems as Array<{ parsed: { y: number } }>
        const total = items.reduce((sum, item) => sum + item.parsed.y, 0)
        return `Gesamt: ${formatCurrency(total)}`
      }
      return ''
    },
  }
}

/**
 * Create chart options
 */
function createChartOptions(showRealValues: boolean, isStacked: boolean): ChartOptions<'bar'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: createTooltipCallbacks(isStacked),
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Jahr',
        },
        grid: {
          display: false,
        },
      },
      y: {
        stacked: isStacked,
        title: {
          display: true,
          text: showRealValues ? 'Betrag (real, inflationsbereinigt)' : 'Betrag (nominal)',
        },
        ticks: {
          callback: (value) => {
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
    },
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
 * Chart header with title and controls
 */
function ChartHeader({
  isStacked,
  onStackedChange,
  onExport,
}: {
  isStacked: boolean
  onStackedChange: (checked: boolean) => void
  onExport: () => void
}) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold">Jahr-zu-Jahr Vergleich</h3>
        <p className="text-sm text-muted-foreground">
          Jährliche Entwicklung von Einzahlungen, Gewinnen und Steuern
        </p>
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Switch
            id="stacked-mode"
            checked={isStacked}
            onCheckedChange={onStackedChange}
          />
          <Label htmlFor="stacked-mode" className="text-sm cursor-pointer">
            {isStacked ? 'Gestapelt' : 'Gruppiert'}
          </Label>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          PNG Export
        </Button>
      </div>
    </div>
  )
}

/**
 * Main Year-over-Year Bar Chart component
 */
export function YearOverYearBarChart({
  data,
  showRealValues = false,
  className = '',
}: YearOverYearBarChartProps) {
  const [isStacked, setIsStacked] = useState(true)
  const chartId = 'year-over-year-bar-chart'

  const chartData = useMemo(
    () => createChartData(data, showRealValues, isStacked),
    [data, showRealValues, isStacked]
  )
  const chartOptions = useMemo(
    () => createChartOptions(showRealValues, isStacked),
    [showRealValues, isStacked]
  )

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    const mode = isStacked ? 'gestapelt' : 'gruppiert'
    exportChartAsPNG(chartId, `jahr-zu-jahr-${mode}-${timestamp}.png`)
  }

  return (
    <div className={className}>
      <ChartHeader
        isStacked={isStacked}
        onStackedChange={setIsStacked}
        onExport={handleExport}
      />
      <div style={{ height: '400px' }}>
        <Bar id={chartId} data={chartData} options={chartOptions} />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        💡 Tipp: Wechseln Sie zwischen gestapelter und gruppierter Darstellung
      </p>
    </div>
  )
}
