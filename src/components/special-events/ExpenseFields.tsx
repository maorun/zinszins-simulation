import type { EventFormValues } from './EventFormFields'
import { ExpenseTypeSelect } from './ExpenseTypeSelect'
import { ExpenseAmountInput } from './ExpenseAmountInput'
import { CreditCheckbox } from './CreditCheckbox'
import { CreditFields } from './CreditFields'

interface ExpenseFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function ExpenseFields({ formValues, onFormChange }: ExpenseFieldsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      <ExpenseTypeSelect formValues={formValues} onFormChange={onFormChange} />
      <ExpenseAmountInput formValues={formValues} onFormChange={onFormChange} />
      <CreditCheckbox formValues={formValues} onFormChange={onFormChange} />
      {formValues.useCredit && <CreditFields formValues={formValues} onFormChange={onFormChange} />}
    </div>
  )
}
