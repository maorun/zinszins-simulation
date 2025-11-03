import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

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

interface GrossAmountFieldProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function GrossAmountField({ formValues, onFormChange }: GrossAmountFieldProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Brutto-Erbschaft (€)
        <InfoIcon />
      </Label>
      <Input
        type="number"
        value={formValues.grossAmount}
        onChange={e => onFormChange({
          ...formValues,
          grossAmount: e.target.value,
        })}
        placeholder="100000"
        min="0"
        step="1000"
      />
      <div className="text-sm text-muted-foreground mt-1">Bruttobetrag vor Erbschaftsteuer</div>
    </div>
  )
}
