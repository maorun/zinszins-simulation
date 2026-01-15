import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'
import { type LargeExpense, getExpenseCategoryNameGerman } from '../../../helpers/dynamic-spending'

interface LargeExpensesConfigurationProps {
  largeExpenses: LargeExpense[]
  onChange: (expenses: LargeExpense[]) => void
  retirementStartYear: number
  retirementEndYear: number
}

const EXPENSE_CATEGORIES = [
  { value: 'reise', label: 'Reise' },
  { value: 'renovierung', label: 'Renovierung' },
  { value: 'auto', label: 'Auto' },
  { value: 'gesundheit', label: 'Gesundheit' },
  { value: 'familie', label: 'Familie' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const

function ExpenseHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Großausgaben</h3>
        <p className="text-sm text-muted-foreground">Einmalige größere Ausgaben im Ruhestand</p>
      </div>
      <Button onClick={onAdd} size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" />Hinzufügen</Button>
    </div>
  )
}

function ExpenseItem({ expense, index, onUpdate, onRemove, retirementStartYear, retirementEndYear }: { expense: LargeExpense; index: number; onUpdate: (index: number, expense: LargeExpense) => void; onRemove: (index: number) => void; retirementStartYear: number; retirementEndYear: number }) {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <Badge>{getExpenseCategoryNameGerman(expense.category)}</Badge>
        <Button onClick={() => onRemove(index)} size="sm" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Jahr</Label>
          <Input type="number" value={expense.year} onChange={(e) => onUpdate(index, { ...expense, year: Number(e.target.value) })} min={retirementStartYear} max={retirementEndYear} />
        </div>
        <div className="space-y-2">
          <Label>Betrag (€)</Label>
          <Input type="number" value={expense.amount} onChange={(e) => onUpdate(index, { ...expense, amount: Number(e.target.value) })} min={0} step={1000} />
        </div>
        <div className="space-y-2">
          <Label>Kategorie</Label>
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={expense.category} onChange={(e) => onUpdate(index, { ...expense, category: e.target.value as LargeExpense['category'] })}>
            {EXPENSE_CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Beschreibung</Label>
        <Input type="text" value={expense.description} onChange={(e) => onUpdate(index, { ...expense, description: e.target.value })} placeholder="z.B. Weltreise, Neues Auto, Badezimmerrenovierung" />
      </div>
    </div>
  )
}

export function LargeExpensesConfiguration(props: LargeExpensesConfigurationProps) {
  const { largeExpenses, onChange, retirementStartYear, retirementEndYear } = props
  const handleAdd = () => onChange([...largeExpenses, { year: retirementStartYear + 5, amount: 10000, description: 'Neue Ausgabe', category: 'sonstiges' }])
  const handleUpdate = (index: number, updatedExpense: LargeExpense) => { const newExpenses = [...largeExpenses]; newExpenses[index] = updatedExpense; onChange(newExpenses) }
  const handleRemove = (index: number) => onChange(largeExpenses.filter((_, i) => i !== index))

  return (
    <div className="space-y-4">
      <ExpenseHeader onAdd={handleAdd} />
      {largeExpenses.length === 0 ? (
        <Alert><AlertDescription>Keine Großausgaben definiert. Klicken Sie "Hinzufügen" oben.</AlertDescription></Alert>
      ) : (
        <div className="space-y-3">
          {largeExpenses.map((expense, index) => (
            <ExpenseItem key={index} expense={expense} index={index} onUpdate={handleUpdate} onRemove={handleRemove} retirementStartYear={retirementStartYear} retirementEndYear={retirementEndYear} />
          ))}
        </div>
      )}
    </div>
  )
}
