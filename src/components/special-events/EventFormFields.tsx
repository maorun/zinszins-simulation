import type { ChangeEvent } from 'react'
import type { RelationshipType, ExpenseType } from '../../utils/sparplan-utils'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { InheritanceFields } from './InheritanceFields'
import { ExpenseFields } from './ExpenseFields'

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
        <InheritanceFields formValues={formValues} onFormChange={onFormChange} />
      )}

      {/* Expense-specific fields */}
      {formValues.eventType === 'expense' && (
        <ExpenseFields formValues={formValues} onFormChange={onFormChange} />
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
