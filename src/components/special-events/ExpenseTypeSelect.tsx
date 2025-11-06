import type { ExpenseType } from '../../utils/sparplan-utils'
import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { InfoIcon } from './InfoIcon'

interface ExpenseTypeSelectProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function ExpenseTypeSelect({ formValues, onFormChange }: ExpenseTypeSelectProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Ausgabentyp
        <InfoIcon />
      </Label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={formValues.expenseType}
        onChange={e =>
          onFormChange({
            ...formValues,
            expenseType: e.target.value as ExpenseType,
          })
        }
      >
        <option value="car">Auto</option>
        <option value="house">Haus/Wohnung</option>
        <option value="renovation">Renovierung</option>
        <option value="vacation">Urlaub</option>
        <option value="other">Sonstiges</option>
      </select>
    </div>
  )
}
