import type { ExpenseType } from '../../utils/sparplan-utils'
import type { EventFormValues } from './EventFormFields'
import { getDefaultCreditTerms } from '../../../helpers/credit-calculation'
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

interface ExpenseFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

// eslint-disable-next-line max-lines-per-function -- Large component function
export function ExpenseFields({ formValues, onFormChange }: ExpenseFieldsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    }}
    >
      <div className="mb-4 space-y-2">
        <Label>
          Ausgabentyp
          <InfoIcon />
        </Label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formValues.expenseType}
          onChange={e => onFormChange({
            ...formValues,
            expenseType: e.target.value as ExpenseType,
          })}
        >
          <option value="car">Auto</option>
          <option value="house">Haus/Wohnung</option>
          <option value="renovation">Renovierung</option>
          <option value="vacation">Urlaub</option>
          <option value="other">Sonstiges</option>
        </select>
      </div>

      <div className="mb-4 space-y-2">
        <Label>
          Ausgabenbetrag (€)
          <InfoIcon />
        </Label>
        <Input
          type="number"
          value={formValues.expenseAmount}
          onChange={e => onFormChange({
            ...formValues,
            expenseAmount: e.target.value,
          })}
          placeholder="25000"
          min="0"
          step="1000"
        />
      </div>

      <div className="mb-4 space-y-2 col-span-full">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useCredit"
            checked={formValues.useCredit}
            onChange={e => onFormChange({
              ...formValues,
              useCredit: e.target.checked,
            })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="useCredit">
            Finanzierung über Kredit
            <InfoIcon />
          </Label>
        </div>
      </div>

      {formValues.useCredit && (
        <>
          <div className="mb-4 space-y-2">
            <Label>
              Zinssatz (%)
              <InfoIcon />
            </Label>
            <Input
              type="number"
              value={formValues.interestRate}
              onChange={e => onFormChange({
                ...formValues,
                interestRate: e.target.value,
              })}
              placeholder={
                formValues.expenseAmount
                  ? (
                      getDefaultCreditTerms(
                        formValues.expenseType,
                        Number(formValues.expenseAmount),
                      ).interestRate * 100
                    ).toFixed(1)
                  : '3.5'
              }
              min="0"
              max="20"
              step="0.1"
            />
          </div>

          <div className="mb-4 space-y-2">
            <Label>
              Laufzeit (Jahre)
              <InfoIcon />
            </Label>
            <Input
              type="number"
              value={formValues.termYears}
              onChange={e => onFormChange({
                ...formValues,
                termYears: e.target.value,
              })}
              placeholder={
                formValues.expenseAmount
                  ? getDefaultCreditTerms(
                      formValues.expenseType,
                      Number(formValues.expenseAmount),
                    ).termYears.toString()
                  : '5'
              }
              min="1"
              max="30"
              step="1"
            />
          </div>
        </>
      )}
    </div>
  )
}
