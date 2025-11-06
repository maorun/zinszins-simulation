import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { InfoIcon } from './InfoIcon'

type EventPhase = 'sparphase' | 'entsparphase'

interface PhaseSelectionFieldProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function PhaseSelectionField({
  formValues,
  onFormChange,
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: PhaseSelectionFieldProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Lebensphase
        <InfoIcon />
      </Label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={formValues.phase}
        onChange={e =>
          onFormChange({
            ...formValues,
            phase: e.target.value as EventPhase,
          })
        }
      >
        <option value="sparphase">
          💰 Sparphase ({savingsStartYear} - {savingsEndYear})
        </option>
        <option value="entsparphase">
          💸 Entsparphase ({withdrawalStartYear} - {withdrawalEndYear})
        </option>
      </select>
      <div className="text-sm text-muted-foreground mt-1">Wählen Sie die Lebensphase für das Ereignis</div>
    </div>
  )
}
