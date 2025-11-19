import { Line } from 'react-chartjs-2'
import { ChartOptions, TooltipItem, ChartDataset } from 'chart.js'
import { formatCurrency } from '../../utils/currency'
import '../../utils/chart-setup' // Ensure Chart.js is registered

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
 * Create deposit area dataset
 */
function createDepositDataset(kumulativeEinzahlungenData: number[]): ChartDataset<'line'> {
  return {
    label: 'Kumulierte Einzahlungen',
    data: kumulativeEinzahlungenData,
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    fill: true,
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 4,
    order: 3,
  }
}

/**
 * Create gains area dataset
 */
function createGainsDataset(
  zinsenLabel: string,
  zinsenData: number[],
  kumulativeEinzahlungenData: number[],
): ChartDataset<'line'> {
  return {
    label: zinsenLabel,
    data: zinsenData.map((zinsen, i) => zinsen + kumulativeEinzahlungenData[i]),
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.6)',
    fill: '-1', // Fill to previous dataset
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 4,
    order: 2,
  }
}

/**
 * Create end capital line dataset
 */
function createEndCapitalDataset(
  endkapitalLabel: string,
  chartData: ChartDataPoint[],
  endkapitalKey: string,
  chartConfig: ChartConfig,
): ChartDataset<'line'> {
  return {
    label: endkapitalLabel,
    data: chartData.map(d => d[endkapitalKey as keyof ChartDataPoint] as number),
    borderColor: '#ef4444',
    backgroundColor: 'transparent',
    borderWidth: 3,
    fill: false,
    tension: 0.4,
    pointRadius: chartConfig.endkapitalDot ? chartConfig.endkapitalDot.r : 0,
    pointHoverRadius: 6,
    pointBackgroundColor: chartConfig.endkapitalDot ? chartConfig.endkapitalDot.fill : '#ef4444',
    pointBorderWidth: chartConfig.endkapitalDot ? chartConfig.endkapitalDot.strokeWidth : 0,
    order: 1,
  }
}

/**
 * Create tax dataset
 */
function createTaxDataset(chartData: ChartDataPoint[], chartConfig: ChartConfig): ChartDataset<'line'> {
  return {
    label: 'Bezahlte Steuern',
    data: chartData.map(d => d.bezahlteSteuer),
    borderColor: '#f59e0b',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderDash: [5, 5],
    fill: false,
    tension: 0.4,
    pointRadius: chartConfig.taxDot ? chartConfig.taxDot.r : 0,
    pointHoverRadius: 4,
    pointBackgroundColor: chartConfig.taxDot ? chartConfig.taxDot.fill : '#f59e0b',
    pointBorderWidth: chartConfig.taxDot ? chartConfig.taxDot.strokeWidth : 0,
    order: 4,
  }
}

/**
 * Create datasets for the chart
 */
function createDatasets(
  chartData: ChartDataPoint[],
  endkapitalKey: string,
  zinsenKey: string,
  zinsenLabel: string,
  endkapitalLabel: string,
  chartConfig: ChartConfig,
  showTaxes: boolean,
): Array<ChartDataset<'line'>> {
  const kumulativeEinzahlungenData = chartData.map(d => d.kumulativeEinzahlungen)
  const zinsenData = chartData.map(d => d[zinsenKey as keyof ChartDataPoint] as number)

  const datasets: Array<ChartDataset<'line'>> = [
    createDepositDataset(kumulativeEinzahlungenData),
    createGainsDataset(zinsenLabel, zinsenData, kumulativeEinzahlungenData),
    createEndCapitalDataset(endkapitalLabel, chartData, endkapitalKey, chartConfig),
  ]

  // Add tax dataset if enabled
  if (showTaxes) {
    datasets.push(createTaxDataset(chartData, chartConfig))
  }

  return datasets
}

/**
 * Create tooltip callbacks
 */
function createTooltipCallbacks(
  chartData: ChartDataPoint[],
  zinsenKey: string,
  zinsenLabel: string,
) {
  const zinsenData = chartData.map(d => d[zinsenKey as keyof ChartDataPoint] as number)

  return {
    title: (context: Array<TooltipItem<'line'>>) => {
      return `📅 Jahr: ${context[0].label}`
    },
    label: (context: TooltipItem<'line'>) => {
      const label = context.dataset.label || ''
      const value = context.parsed.y

      // For stacked datasets, show the actual value (not cumulative)
      if (label === zinsenLabel) {
        const index = context.dataIndex
        const zinsenValue = zinsenData[index]
        return `${label}: ${formatCurrency(zinsenValue)}`
      }

      return `${label}: ${formatCurrency(value)}`
    },
    afterBody: (context: Array<TooltipItem<'line'>>) => {
      const index = context[0].dataIndex
      const dataPoint = chartData[index]

      if (dataPoint && dataPoint.endkapital > dataPoint.kumulativeEinzahlungen) {
        const returnPercent = ((dataPoint.endkapital / dataPoint.kumulativeEinzahlungen - 1) * 100).toFixed(1)
        return `\nGesamtrendite: +${returnPercent}%`
      }
      return ''
    },
  }
}

/**
 * Create plugins configuration
 */
function createPluginsConfig(
  chartConfig: ChartConfig,
  chartData: ChartDataPoint[],
  zinsenKey: string,
  zinsenLabel: string,
): ChartOptions<'line'>['plugins'] {
  return {
    legend: {
      display: true,
      position: 'bottom' as const,
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 16,
      boxPadding: 6,
      usePointStyle: true,
      callbacks: createTooltipCallbacks(chartData, zinsenKey, zinsenLabel),
    },
    zoom: chartConfig.showBrush
      ? {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: 'x' as const,
          },
          pan: {
            enabled: true,
            mode: 'x' as const,
          },
          limits: {
            x: { min: 'original', max: 'original' },
          },
        }
      : undefined,
  }
}

/**
 * Create scales configuration
 */
function createScalesConfig(chartConfig: ChartConfig): ChartOptions<'line'>['scales'] {
  return {
    x: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        maxRotation: chartConfig.xAxisAngle,
        minRotation: chartConfig.xAxisAngle,
        font: {
          size: 12,
        },
        color: '#4b5563',
      },
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        callback: function (value) {
          return formatYAxisTick(Number(value))
        },
        font: {
          size: 12,
        },
        color: '#4b5563',
      },
    },
  }
}

/**
 * Create chart options
 */
function createChartOptions(
  chartConfig: ChartConfig,
  chartData: ChartDataPoint[],
  zinsenKey: string,
  zinsenLabel: string,
): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: createPluginsConfig(chartConfig, chartData, zinsenKey, zinsenLabel),
    scales: createScalesConfig(chartConfig),
  }
}

/**
 * Chart visualization component for capital development
 * Renders Chart.js Line chart with all configured series
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

  // Prepare data for Chart.js
  const labels = chartData.map(d => d.year)

  const datasets = createDatasets(
    chartData,
    endkapitalKey,
    zinsenKey,
    zinsenLabel,
    endkapitalLabel,
    chartConfig,
    showTaxes,
  )

  const data = {
    labels,
    datasets,
  }

  const options = createChartOptions(chartConfig, chartData, zinsenKey, zinsenLabel)

  return (
    <div className={`w-full ${chartConfig.containerHeight}`}>
      <Line data={data} options={options} />
    </div>
  )
}
