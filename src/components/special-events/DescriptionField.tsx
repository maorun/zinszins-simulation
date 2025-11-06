import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { InfoIcon } from './InfoIcon'

interface DescriptionFieldProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function DescriptionField({ formValues, onFormChange }: DescriptionFieldProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Beschreibung (optional)
        <InfoIcon />
      </Label>
      <Input
        type="text"
        value={formValues.description}
        onChange={e =>
          onFormChange({
            ...formValues,
            description: e.target.value,
          })
        }
        placeholder="z.B. Erbschaft Großeltern, Neuwagenkauf"
      />
    </div>
  )
}
