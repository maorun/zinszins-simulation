import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

interface OtherIncomeEnableToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function OtherIncomeEnableToggle({ enabled, onToggle }: OtherIncomeEnableToggleProps) {
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="other-income-enabled" className="text-base font-medium">
          Andere Einkünfte aktivieren
        </Label>
        <Switch id="other-income-enabled" checked={enabled} onCheckedChange={onToggle} />
      </div>
      <p className="text-sm text-gray-600">
        Aktivieren Sie diese Option, um zusätzliche Einkommensquellen zu berücksichtigen.
      </p>
    </div>
  )
}
