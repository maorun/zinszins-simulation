import type { RelationshipType, ExpenseType } from '../../utils/sparplan-utils'
import { EventTypeSpecificFields } from './EventTypeSpecificFields'
import { PhaseSelectionField } from './PhaseSelectionField'
import { DateField } from './DateField'
import { EventTypeField } from './EventTypeField'
import { DescriptionField } from './DescriptionField'

type EventPhase = 'sparphase' | 'entsparphase'

export interface EventFormValues {
  date: Date
  eventType: 'inheritance' | 'expense' | 'care_costs' | 'business_sale'
  phase: EventPhase
  relationshipType: RelationshipType
  grossAmount: string
  expenseType: ExpenseType
  expenseAmount: string
  useCredit: boolean
  interestRate: string
  termYears: string
  // Care cost fields
  careLevel: 1 | 2 | 3 | 4 | 5
  customMonthlyCosts: string
  careDurationYears: string
  careInflationRate: string
  // Business sale fields
  businessSalePrice: string
  businessBookValue: string
  sellerAge: string
  permanentlyDisabled: boolean
  businessSaleOtherIncome: string
  applyFifthRule: boolean
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
      <div
        style={{
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

      <EventTypeSpecificFields formValues={formValues} onFormChange={onFormChange} />

      <DescriptionField formValues={formValues} onFormChange={onFormChange} />
    </form>
  )
}
