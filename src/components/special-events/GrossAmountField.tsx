import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { InfoIcon } from './InfoIcon'

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
