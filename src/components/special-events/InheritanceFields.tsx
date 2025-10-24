import type { RelationshipType } from '../../utils/sparplan-utils'
import type { EventFormValues } from './EventFormFields'
import { calculateInheritanceTax } from '../../../helpers/inheritance-tax'
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

interface InheritanceFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

// eslint-disable-next-line max-lines-per-function -- Large component function
export function InheritanceFields({ formValues, onFormChange }: InheritanceFieldsProps) {
  const inheritanceTaxCalc = formValues.grossAmount
    ? calculateInheritanceTax(Number(formValues.grossAmount), formValues.relationshipType)
    : null

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
      >
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
      </div>

      {/* Tax calculation display */}
      {inheritanceTaxCalc && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-semibold text-green-800 mb-2">📊 Steuerberechnung:</div>
          <div className="text-sm text-green-700 space-y-1">
            <div>
              Brutto-Erbschaft:
              {' '}
              <span className="font-semibold">
                {inheritanceTaxCalc.grossAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            <div>
              Freibetrag:
              {' '}
              <span className="font-semibold">
                {inheritanceTaxCalc.exemption.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            <div>
              Steuerpflichtiger Betrag:
              {' '}
              <span className="font-semibold">
                {inheritanceTaxCalc.taxableAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            <div className="font-semibold border-t pt-1 mt-2">
              Netto-Erbschaft:
              {' '}
              <span className="text-green-900">
                {inheritanceTaxCalc.netAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
