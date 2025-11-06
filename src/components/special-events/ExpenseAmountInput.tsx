import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { InfoIcon } from './InfoIcon'

interface ExpenseAmountInputProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function ExpenseAmountInput({ formValues, onFormChange }: ExpenseAmountInputProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Ausgabenbetrag (€)
        <InfoIcon />
      </Label>
      <Input
        type="number"
        value={formValues.expenseAmount}
        onChange={(e) =>
          onFormChange({
            ...formValues,
            expenseAmount: e.target.value,
          })
        }
        placeholder="25000"
        min="0"
        step="1000"
      />
    </div>
  )
}
