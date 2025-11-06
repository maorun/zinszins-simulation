import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { type FinancialGoalType, createDefaultGoal } from '../../../helpers/financial-goals'
import { Button } from '../ui/button'
import { generateFormId } from '../../utils/unique-id'
import { FormFields } from './FormFields'

interface GoalFormProps {
  onAddGoal: (goal: ReturnType<typeof createDefaultGoal>) => void
}

export function GoalForm({ onAddGoal }: GoalFormProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<FinancialGoalType>('retirement')

  const ids = useMemo(
    () => ({
      name: generateFormId('financial-goals', 'goal-name'),
      amount: generateFormId('financial-goals', 'goal-amount'),
      type: generateFormId('financial-goals', 'goal-type'),
    }),
    [],
  )

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount)
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return

    onAddGoal(createDefaultGoal(type, name, parsedAmount))
    setName('')
    setAmount('')
    setType('retirement')
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="font-semibold mb-3 text-gray-700">Neues Ziel hinzufügen</h4>
      <FormFields
        ids={ids}
        values={{ type, name, amount }}
        onChange={{ type: setType, name: setName, amount: setAmount }}
      />
      <Button onClick={handleSubmit} className="mt-4 w-full md:w-auto" disabled={!name.trim() || !amount}>
        <Plus className="w-4 h-4 mr-2" />
        Ziel hinzufügen
      </Button>
    </div>
  )
}
