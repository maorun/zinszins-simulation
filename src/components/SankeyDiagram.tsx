import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Chart as ChartJS } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { SankeyController, Flow } from 'chartjs-chart-sankey'
import { useMemo, useState } from 'react'
import { Slider } from './ui/slider'
import { Label } from './ui/label'
import type { SimulationResult } from '../utils/simulate'
import { formatCurrency } from '../utils/currency'

// Register Sankey chart type
ChartJS.register(SankeyController, Flow)

interface SankeyNode {
  id: string
  label: string
  color?: string
}

interface SankeyFlow {
  from: string
  to: string
  flow: number
  color?: string
}

interface SankeyData {
  nodes: SankeyNode[]
  flows: SankeyFlow[]
}

interface SankeyDiagramProps {
  simulationData: SimulationResult
  title?: string
  mode?: 'savings' | 'withdrawal'
  className?: string
}

interface TooltipContext {
  dataIndex: number
}

interface ChartContext {
  dataIndex: number
}

/**
 * Prepare Sankey diagram data from simulation results for a specific year
 */
function prepareSankeyDataForYear(
  yearData: {
    startkapital: number
    zinsen: number
    endkapital: number
    bezahlteSteuer: number
  },
  mode: 'savings' | 'withdrawal'
): SankeyData {
  if (mode === 'savings') {
    return prepareSavingsPhaseSankeyData(yearData)
  }
  // Withdrawal phase will be implemented in future steps
  return { nodes: [], flows: [] }
}

/**
 * Create flow nodes for savings phase
 */
function createSavingsPhaseNodes(): SankeyNode[] {
  return [
    { id: 'beitraege', label: 'Beiträge', color: '#60a5fa' },
    { id: 'kapital', label: 'Kapital', color: '#34d399' },
    { id: 'gewinne', label: 'Gewinne', color: '#fbbf24' },
    { id: 'steuern', label: 'Steuern', color: '#ef4444' },
    { id: 'endkapital', label: 'Endkapital', color: '#8b5cf6' },
  ]
}

/**
 * Create flow connections for savings phase
 */
function createSavingsPhaseFlows(yearData: {
  startkapital: number
  zinsen: number
  endkapital: number
  bezahlteSteuer: number
}): SankeyFlow[] {
  const contributions = yearData.startkapital > 0 ? yearData.zinsen : yearData.startkapital
  const gains = yearData.zinsen
  const taxes = yearData.bezahlteSteuer
  const netCapital = yearData.endkapital

  const flows: SankeyFlow[] = []

  // Contributions flow to capital
  if (contributions > 0) {
    flows.push({
      from: 'beitraege',
      to: 'kapital',
      flow: contributions,
      color: 'rgba(96, 165, 250, 0.6)',
    })
  }

  // Gains flow to capital
  if (gains > 0) {
    flows.push({
      from: 'gewinne',
      to: 'kapital',
      flow: gains,
      color: 'rgba(251, 191, 36, 0.6)',
    })
  }

  // Capital flows to taxes
  if (taxes > 0) {
    flows.push({
      from: 'kapital',
      to: 'steuern',
      flow: taxes,
      color: 'rgba(239, 68, 68, 0.6)',
    })
  }

  // Capital flows to end capital
  const flowToEndCapital = netCapital - yearData.startkapital
  if (flowToEndCapital > 0) {
    flows.push({
      from: 'kapital',
      to: 'endkapital',
      flow: flowToEndCapital,
      color: 'rgba(139, 92, 246, 0.6)',
    })
  }

  return flows
}

/**
 * Prepare Sankey data for savings phase
 */
function prepareSavingsPhaseSankeyData(yearData: {
  startkapital: number
  zinsen: number
  endkapital: number
  bezahlteSteuer: number
}): SankeyData {
  return {
    nodes: createSavingsPhaseNodes(),
    flows: createSavingsPhaseFlows(yearData),
  }
}

/**
 * Prepare Sankey diagram data from simulation results
 * For savings phase: Income → Savings → Investments → Taxes
 * For withdrawal phase: Portfolio → Withdrawals → Expenses → Taxes
 */
function prepareSankeyData(
  simulationData: SimulationResult,
  year: number,
  mode: 'savings' | 'withdrawal'
): SankeyData {
  const yearData = simulationData[year]
  if (!yearData) {
    return { nodes: [], flows: [] }
  }

  return prepareSankeyDataForYear(yearData, mode)
}

/**
 * Convert prepared Sankey data to Chart.js format
 */
function convertToChartData(sankeyData: SankeyData) {
  const { nodes, flows } = sankeyData

  return {
    datasets: [
      {
        data: flows.map(flow => ({
          from: flow.from,
          to: flow.to,
          flow: flow.flow,
        })),
        colorFrom: (c: ChartContext) => {
          const flow = flows[c.dataIndex]
          return flow?.color || 'rgba(96, 165, 250, 0.6)'
        },
        colorTo: (c: ChartContext) => {
          const flow = flows[c.dataIndex]
          return flow?.color || 'rgba(96, 165, 250, 0.6)'
        },
        labels: nodes.reduce(
          (acc, node) => {
            acc[node.id] = node.label
            return acc
          },
          {} as Record<string, string>
        ),
        size: 'max' as const,
        borderWidth: 0,
      },
    ],
  }
}

/**
 * Renders the year selector slider
 */
function YearSelector({
  years,
  selectedYear,
  onYearChange,
}: {
  years: number[]
  selectedYear: number
  onYearChange: (year: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sankey-year-slider">
        Jahr: <span className="font-semibold">{selectedYear}</span>
      </Label>
      <Slider
        id="sankey-year-slider"
        min={years[0]}
        max={years[years.length - 1]}
        step={1}
        value={[selectedYear]}
        onValueChange={([value]) => onYearChange(value)}
        className="w-full"
      />
    </div>
  )
}

/**
 * Renders the flow legend
 */
function FlowLegend({ nodes }: { nodes: SankeyNode[] }) {
  return (
    <div className="flex flex-wrap gap-4 justify-center text-sm">
      {nodes.map(node => (
        <div key={node.id} className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: node.color }} />
          <span>{node.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Renders the Sankey chart or empty state
 */
function SankeyChartDisplay({
  sankeyData,
  chartData,
  chartOptions,
  selectedYear,
}: {
  sankeyData: SankeyData
  chartData: ReturnType<typeof convertToChartData>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartOptions: any
  selectedYear: number
}) {
  return (
    <div className="w-full" style={{ height: '400px' }}>
      {sankeyData.flows.length > 0 ? (
        <Chart type="sankey" data={chartData} options={chartOptions} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Keine Daten für das Jahr {selectedYear} verfügbar
        </div>
      )}
    </div>
  )
}

/**
 * Custom hook to manage Sankey diagram state and data
 */
function useSankeyDiagram(simulationData: SimulationResult, mode: 'savings' | 'withdrawal') {
  const years = Object.keys(simulationData)
    .map(Number)
    .sort((a, b) => a - b)

  const [selectedYear, setSelectedYear] = useState(years[0] || 2024)

  const sankeyData = useMemo(
    () => prepareSankeyData(simulationData, selectedYear, mode),
    [simulationData, selectedYear, mode]
  )

  const chartData = useMemo(() => convertToChartData(sankeyData), [sankeyData])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipContext) => {
              const flow = sankeyData.flows[context.dataIndex]
              if (!flow) return ''
              return `${flow.from} → ${flow.to}: ${formatCurrency(flow.flow)}`
            },
          },
        },
      },
    }),
    [sankeyData]
  )

  return {
    years,
    selectedYear,
    setSelectedYear,
    sankeyData,
    chartData,
    chartOptions,
  }
}

/**
 * Interactive Sankey Diagram Component
 * 
 * Visualizes financial flows in the retirement planning calculator:
 * - Savings phase: Income → Savings → Investments → Taxes
 * - Withdrawal phase: Portfolio → Withdrawals → Expenses → Taxes
 */
export function SankeyDiagram({ simulationData, title, mode = 'savings', className = '' }: SankeyDiagramProps) {
  const { years, selectedYear, setSelectedYear, sankeyData, chartData, chartOptions } = useSankeyDiagram(
    simulationData,
    mode
  )

  if (years.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💸 {title || 'Geldfluss-Visualisierung'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <YearSelector years={years} selectedYear={selectedYear} onYearChange={setSelectedYear} />
        <SankeyChartDisplay
          sankeyData={sankeyData}
          chartData={chartData}
          chartOptions={chartOptions}
          selectedYear={selectedYear}
        />
        <FlowLegend nodes={sankeyData.nodes} />
      </CardContent>
    </Card>
  )
}
