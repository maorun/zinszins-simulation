import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'

interface EnableDisableControlProps {
  isEnabled: boolean
  onEnabledChange: (value: string) => void
  enabledRadioId: string
  disabledRadioId: string
}

/**
 * Radio group control to enable/disable inflation scenarios
 */
export const EnableDisableControl = ({
  isEnabled,
  onEnabledChange,
  enabledRadioId,
  disabledRadioId,
}: EnableDisableControlProps) => {
  return (
    <div>
      <Label className="text-sm font-medium">Inflationsszenario aktivieren</Label>
      <RadioGroup
        value={isEnabled ? 'enabled' : 'disabled'}
        onValueChange={onEnabledChange}
        className="mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="enabled" id={enabledRadioId} />
          <Label htmlFor={enabledRadioId} className="font-normal cursor-pointer">
            Aktiviert
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disabled" id={disabledRadioId} />
          <Label htmlFor={disabledRadioId} className="font-normal cursor-pointer">
            Deaktiviert
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
