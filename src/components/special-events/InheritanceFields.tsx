import type { EventFormValues } from './EventFormFields'
import { calculateInheritanceTax } from '../../../helpers/inheritance-tax'
import { RelationshipTypeField } from './RelationshipTypeField'
import { GrossAmountField } from './GrossAmountField'
import { TaxCalculationDisplay } from './TaxCalculationDisplay'

interface InheritanceFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function InheritanceFields({ formValues, onFormChange }: InheritanceFieldsProps) {
  const inheritanceTaxCalc = formValues.grossAmount
    ? calculateInheritanceTax(Number(formValues.grossAmount), formValues.relationshipType)
    : null

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <RelationshipTypeField formValues={formValues} onFormChange={onFormChange} />
        <GrossAmountField formValues={formValues} onFormChange={onFormChange} />
      </div>

      <TaxCalculationDisplay inheritanceTaxCalc={inheritanceTaxCalc} />
    </>
  )
}
