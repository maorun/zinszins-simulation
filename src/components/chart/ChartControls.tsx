import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'

type ChartView = 'overview' | 'detailed'

interface ChartControlsProps {
  showInflationAdjusted: boolean
  onInflationAdjustedChange: (value: boolean) => void
  showTaxes: boolean
  onShowTaxesChange: (value: boolean) => void
  chartView: ChartView
  onChartViewChange: (view: ChartView) => void
}

export function ChartControls({
  showInflationAdjusted,
  onInflationAdjustedChange,
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
          <div className="flex items-center space-x-2">
            <Switch
              id="inflation-adjusted"
              checked={showInflationAdjusted}
              onCheckedChange={onInflationAdjustedChange}
            />
            <Label htmlFor="inflation-adjusted" className="text-sm">
              Real (inflationsbereinigt)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-taxes"
              checked={showTaxes}
              onCheckedChange={onShowTaxesChange}
            />
            <Label htmlFor="show-taxes" className="text-sm">
              Steuern anzeigen
            </Label>
          </div>

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
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
