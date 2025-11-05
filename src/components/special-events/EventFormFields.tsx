import type { RelationshipType, ExpenseType } from '../../utils/sparplan-utils'
import { InheritanceFields } from './InheritanceFields'
import { ExpenseFields } from './ExpenseFields'
import { PhaseSelectionField } from './PhaseSelectionField'
import { DateField } from './DateField'
import { EventTypeField } from './EventTypeField'
import { DescriptionField } from './DescriptionField'

type EventPhase = 'sparphase' | 'entsparphase'

export interface EventFormValues {
  date: Date
  eventType: 'inheritance' | 'expense'
  phase: EventPhase
  relationshipType: RelationshipType
  grossAmount: string
  expenseType: ExpenseType
  expenseAmount: string
  useCredit: boolean
  interestRate: string
  termYears: string
  description: string
}

interface EventFormFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function EventFormFields({
  formValues,
  onFormChange,
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: EventFormFieldsProps) {
  return (
    <form>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
      >
        <PhaseSelectionField
          formValues={formValues}
          onFormChange={onFormChange}
          savingsStartYear={savingsStartYear}
          savingsEndYear={savingsEndYear}
          withdrawalStartYear={withdrawalStartYear}
          withdrawalEndYear={withdrawalEndYear}
        />
        <DateField
          formValues={formValues}
          onFormChange={onFormChange}
          savingsStartYear={savingsStartYear}
          savingsEndYear={savingsEndYear}
          withdrawalStartYear={withdrawalStartYear}
          withdrawalEndYear={withdrawalEndYear}
        />
        <EventTypeField formValues={formValues} onFormChange={onFormChange} />
      </div>

      {/* Inheritance-specific fields */}
      {formValues.eventType === 'inheritance' && (
        <InheritanceFields formValues={formValues} onFormChange={onFormChange} />
      )}

      {/* Expense-specific fields */}
      {formValues.eventType === 'expense' && (
        <ExpenseFields formValues={formValues} onFormChange={onFormChange} />
      )}

      <DescriptionField formValues={formValues} onFormChange={onFormChange} />
    </form>
  )
}
