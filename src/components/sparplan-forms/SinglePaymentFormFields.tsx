import React from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { SingleFormValue } from '../SparplanEingabe.helpers'

const InfoIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: '0.25rem', opacity: 0.6 }}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
    <path d="M12,17h.01"></path>
  </svg>
)

interface SinglePaymentFormFieldsProps {
  formValues: SingleFormValue
  onFormChange: (values: SingleFormValue) => void
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    callback: (date: Date | null) => void,
  ) => void
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>, callback: (value: string) => void) => void
}

/**
 * Form fields for creating/editing a single payment (Einmalzahlung)
 * Complexity: <8, Lines: <50
 */
export function SinglePaymentFormFields({
  formValues,
  onFormChange,
  formatDateForInput,
  handleDateChange,
  handleNumberChange,
}: SinglePaymentFormFieldsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      <div className="mb-4 space-y-2">
        <Label>
          Datum
          <InfoIcon />
        </Label>
        <Input
          type="date"
          value={formatDateForInput(formValues.date, 'yyyy-MM-dd')}
          onChange={(e) => handleDateChange(e, 'yyyy-MM-dd', (date) => onFormChange({ ...formValues, date: date! }))}
          placeholder="Datum wählen"
          className="w-full"
        />
      </div>
      <div className="mb-4 space-y-2">
        <Label>
          Einzahlung (€)
          <InfoIcon />
        </Label>
        <Input
          type="number"
          value={formValues.einzahlung || ''}
          onChange={(e) => handleNumberChange(e, (value) => onFormChange({ ...formValues, einzahlung: value }))}
          placeholder="Betrag eingeben"
          className="w-full"
          min={0}
          step={100}
        />
      </div>
    </div>
  )
}
