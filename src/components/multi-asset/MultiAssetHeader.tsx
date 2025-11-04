import { CardHeader, CardTitle } from '../ui/card'
import { PieChart } from 'lucide-react'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

interface MultiAssetHeaderProps {
  /** Whether multi-asset portfolio is enabled */
  enabled: boolean
  /** Callback when enabled state changes */
  onEnabledChange: (enabled: boolean) => void
  /** Card nesting level for proper styling */
  nestingLevel: number
}

/**
 * Header section for multi-asset portfolio configuration with enable/disable toggle
 */
export function MultiAssetHeader({ enabled, onEnabledChange, nestingLevel }: MultiAssetHeaderProps) {
  return (
    <CardHeader nestingLevel={nestingLevel}>
      <CardTitle className="flex items-center gap-2">
        <PieChart className="h-5 w-5" />
        Multi-Asset Portfolio
      </CardTitle>
      <div className="pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="multiasset-enabled" className="text-sm font-medium">
              Multi-Asset Portfolio aktivieren
            </Label>
            <p className="text-xs text-gray-600">
              Erweiterte Portfolioallokation mit automatischem Rebalancing
            </p>
          </div>
          <Switch id="multiasset-enabled" checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
      </div>
    </CardHeader>
  )
}
