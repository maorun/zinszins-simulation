import React from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

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

interface CostValues {
  ter: string
  transactionCostPercent: string
  transactionCostAbsolute: string
}

interface CostFactorFieldsProps {
  values: CostValues
  onValueChange: (values: CostValues) => void
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>, callback: (value: string) => void) => void
}

function CostInputField({
  label,
  value,
  placeholder,
  max,
  description,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  max: number
  description: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        {label}
        <InfoIcon />
      </Label>
      <Input
        type="number"
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full"
        min={0}
        max={max}
        step={0.01}
      />
      <div className="text-sm text-muted-foreground mt-1">{description}</div>
    </div>
  )
}

/**
 * Cost factor input fields (TER, Transaction Costs)
 * Complexity: <8, Lines: <50
 */
export function CostFactorFields({ values, onValueChange, handleNumberChange }: CostFactorFieldsProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>💰 Kostenfaktoren (optional)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <CostInputField
          label="TER (% p.a.)"
          value={values.ter}
          placeholder="z.B. 0.75"
          max={10}
          description="Total Expense Ratio in % pro Jahr"
          onChange={e => handleNumberChange(e, value => onValueChange({ ...values, ter: value }))}
        />
        <CostInputField
          label="Transaktionskosten (%)"
          value={values.transactionCostPercent}
          placeholder="z.B. 0.25"
          max={5}
          description="Prozentuale Transaktionskosten"
          onChange={e => handleNumberChange(e, value => onValueChange({ ...values, transactionCostPercent: value }))}
        />
        <CostInputField
          label="Transaktionskosten (€)"
          value={values.transactionCostAbsolute}
          placeholder="z.B. 1.50"
          max={100}
          description="Absolute Transaktionskosten in Euro"
          onChange={e => handleNumberChange(e, value => onValueChange({ ...values, transactionCostAbsolute: value }))}
        />
      </div>
    </div>
  )
}
