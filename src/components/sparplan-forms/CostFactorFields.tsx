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
  handleNumberChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (value: string) => void,
  ) => void
}

/**
 * Cost factor input fields (TER, Transaction Costs)
 * Complexity: <8, Lines: <50
 */
export function CostFactorFields({
  values,
  onValueChange,
  handleNumberChange,
}: CostFactorFieldsProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
        💰 Kostenfaktoren (optional)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="mb-4 space-y-2">
          <Label>
            TER (% p.a.)
            <InfoIcon />
          </Label>
          <Input
            type="number"
            value={values.ter || ''}
            onChange={e => handleNumberChange(e, value =>
              onValueChange({ ...values, ter: value }),
            )}
            placeholder="z.B. 0.75"
            className="w-full"
            min={0}
            max={10}
            step={0.01}
          />
          <div className="text-sm text-muted-foreground mt-1">Total Expense Ratio in % pro Jahr</div>
        </div>
        <div className="mb-4 space-y-2">
          <Label>
            Transaktionskosten (%)
            <InfoIcon />
          </Label>
          <Input
            type="number"
            value={values.transactionCostPercent || ''}
            onChange={e => handleNumberChange(e, value =>
              onValueChange({ ...values, transactionCostPercent: value }),
            )}
            placeholder="z.B. 0.25"
            className="w-full"
            min={0}
            max={5}
            step={0.01}
          />
          <div className="text-sm text-muted-foreground mt-1">Prozentuale Transaktionskosten</div>
        </div>
        <div className="mb-4 space-y-2">
          <Label>
            Transaktionskosten (€)
            <InfoIcon />
          </Label>
          <Input
            type="number"
            value={values.transactionCostAbsolute || ''}
            onChange={e => handleNumberChange(e, value =>
              onValueChange({ ...values, transactionCostAbsolute: value }),
            )}
            placeholder="z.B. 1.50"
            className="w-full"
            min={0}
            max={100}
            step={0.01}
          />
          <div className="text-sm text-muted-foreground mt-1">Absolute Transaktionskosten in Euro</div>
        </div>
      </div>
    </div>
  )
}
