import type { RelationshipType } from '../../utils/sparplan-utils'
import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { InfoIcon } from './InfoIcon'

interface RelationshipTypeFieldProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function RelationshipTypeField({ formValues, onFormChange }: RelationshipTypeFieldProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>
        Verwandtschaftsgrad
        <InfoIcon />
      </Label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={formValues.relationshipType}
        onChange={e =>
          onFormChange({
            ...formValues,
            relationshipType: e.target.value as RelationshipType,
          })
        }
      >
        <option value="child">Kind</option>
        <option value="grandchild">Enkelkind</option>
        <option value="spouse">Ehepartner</option>
        <option value="sibling">Geschwister</option>
        <option value="other">Sonstige</option>
      </select>
    </div>
  )
}
