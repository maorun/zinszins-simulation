import { formatCurrency } from '../utils/currency'
import { Line } from 'react-chartjs-2'
import { ChartOptions, TooltipItem } from 'chart.js'
import '../utils/chart-setup' // Ensure Chart.js is registered

interface ChartData {
  name: string
  Endkapital: number
  Einzahlungen: number
  Gewinne: number
}

interface SensitivityChartProps {
  data: ChartData[]
}

/**
 * Create plugins configuration for sensitivity chart
 */
function createSensitivityPluginsConfig(): ChartOptions<'line'>['plugins'] {
  return {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      bodyFont: {
        size: 12,
      },
      titleFont: {
        size: 12,
      },
      callbacks: {
        label: (context: TooltipItem<'line'>) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          return `${label}: ${formatCurrency(value)}`
        },
      },
    },
  }
}

/**
 * Create scales configuration for sensitivity chart
 */
function createSensitivityScalesConfig(): ChartOptions<'line'>['scales'] {
  return {
    x: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        font: {
          size: 12,
        },
      },
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 12,
        },
      },
    },
  }
}

/**
 * Create chart options for sensitivity chart
 */
function createChartOptions(): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: createSensitivityPluginsConfig(),
    scales: createSensitivityScalesConfig(),
  }
}

function SensitivityChart({ data }: SensitivityChartProps) {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        label: 'Endkapital',
        data: data.map(d => d.Endkapital),
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
      {
        label: 'Einzahlungen',
        data: data.map(d => d.Einzahlungen),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
      {
        label: 'Gewinne',
        data: data.map(d => d.Gewinne),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  }

  const options = createChartOptions()

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

export default SensitivityChart
