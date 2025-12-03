import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'
import {
  generateTaxProgressionData,
  getTaxZoneColor,
  getTaxZoneLabel,
  type TaxProgressionDataPoint,
} from '../utils/tax-progression'
import { formatCurrency } from '../utils/currency'
import { useFormId } from '../utils/unique-id'
import '../utils/chart-setup' // Ensure Chart.js is registered

interface TaxProgressionVisualizationProps {
  /**
   * Basic tax allowance (Grundfreibetrag) in euros
   * Default: 11604 (2024 value for individuals)
   */
  grundfreibetrag?: number
}

type ViewMode = 'rates' | 'amounts' | 'both'

/**
 * Info message component
 */
function InfoMessage({ grundfreibetrag }: { grundfreibetrag: number }) {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">📈 Interaktive Visualisierung</p>
      <p className="text-xs text-blue-800">
        Diese Visualisierung zeigt, wie sich Durchschnittssteuersatz und Grenzsteuersatz mit steigendem Einkommen
        entwickeln. Der Grundfreibetrag von {formatCurrency(grundfreibetrag)} wird berücksichtigt.
      </p>
    </div>
  )
}

/**
 * Input fields component
 */
function InputFields({
  maxIncome,
  setMaxIncome,
  highlightIncome,
  setHighlightIncome,
}: {
  maxIncome: number
  setMaxIncome: (value: number) => void
  highlightIncome: number | null
  setHighlightIncome: (value: number | null) => void
}) {
  const maxIncomeId = useFormId('tax-progression', 'max-income')
  const highlightIncomeId = useFormId('tax-progression', 'highlight-income')

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={maxIncomeId}>Maximales Einkommen</Label>
        <Input
          id={maxIncomeId}
          type="number"
          min={50000}
          max={1000000}
          step={10000}
          value={maxIncome}
          onChange={e => setMaxIncome(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={highlightIncomeId}>Beispiel-Einkommen (optional)</Label>
        <Input
          id={highlightIncomeId}
          type="number"
          min={0}
          max={maxIncome}
          step={1000}
          value={highlightIncome ?? ''}
          onChange={e => setHighlightIncome(e.target.value ? Number(e.target.value) : null)}
          placeholder="z.B. 50000"
        />
      </div>
    </div>
  )
}

/**
 * View mode selector component
 */
function ViewModeSelector({ viewMode, setViewMode }: { viewMode: ViewMode; setViewMode: (value: ViewMode) => void }) {
  const viewModeId = useFormId('tax-progression', 'view-mode')

  return (
    <div className="space-y-2">
      <Label htmlFor={viewModeId}>Ansichtsmodus</Label>
      <RadioTileGroup
        name={viewModeId}
        value={viewMode}
        onValueChange={value => setViewMode(value as ViewMode)}
        className="grid gap-2 md:grid-cols-3"
      >
        <RadioTile value="both" label="Steuersätze & Beträge">
          Zeigt sowohl Steuersätze als auch absolute Beträge
        </RadioTile>
        <RadioTile value="rates" label="Nur Steuersätze">
          Zeigt nur Durchschnitts- und Grenzsteuersatz
        </RadioTile>
        <RadioTile value="amounts" label="Nur Steuerbeträge">
          Zeigt nur die absoluten Steuerbeträge in Euro
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

/**
 * Configuration controls component
 */
function ConfigurationControls({
  maxIncome,
  setMaxIncome,
  highlightIncome,
  setHighlightIncome,
  viewMode,
  setViewMode,
}: {
  maxIncome: number
  setMaxIncome: (value: number) => void
  highlightIncome: number | null
  setHighlightIncome: (value: number | null) => void
  viewMode: ViewMode
  setViewMode: (value: ViewMode) => void
}) {
  return (
    <>
      <InputFields
        maxIncome={maxIncome}
        setMaxIncome={setMaxIncome}
        highlightIncome={highlightIncome}
        setHighlightIncome={setHighlightIncome}
      />
      <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
    </>
  )
}

/**
 * Highlighted point information component
 */
function HighlightedPointInfo({ point }: { point: TaxProgressionDataPoint }) {
  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h4 className="font-medium text-amber-900 mb-3">💡 Steuerberechnung für {formatCurrency(point.income)}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-amber-800">Steuerzone:</span>
          <span className="font-medium text-amber-900">{getTaxZoneLabel(point.zone)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Steuerbetrag:</span>
          <span className="font-medium text-amber-900">{formatCurrency(point.taxAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Durchschnittssteuersatz:</span>
          <span className="font-medium text-amber-900">{point.averageTaxRate.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Grenzsteuersatz:</span>
          <span className="font-medium text-amber-900">{point.marginalTaxRate.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-amber-300">
          <span className="font-medium text-amber-900">Nettoeinkommen:</span>
          <span className="font-bold text-amber-900 text-lg">{formatCurrency(point.income - point.taxAmount)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-amber-300 text-xs text-amber-800">
        <p className="font-medium mb-1">ℹ️ Erklärung:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>Durchschnittssteuersatz:</strong> Durchschnittliche Steuerbelastung auf das gesamte Einkommen
          </li>
          <li>
            <strong>Grenzsteuersatz:</strong> Steuersatz auf den nächsten verdienten Euro
          </li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Tax zone legend component
 */
function TaxZoneLegend() {
  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3">📍 Steuerzonen-Übersicht</h4>
      <div className="grid gap-2 md:grid-cols-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getTaxZoneColor('grundfreibetrag') }} />
          <span className="text-gray-700">{getTaxZoneLabel('grundfreibetrag')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getTaxZoneColor('zone1') }} />
          <span className="text-gray-700">{getTaxZoneLabel('zone1')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getTaxZoneColor('zone2') }} />
          <span className="text-gray-700">{getTaxZoneLabel('zone2')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getTaxZoneColor('zone3') }} />
          <span className="text-gray-700">{getTaxZoneLabel('zone3')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getTaxZoneColor('reichensteuer') }} />
          <span className="text-gray-700">{getTaxZoneLabel('reichensteuer')}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Prepare chart data based on progression data and view mode
 */
function prepareChartData(progressionData: TaxProgressionDataPoint[], viewMode: ViewMode) {
  const incomeLabels = progressionData.map(d => `${(d.income / 1000).toFixed(0)}k €`)
  const datasets = []

  if (viewMode === 'rates' || viewMode === 'both') {
    datasets.push({
      label: 'Durchschnittssteuersatz (%)',
      data: progressionData.map(d => d.averageTaxRate),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      yAxisID: 'y-rate',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      fill: false,
    })

    datasets.push({
      label: 'Grenzsteuersatz (%)',
      data: progressionData.map(d => d.marginalTaxRate),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      yAxisID: 'y-rate',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      fill: false,
      borderDash: [5, 5],
    })
  }

  if (viewMode === 'amounts' || viewMode === 'both') {
    datasets.push({
      label: 'Steuerbetrag (€)',
      data: progressionData.map(d => d.taxAmount),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      yAxisID: 'y-amount',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      fill: true,
    })
  }

  return {
    labels: incomeLabels,
    datasets,
  }
}

/**
 * Create Y-axis scales configuration
 */
function createYAxisScales(viewMode: ViewMode) {
  return {
    'y-rate': {
      type: 'linear' as const,
      display: viewMode === 'rates' || viewMode === 'both',
      position: 'left' as const,
      title: {
        display: true,
        text: 'Steuersatz (%)',
      },
      min: 0,
      max: 50,
      grid: {
        drawOnChartArea: viewMode === 'rates',
      },
    },
    'y-amount': {
      type: 'linear' as const,
      display: viewMode === 'amounts' || viewMode === 'both',
      position: 'right' as const,
      title: {
        display: true,
        text: 'Steuerbetrag (€)',
      },
      min: 0,
      grid: {
        drawOnChartArea: viewMode === 'amounts',
      },
      ticks: {
        callback: (value: number | string) => {
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
 * Create tooltip configuration
 */
function createTooltipConfig(progressionData: TaxProgressionDataPoint[]) {
  return {
    callbacks: {
      title: (context: Array<{ dataIndex: number }>) => {
        const index = context[0].dataIndex
        return `Einkommen: ${formatCurrency(progressionData[index].income)}`
      },
      label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
        const label = context.dataset.label || ''
        const value = context.parsed.y
        if (label.includes('Steuerbetrag')) {
          return `${label}: ${formatCurrency(value)}`
        } else {
          return `${label}: ${value.toFixed(2)}%`
        }
      },
      afterBody: (context: Array<{ dataIndex: number }>) => {
        const index = context[0].dataIndex
        const point = progressionData[index]
        return ['', `Zone: ${getTaxZoneLabel(point.zone)}`, `Netto: ${formatCurrency(point.income - point.taxAmount)}`]
      },
    },
  }
}

/**
 * Create chart options
 */
function createChartOptions(progressionData: TaxProgressionDataPoint[], viewMode: ViewMode): ChartOptions<'line'> {
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
        position: 'top' as const,
      },
      tooltip: createTooltipConfig(progressionData),
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Zu versteuerndes Einkommen',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      ...createYAxisScales(viewMode),
    },
  }
}

/**
 * Tax Progression Visualization Component
 *
 * Displays an interactive visualization of the German progressive income tax system,
 * showing how tax rates and amounts change across different income levels.
 */
export function TaxProgressionVisualization({ grundfreibetrag = 11604 }: TaxProgressionVisualizationProps) {
  const [maxIncome, setMaxIncome] = useState(300000)
  const [viewMode, setViewMode] = useState<ViewMode>('both')
  const [highlightIncome, setHighlightIncome] = useState<number | null>(null)

  // Generate tax progression data
  const progressionData = useMemo(
    () => generateTaxProgressionData(0, maxIncome, 100, grundfreibetrag),
    [maxIncome, grundfreibetrag],
  )

  // Find highlighted point if income is specified
  const highlightedPoint = useMemo(() => {
    if (highlightIncome === null || highlightIncome < 0) return null
    return progressionData.find(d => Math.abs(d.income - highlightIncome) < maxIncome / 100)
  }, [highlightIncome, progressionData, maxIncome])

  // Prepare chart data
  const chartData = useMemo(() => prepareChartData(progressionData, viewMode), [progressionData, viewMode])

  // Chart options
  const chartOptions = useMemo(() => createChartOptions(progressionData, viewMode), [progressionData, viewMode])

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          📊 Steuerprogression-Visualisierung
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage grundfreibetrag={grundfreibetrag} />

              <ConfigurationControls
                maxIncome={maxIncome}
                setMaxIncome={setMaxIncome}
                highlightIncome={highlightIncome}
                setHighlightIncome={setHighlightIncome}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />

              {/* Chart */}
              <div className="h-[400px] w-full">
                <Line data={chartData} options={chartOptions} />
              </div>

              {highlightedPoint && <HighlightedPointInfo point={highlightedPoint} />}

              <TaxZoneLegend />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
