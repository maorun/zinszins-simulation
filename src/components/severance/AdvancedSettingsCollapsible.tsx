import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { SeveranceConfig } from '../../../helpers/abfindung'

interface AdvancedSettingsCollapsibleProps {
  config: SeveranceConfig
  onConfigChange: (updates: Partial<SeveranceConfig>) => void
}

export function AdvancedSettingsCollapsible({ config, onConfigChange }: AdvancedSettingsCollapsibleProps) {
  return (
    <details className="mt-4">
      <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
        Erweiterte Einstellungen
      </summary>
      <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
        <TaxRateField config={config} onConfigChange={onConfigChange} />
        <AllowanceField config={config} onConfigChange={onConfigChange} />
      </div>
    </details>
  )
}

function TaxRateField({ config, onConfigChange }: AdvancedSettingsCollapsibleProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">
        Kapitalertragsteuersatz (inkl. Soli)
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={config.capitalGainsTaxRate || 26.375}
          onChange={e => onConfigChange({ capitalGainsTaxRate: parseFloat(e.target.value) || 26.375 })}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
    </div>
  )
}

function AllowanceField({ config, onConfigChange }: AdvancedSettingsCollapsibleProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">
        Sparerpauschbetrag
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          min="0"
          step="100"
          value={config.capitalGainsTaxAllowance || 1000}
          onChange={e => onConfigChange({ capitalGainsTaxAllowance: parseFloat(e.target.value) || 1000 })}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground">€</span>
      </div>
    </div>
  )
}
