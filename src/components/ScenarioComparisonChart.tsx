/**
 * Scenario Comparison Chart Component
 * Displays overlaid line chart comparing capital development across multiple scenarios
 */

import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { formatCurrency } from '../utils/currency'
import type { CapitalGrowthComparison } from '../types/capital-growth-comparison'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ScenarioComparisonChartProps {
  comparison: CapitalGrowthComparison
  showRealValues?: boolean
}

/**
 * Chart component showing capital development for multiple scenarios
 */
export function ScenarioComparisonChart({
  comparison,
  showRealValues = false,
}: ScenarioComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!comparison.results || comparison.results.length === 0) {
      return null
    }

    // Extract all unique years from all scenarios
    const allYears = new Set<number>()
    comparison.results.forEach((result) => {
      result.yearlyData.forEach((data) => {
        allYears.add(data.jahr)
      })
    })

    const years = Array.from(allYears).sort((a, b) => a - b)

    // Create dataset for each scenario
    const datasets = comparison.results.map((result) => {
      const scenario = comparison.scenarios.find((s) => s.id === result.scenarioId)

      // Create a map for quick lookup
      const dataMap = new Map(result.yearlyData.map((d) => [d.jahr, d]))

      const data = years.map((year) => {
        const yearData = dataMap.get(year)
        if (!yearData) return null

        return showRealValues && yearData.endkapitalReal !== undefined
          ? yearData.endkapitalReal
          : yearData.endkapital
      })

      return {
        label: scenario?.name || result.scenarioId,
        data,
        borderColor: scenario?.color || '#3b82f6',
        backgroundColor: scenario?.color || '#3b82f6',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.1, // Slight curve
      }
    })

    return {
      labels: years.map((y) => y.toString()),
      datasets,
    }
  }, [comparison, showRealValues])

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              return `${label}: ${formatCurrency(value)}`
            },
          },
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
          title: {
            display: true,
            text: showRealValues ? 'Kapital (real, inflationsbereinigt)' : 'Kapital (nominal)',
          },
          ticks: {
            callback: (value) => {
              return formatCurrency(Number(value))
            },
          },
          beginAtZero: true,
        },
      },
    }),
    [showRealValues]
  )

  if (!chartData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Daten zur Visualisierung verfügbar
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
