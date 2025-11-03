import type { EventFormValues } from './EventFormFields'
import { InterestRateInput } from './InterestRateInput'
import { TermYearsInput } from './TermYearsInput'

interface CreditFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function CreditFields({ formValues, onFormChange }: CreditFieldsProps) {
  return (
    <>
      <InterestRateInput formValues={formValues} onFormChange={onFormChange} />
      <TermYearsInput formValues={formValues} onFormChange={onFormChange} />
    </>
  )
}
