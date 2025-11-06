import type { EventFormValues } from './EventFormFields'
import { getDefaultCreditTerms } from '../../../helpers/credit-calculation'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { InfoIcon } from './InfoIcon'

interface TermYearsInputProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function TermYearsInput({ formValues, onFormChange }: TermYearsInputProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Laufzeit (Jahre)
        <InfoIcon />
      </Label>
      <Input
        type="number"
        value={formValues.termYears}
        onChange={e =>
          onFormChange({
            ...formValues,
            termYears: e.target.value,
          })
        }
        placeholder={
          formValues.expenseAmount
            ? getDefaultCreditTerms(formValues.expenseType, Number(formValues.expenseAmount)).termYears.toString()
            : '5'
        }
        min="1"
        max="30"
        step="1"
      />
    </div>
  )
}
