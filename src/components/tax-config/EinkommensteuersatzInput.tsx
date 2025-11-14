import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'

interface EinkommensteuersatzInputProps {
  einkommensteuersatz: number
  onEinkommensteuersatzChange: (value: number) => void
}

export function EinkommensteuersatzInput({
  einkommensteuersatz,
  onEinkommensteuersatzChange,
}: EinkommensteuersatzInputProps) {
  const inputId = useMemo(() => generateFormId('einkommensteuersatz', 'input'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium">
        Einkommensteuersatz (%)
      </Label>
      <p className="text-xs text-muted-foreground">
        Persönlicher Einkommensteuersatz für die Besteuerung nach Grundfreibetrag
      </p>
      <Input
        id={inputId}
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={einkommensteuersatz}
        onChange={e => {
          const value = parseFloat(e.target.value)
          if (!isNaN(value) && value >= 0 && value <= 100) {
            onEinkommensteuersatzChange(value)
          }
        }}
        className="max-w-xs"
      />
    </div>
  )
}
