import React from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface ForeignIncomeInputProps {
  foreignIncome: number
  foreignIncomeInputId: string
  onForeignIncomeChange: (amount: number) => void
}

export function ForeignIncomeInput({
  foreignIncome,
  foreignIncomeInputId,
  onForeignIncomeChange,
}: ForeignIncomeInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={foreignIncomeInputId}>Ausländische Kapitalerträge (€)</Label>
      <Input
        id={foreignIncomeInputId}
        type="number"
        min="0"
        step="100"
        value={foreignIncome}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onForeignIncomeChange(Number(e.target.value))}
        placeholder="0"
      />
      <p className="text-xs text-muted-foreground">
        Gesamtbetrag der ausländischen Dividenden und Zinsen in Euro (vor Quellensteuerabzug).
      </p>
    </div>
  )
}
