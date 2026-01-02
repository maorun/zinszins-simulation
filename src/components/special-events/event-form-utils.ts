import type { EventFormValues } from './EventFormFields'

export function isSubmitDisabled(formValues: EventFormValues): boolean {
  switch (formValues.eventType) {
    case 'inheritance':
      return !formValues.grossAmount
    case 'expense':
      return !formValues.expenseAmount
    case 'care_costs':
      return !formValues.careLevel
    default:
      return false
  }
}

export function getSubmitButtonText(eventType: EventFormValues['eventType']): string {
  switch (eventType) {
    case 'inheritance':
      return '💰 Erbschaft hinzufügen'
    case 'expense':
      return '💸 Ausgabe hinzufügen'
    case 'care_costs':
      return '🏥 Pflegekosten hinzufügen'
    default:
      return 'Hinzufügen'
  }
}
