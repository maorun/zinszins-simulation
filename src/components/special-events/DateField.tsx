import type { ChangeEvent } from 'react'
import type { EventFormValues } from './EventFormFields'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { InfoIcon } from './InfoIcon'

type EventPhase = 'sparphase' | 'entsparphase'

interface DateFieldProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

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

const getPhaseYearRange = (
  phase: EventPhase,
  savingsStartYear: number,
  savingsEndYear: number,
  withdrawalStartYear: number,
  withdrawalEndYear: number,
) => {
  if (phase === 'sparphase') {
    return { start: savingsStartYear, end: savingsEndYear }
  }
  return { start: withdrawalStartYear, end: withdrawalEndYear }
}

export function DateField({
  formValues,
  onFormChange,
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: DateFieldProps) {
  const currentPhaseRange = getPhaseYearRange(
    formValues.phase,
    savingsStartYear,
    savingsEndYear,
    withdrawalStartYear,
    withdrawalEndYear,
  )

  return (
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
  )
}
