import type { EventFormValues } from './EventFormFields'
import { InheritanceFields } from './InheritanceFields'
import { ExpenseFields } from './ExpenseFields'
import { CareCostFields } from './CareCostFields'
import { BusinessSaleFields } from './BusinessSaleFields'

interface EventTypeSpecificFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function EventTypeSpecificFields({
  formValues,
  onFormChange,
}: EventTypeSpecificFieldsProps) {
  if (formValues.eventType === 'inheritance') {
    return <InheritanceFields formValues={formValues} onFormChange={onFormChange} />
  }

  if (formValues.eventType === 'expense') {
    return <ExpenseFields formValues={formValues} onFormChange={onFormChange} />
  }

  if (formValues.eventType === 'care_costs') {
    return <CareCostFields formValues={formValues} onFormChange={onFormChange} />
  }

  if (formValues.eventType === 'business_sale') {
    return <BusinessSaleFields formValues={formValues} onFormChange={onFormChange} />
  }

  return null
}
