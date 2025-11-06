import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { InfoIcon } from './InfoIcon'

interface CreditCheckboxProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function CreditCheckbox({ formValues, onFormChange }: CreditCheckboxProps) {
  return (
    <div className="mb-4 space-y-2 col-span-full">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="useCredit"
          checked={formValues.useCredit}
          onChange={e =>
            onFormChange({
              ...formValues,
              useCredit: e.target.checked,
            })
          }
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <Label htmlFor="useCredit">
          Finanzierung über Kredit
          <InfoIcon />
        </Label>
      </div>
    </div>
  )
}
