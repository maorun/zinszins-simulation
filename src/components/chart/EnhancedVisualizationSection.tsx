/**
 * Enhanced Visualization Section
 * Provides multiple chart views: Line Chart (existing), Area Chart, and Bar Chart
 */

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import type { SimulationResult } from '../../utils/simulate'
import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { CapitalCompositionAreaChart } from './CapitalCompositionAreaChart'
import { YearOverYearBarChart } from './YearOverYearBarChart'
import { prepareAreaChartData, prepareBarChartData } from '../../utils/chart-data-preparation'

interface EnhancedVisualizationSectionProps {
  simulationData: SimulationResult
  showRealValues?: boolean
  className?: string
}

type ChartType = 'area' | 'bar'

/**
 * Chart type selector buttons
 */
function ChartTypeSelector({
  activeChartType,
  onChartTypeChange,
}: {
  activeChartType: ChartType
  onChartTypeChange: (type: ChartType) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={activeChartType === 'area' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChartTypeChange('area')}
      >
        📈 Kapitalzusammensetzung
      </Button>
      <Button
        variant={activeChartType === 'bar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChartTypeChange('bar')}
      >
        📊 Jahr-zu-Jahr
      </Button>
    </div>
  )
}

/**
 * Real values toggle control
 */
function RealValuesToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2 ml-auto">
      <Switch id="enhanced-viz-real-values" checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor="enhanced-viz-real-values" className="text-sm cursor-pointer">
        Real (inflationsbereinigt)
      </Label>
    </div>
  )
}

/**
 * Usage hints section
 */
function UsageHints() {
  return (
    <div className="pt-4 border-t">
      <h4 className="text-sm font-semibold mb-2">💡 Verwendungshinweise</h4>
      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
        <li>
          <strong>Kapitalzusammensetzung:</strong> Zeigt die gestapelte Entwicklung von
          Einzahlungen, Gewinnen und Steuern über die Zeit
        </li>
        <li>
          <strong>Jahr-zu-Jahr:</strong> Vergleicht jährliche Einzahlungen, Gewinne und Steuern
          im Detail
        </li>
        <li>
          <strong>PNG Export:</strong> Jedes Diagramm kann als PNG-Datei heruntergeladen werden
        </li>
        <li>
          <strong>Inflationsbereinigung:</strong> Schalten Sie zwischen nominalen und realen
          Werten um
        </li>
      </ul>
    </div>
  )
}

/**
 * Chart display area
 */
function ChartDisplay({
  activeChartType,
  areaChartData,
  barChartData,
  showRealValues,
}: {
  activeChartType: ChartType
  areaChartData: ReturnType<typeof prepareAreaChartData>
  barChartData: ReturnType<typeof prepareBarChartData>
  showRealValues: boolean
}) {
  if (activeChartType === 'area') {
    return <CapitalCompositionAreaChart data={areaChartData} showRealValues={showRealValues} />
  }

  return <YearOverYearBarChart data={barChartData} showRealValues={showRealValues} />
}

/**
 * No data placeholder
 */
function NoDataPlaceholder({ className }: { className: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>📊 Erweiterte Visualisierungen</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Keine Daten verfügbar. Führen Sie zuerst eine Simulation durch.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Enhanced Visualization Section component
 * Shows advanced chart visualizations beyond the standard line chart
 */
export function EnhancedVisualizationSection({
  simulationData,
  showRealValues = false,
  className = '',
}: EnhancedVisualizationSectionProps) {
  const [activeChartType, setActiveChartType] = useState<ChartType>('area')
  const [showRealValuesState, setShowRealValuesState] = useState(showRealValues)

  // Prepare data for charts
  const areaChartData = useMemo(() => prepareAreaChartData(simulationData), [simulationData])
  const barChartData = useMemo(() => prepareBarChartData(simulationData), [simulationData])

  // Check if we have any data
  const hasData = Object.keys(simulationData).length > 0

  if (!hasData) {
    return <NoDataPlaceholder className={className} />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Erweiterte Visualisierungen
          {showRealValuesState && (
            <span className="text-sm text-muted-foreground">(inflationsbereinigt)</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
          <ChartTypeSelector
            activeChartType={activeChartType}
            onChartTypeChange={setActiveChartType}
          />
          <RealValuesToggle
            checked={showRealValuesState}
            onCheckedChange={setShowRealValuesState}
          />
        </div>

        {/* Chart Display */}
        <ChartDisplay
          activeChartType={activeChartType}
          areaChartData={areaChartData}
          barChartData={barChartData}
          showRealValues={showRealValuesState}
        />

        {/* Usage Hints */}
        <UsageHints />
      </CardContent>
    </Card>
  )
}
