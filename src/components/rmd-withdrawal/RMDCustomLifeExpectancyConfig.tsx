import type { ChangeEvent } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface RMDCustomLifeExpectancyConfigProps {
  value: number
  startAge: number
  onChange: (years: number) => void
  inputId?: string
  isFormMode?: boolean
}

export function RMDCustomLifeExpectancyConfig({
  value,
  startAge,
  onChange,
  inputId = 'rmd-custom-life-expectancy',
  isFormMode = false,
}: RMDCustomLifeExpectancyConfigProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const years = Number(event.target.value)
    onChange(years)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {isFormMode ? 'Verbleibende Lebenserwartung (Jahre)' : 'Benutzerdefinierte Lebenserwartung (Jahre)'}
      </Label>
      <Input
        id={inputId}
        type="number"
        value={value}
        onChange={handleChange}
        min={isFormMode ? 1 : 5}
        max={50}
        step={isFormMode ? 0.1 : 1}
        className="w-32"
      />
      <div className="text-sm text-muted-foreground">
        {isFormMode
          ? 'Anzahl der Jahre, die das Portfolio vorhalten soll'
          : `Erwartete Lebensdauer ab dem Startalter (z.B. 20 Jahre bedeutet Leben bis Alter ${startAge + value})`}
      </div>
    </div>
  )
}
