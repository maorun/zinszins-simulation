import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { InfoIcon } from './InfoIcon'

interface EventTypeFieldProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function EventTypeField({ formValues, onFormChange }: EventTypeFieldProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Ereignistyp
        <InfoIcon />
      </Label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={formValues.eventType}
        onChange={e =>
          onFormChange({
            ...formValues,
            eventType: e.target.value as 'inheritance' | 'expense' | 'care_costs' | 'business_sale',
          })
        }
      >
        <option value="inheritance">💰 Erbschaft</option>
        <option value="expense">💸 Ausgabe</option>
        <option value="care_costs">🏥 Pflegekosten</option>
        <option value="business_sale">🏢 Unternehmensverkauf</option>
      </select>
    </div>
  )
}
