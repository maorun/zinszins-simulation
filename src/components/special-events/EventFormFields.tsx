import type { ChangeEvent } from 'react'
import type { RelationshipType, ExpenseType } from '../../utils/sparplan-utils'
import { calculateInheritanceTax } from '../../../helpers/inheritance-tax'
import { getDefaultCreditTerms } from '../../../helpers/credit-calculation'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

type EventPhase = 'sparphase' | 'entsparphase'

export interface EventFormValues {
  date: Date
  eventType: 'inheritance' | 'expense'
  phase: EventPhase
  relationshipType: RelationshipType
  grossAmount: string
  expenseType: ExpenseType
  expenseAmount: string
  useCredit: boolean
  interestRate: string
  termYears: string
  description: string
}

interface EventFormFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

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

const formatDateForInput = (date: Date | string | null, format: string): string => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (format === 'yyyy-MM') {
    return d.toISOString().substring(0, 7)
  }
  return d.toISOString().substring(0, 10)
}

const handleDateChange = (
  e: ChangeEvent<HTMLInputElement>,
  format: string,
  onChange: (date: Date | null) => void,
) => {
  const inputValue = e.target.value
  if (!inputValue) {
    onChange(null)
    return
  }

  const date = new Date(inputValue + (format === 'yyyy-MM' ? '-01' : ''))
  if (!isNaN(date.getTime())) {
    onChange(date)
  }
}

export function EventFormFields({
  formValues,
  onFormChange,
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: EventFormFieldsProps) {
  const getPhaseYearRange = (phase: EventPhase) => {
    if (phase === 'sparphase') {
      return { start: savingsStartYear, end: savingsEndYear }
    }
    return { start: withdrawalStartYear, end: withdrawalEndYear }
  }

  const currentPhaseRange = getPhaseYearRange(formValues.phase)

  const inheritanceTaxCalc = formValues.grossAmount
    ? calculateInheritanceTax(Number(formValues.grossAmount), formValues.relationshipType)
    : null

  return (
    <form>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
      >
        {/* Phase Selection */}
        <div className="mb-4 space-y-2">
          <Label>
            Lebensphase
            <InfoIcon />
          </Label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formValues.phase}
            onChange={e => onFormChange({
              ...formValues,
              phase: e.target.value as EventPhase,
            })}
          >
            <option value="sparphase">
              💰 Sparphase (
              {savingsStartYear}
              {' '}
              -
              {' '}
              {savingsEndYear}
              )
            </option>
            <option value="entsparphase">
              💸 Entsparphase (
              {withdrawalStartYear}
              {' '}
              -
              {' '}
              {withdrawalEndYear}
              )
            </option>
          </select>
          <div className="text-sm text-muted-foreground mt-1">
            Wählen Sie die Lebensphase für das Ereignis
          </div>
        </div>

        {/* Date */}
        <div className="mb-4 space-y-2">
          <Label>
            Datum
            <InfoIcon />
          </Label>
          <Input
            type="date"
            value={formatDateForInput(formValues.date, 'yyyy-MM-dd')}
            onChange={e => handleDateChange(e, 'yyyy-MM-dd', date => onFormChange({
              ...formValues,
              date: date || new Date(),
            }))}
            min={`${currentPhaseRange.start}-01-01`}
            max={`${currentPhaseRange.end}-12-31`}
            placeholder="Datum wählen"
          />
          <div className="text-sm text-muted-foreground mt-1">
            Datum zwischen
            {' '}
            {currentPhaseRange.start}
            {' '}
            und
            {' '}
            {currentPhaseRange.end}
          </div>
        </div>

        {/* Event Type */}
        <div className="mb-4 space-y-2">
          <Label>
            Ereignistyp
            <InfoIcon />
          </Label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formValues.eventType}
            onChange={e => onFormChange({
              ...formValues,
              eventType: e.target.value as 'inheritance' | 'expense',
            })}
          >
            <option value="inheritance">💰 Erbschaft</option>
            <option value="expense">💸 Ausgabe</option>
          </select>
        </div>
      </div>

      {/* Inheritance-specific fields */}
      {formValues.eventType === 'inheritance' && (
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
      )}

      {/* Expense-specific fields */}
      {formValues.eventType === 'expense' && (
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
      )}

      {/* Tax calculation display for inheritance */}
      {formValues.eventType === 'inheritance' && inheritanceTaxCalc && (
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

      {/* Description */}
      <div className="mb-4 space-y-2">
        <Label>
          Beschreibung (optional)
          <InfoIcon />
        </Label>
        <Input
          type="text"
          value={formValues.description}
          onChange={e => onFormChange({
            ...formValues,
            description: e.target.value,
          })}
          placeholder="z.B. Erbschaft Großeltern, Neuwagenkauf"
        />
      </div>
    </form>
  )
}
