import type { EventFormValues } from './EventFormFields'
import { getDefaultCreditTerms } from '../../../helpers/credit-calculation'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { InfoIcon } from './InfoIcon'

interface InterestRateInputProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function InterestRateInput({ formValues, onFormChange }: InterestRateInputProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Zinssatz (%)
        <InfoIcon />
      </Label>
      <Input
        type="number"
        value={formValues.interestRate}
        onChange={e =>
          onFormChange({
            ...formValues,
            interestRate: e.target.value,
          })
        }
        placeholder={
          formValues.expenseAmount
            ? (
                getDefaultCreditTerms(formValues.expenseType, Number(formValues.expenseAmount)).interestRate * 100
              ).toFixed(1)
            : '3.5'
        }
        min="0"
        max="20"
        step="0.1"
      />
    </div>
  )
}
