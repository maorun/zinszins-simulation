import { type FinancialGoalType } from '../../../helpers/financial-goals'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { GoalTypeSelect } from './GoalTypeSelect'

interface FormFieldsProps {
  ids: { type: string, name: string, amount: string }
  values: { type: FinancialGoalType, name: string, amount: string }
  onChange: {
    type: (v: FinancialGoalType) => void
    name: (v: string) => void
    amount: (v: string) => void
  }
}

export function FormFields({ ids, values, onChange }: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <GoalTypeSelect id={ids.type} value={values.type} onChange={v => onChange.type(v as FinancialGoalType)} />
      <div className="space-y-2">
        <Label htmlFor={ids.name}>Zielname</Label>
        <Input
          id={ids.name}
          type="text"
          value={values.name}
          onChange={e => onChange.name(e.target.value)}
          placeholder="z.B. Früher Ruhestand"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={ids.amount}>Zielbetrag (€)</Label>
        <Input
          id={ids.amount}
          type="number"
          value={values.amount}
          onChange={e => onChange.amount(e.target.value)}
          placeholder="500000"
          min="0"
          step="1000"
        />
      </div>
    </div>
  )
}
