import { Button } from '../ui/button'
import { Plus } from 'lucide-react'

interface OtherIncomeAddButtonProps {
  onAdd: () => void
  disabled: boolean
}

export function OtherIncomeAddButton({ onAdd, disabled }: OtherIncomeAddButtonProps) {
  return (
    <div className="mb-6">
      <Button onClick={onAdd} variant="outline" size="lg" className="w-full" disabled={disabled}>
        <Plus className="h-4 w-4 mr-2" />
        Neue Einkommensquelle hinzufügen
      </Button>
    </div>
  )
}
