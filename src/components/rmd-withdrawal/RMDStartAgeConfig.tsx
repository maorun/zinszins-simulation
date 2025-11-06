import React from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface RMDStartAgeConfigProps {
  value: number
  onChange: (age: number) => void
  inputId?: string
  isFormMode?: boolean
}

export function RMDStartAgeConfig({
  value,
  onChange,
  inputId = 'rmd-start-age',
  isFormMode = false,
}: RMDStartAgeConfigProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const age = Number(event.target.value)
    onChange(age)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        Alter zu Beginn der Entnahmephase
      </Label>
      <Input
        id={inputId}
        type="number"
        value={value}
        onChange={handleChange}
        min={50}
        max={100}
        step={1}
        className="w-32"
      />
      <div className="text-sm text-muted-foreground">
        {isFormMode
          ? 'Das Alter, mit dem die RMD-Entnahme beginnt (Standard: 65 Jahre)'
          : 'Das Alter zu Beginn dieser Entnahme-Phase (wird für die Berechnung der Lebenserwartung verwendet)'}
      </div>
    </div>
  )
}
