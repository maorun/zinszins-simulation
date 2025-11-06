import React from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface SegmentBasicConfigProps {
  name: string
  startYear: number
  endYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
  onNameChange: (name: string) => void
  onStartYearChange: (year: number) => void
  onEndYearChange: (year: number) => void
}

const handleNumberInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number | undefined) => void,
) => {
  const value = e.target.value
  onChange(value ? Math.round(Number(value)) : undefined)
}

export function SegmentBasicConfig({
  name,
  startYear,
  endYear,
  withdrawalStartYear,
  withdrawalEndYear,
  onNameChange,
  onStartYearChange,
  onEndYearChange,
}: SegmentBasicConfigProps) {
  return (
    <div className="form-grid">
      <div className="mb-4 space-y-2">
        <Label>Name der Phase</Label>
        <Input value={name} onChange={e => onNameChange(e.target.value)} placeholder="z.B. Frühe Rente" />
      </div>
      <div className="mb-4 space-y-2">
        <Label>Startjahr</Label>
        <Input
          type="number"
          value={startYear}
          onChange={e => handleNumberInputChange(e, value => onStartYearChange(Number(value) || withdrawalStartYear))}
          min={2020}
          max={2100}
        />
      </div>
      <div className="mb-4 space-y-2">
        <Label>Endjahr</Label>
        <Input
          type="number"
          value={endYear}
          onChange={e => handleNumberInputChange(e, value => onEndYearChange(Number(value) || withdrawalEndYear))}
          min={2020}
          max={2100}
        />
      </div>
    </div>
  )
}
