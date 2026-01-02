import { Label } from '../ui/label'
import { DEFAULT_CARE_LEVELS, type CareLevel } from '../../../helpers/care-cost-simulation'
import type { EventFormValues } from './EventFormFields'

interface CareLevelSelectProps {
  careLevelId: string
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function CareLevelSelect({ careLevelId, formValues, onFormChange }: CareLevelSelectProps) {
  const selectedCareLevelInfo = DEFAULT_CARE_LEVELS[formValues.careLevel]

  return (
    <div>
      <Label htmlFor={careLevelId}>Pflegegrad *</Label>
      <select
        id={careLevelId}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={String(formValues.careLevel)}
        onChange={e =>
          onFormChange({
            ...formValues,
            careLevel: Number(e.target.value) as CareLevel,
          })
        }
      >
        {([1, 2, 3, 4, 5] as const).map(level => (
          <option key={level} value={String(level)}>
            {DEFAULT_CARE_LEVELS[level].name} - {DEFAULT_CARE_LEVELS[level].description}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Typische monatliche Kosten: {selectedCareLevelInfo.typicalMonthlyCost.toLocaleString('de-DE')} € |
        Pflegegeld: {selectedCareLevelInfo.careAllowance.toLocaleString('de-DE')} €
      </p>
    </div>
  )
}
