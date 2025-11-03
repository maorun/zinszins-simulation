import type { RelationshipType } from '../../utils/sparplan-utils'
import type { EventFormValues } from './EventFormFields'
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
        onChange={e => onFormChange({
          ...formValues,
          relationshipType: e.target.value as RelationshipType,
        })}
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
