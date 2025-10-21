import React from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SimulationAnnual, type SimulationAnnualType } from '../../utils/simulate'
import type { SparplanFormValue } from '../SparplanEingabe.helpers'

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

interface SparplanFormFieldsProps {
  formValues: SparplanFormValue
  simulationAnnual: SimulationAnnualType
  onFormChange: (values: SparplanFormValue) => void
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    callback: (date: Date | null) => void,
  ) => void
  handleNumberChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (value: string) => void,
  ) => void
}

/**
 * Date input field with label and info icon
 */
function DateField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        {label}
        <InfoIcon />
      </Label>
      <Input
        type="month"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  )
}

/**
 * Form fields for creating/editing a savings plan (Sparplan)
 * Complexity: <8, Lines: <50
 */
export function SparplanFormFields({
  formValues,
  simulationAnnual,
  onFormChange,
  formatDateForInput,
  handleDateChange,
  handleNumberChange,
}: SparplanFormFieldsProps) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <DateField
          label="Start"
          value={formatDateForInput(formValues.start, 'yyyy-MM')}
          onChange={e => handleDateChange(e, 'yyyy-MM', (date) => {
            if (date) onFormChange({ ...formValues, start: date })
          })}
          placeholder="Startdatum wählen"
        />
        <DateField
          label="Ende (optional)"
          value={formatDateForInput(formValues.end, 'yyyy-MM')}
          onChange={e => handleDateChange(e, 'yyyy-MM', date => onFormChange({ ...formValues, end: date }))}
          placeholder="Enddatum wählen"
        />
        <div className="mb-4 space-y-2">
          <Label>
            {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlungen je Jahr (€)' : 'Einzahlungen je Monat (€)'}
            <InfoIcon />
          </Label>
          <Input
            type="number"
            value={formValues.einzahlung || ''}
            onChange={e => handleNumberChange(e, value =>
              onFormChange({ ...formValues, einzahlung: value }),
            )}
            placeholder="Betrag eingeben"
            className="w-full"
            min={0}
            step={simulationAnnual === SimulationAnnual.monthly ? 10 : 100}
          />
        </div>
      </div>
    </>
  )
}
