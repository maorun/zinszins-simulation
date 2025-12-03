import { useMemo } from 'react'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { generateFormId } from '../../utils/unique-id'

interface ModeSelectionRadioProps {
  comparisonMode: 'single' | 'comparison'
  onComparisonModeChange: (mode: 'single' | 'comparison') => void
}

export function ModeSelectionRadio({ comparisonMode, onComparisonModeChange }: ModeSelectionRadioProps) {
  const modeRadioId = useMemo(() => generateFormId('severance', 'mode-radio'), [])

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Berechnungsmodus</Label>
      <RadioGroup value={comparisonMode} onValueChange={mode => onComparisonModeChange(mode as 'single' | 'comparison')}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="single" id={`${modeRadioId}-single`} />
          <Label htmlFor={`${modeRadioId}-single`} className="text-sm cursor-pointer">
            Einzelberechnung - Ein Jahr
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="comparison" id={`${modeRadioId}-comparison`} />
          <Label htmlFor={`${modeRadioId}-comparison`} className="text-sm cursor-pointer">
            Jahresvergleich - Optimaler Zeitpunkt finden
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
