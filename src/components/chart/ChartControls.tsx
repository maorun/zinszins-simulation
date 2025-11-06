import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { ChevronDown } from 'lucide-react'

export type ChartView = 'overview' | 'detailed'

export interface ChartControlsProps {
  showInflationAdjusted: boolean
  onShowInflationAdjustedChange: (value: boolean) => void
  showTaxes: boolean
  onShowTaxesChange: (value: boolean) => void
  chartView: ChartView
  onChartViewChange: (view: ChartView) => void
}

/**
 * Switch control with label
 */
function SwitchControl({
  id,
  checked,
  onCheckedChange,
  label,
}: {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
    </div>
  )
}

/**
 * View toggle buttons
 */
function ViewToggle({
  chartView,
  onChartViewChange,
}: {
  chartView: ChartView
  onChartViewChange: (view: ChartView) => void
}) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={chartView === 'overview' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChartViewChange('overview')}
      >
        Übersicht
      </Button>
      <Button
        variant={chartView === 'detailed' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChartViewChange('detailed')}
      >
        Detail
      </Button>
    </div>
  )
}

/**
 * Interactive controls for the chart component
 */
export function ChartControls({
  showInflationAdjusted,
  onShowInflationAdjustedChange,
  showTaxes,
  onShowTaxesChange,
  chartView,
  onChartViewChange,
}: ChartControlsProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          🎛️ Chart-Einstellungen
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SwitchControl
            id="inflation-adjusted"
            checked={showInflationAdjusted}
            onCheckedChange={onShowInflationAdjustedChange}
            label="Real (inflationsbereinigt)"
          />
          <SwitchControl
            id="show-taxes"
            checked={showTaxes}
            onCheckedChange={onShowTaxesChange}
            label="Steuern anzeigen"
          />
          <ViewToggle chartView={chartView} onChartViewChange={onChartViewChange} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
