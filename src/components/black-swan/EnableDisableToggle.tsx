import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'

interface EnableDisableToggleProps {
  isEnabled: boolean
  onEnabledChange: (enabled: boolean) => void
  enabledRadioId: string
  disabledRadioId: string
}

/**
 * Toggle to enable/disable Black Swan scenarios
 */
export function EnableDisableToggle({
  isEnabled,
  onEnabledChange,
  enabledRadioId,
  disabledRadioId,
}: EnableDisableToggleProps) {
  const handleValueChange = (value: string) => {
    onEnabledChange(value === 'enabled')
  }

  return (
    <div className="space-y-3">
      <Label>Black Swan Szenario aktivieren</Label>
      <RadioGroup value={isEnabled ? 'enabled' : 'disabled'} onValueChange={handleValueChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disabled" id={disabledRadioId} />
          <Label htmlFor={disabledRadioId} className="font-normal cursor-pointer">
            Deaktiviert (Standard Monte Carlo)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="enabled" id={enabledRadioId} />
          <Label htmlFor={enabledRadioId} className="font-normal cursor-pointer">
            Aktiviert (Black Swan Szenario anwenden)
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
