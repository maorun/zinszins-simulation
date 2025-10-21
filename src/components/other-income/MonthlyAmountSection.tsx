import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface MonthlyAmountSectionProps {
  editingSource: OtherIncomeSource
  monthlyAmountId: string
  isKindergeld: boolean
  isGrossIncome: boolean
  onUpdate: (source: OtherIncomeSource) => void
}

function getAmountLabel(isKindergeld: boolean, isGrossIncome: boolean): string {
  if (isKindergeld) {
    return 'Monatlicher Betrag (€)'
  }
  return `Monatlicher Betrag (€) - ${isGrossIncome ? 'Brutto' : 'Netto'}`
}

export function MonthlyAmountSection({
  editingSource,
  monthlyAmountId,
  isKindergeld,
  isGrossIncome,
  onUpdate,
}: MonthlyAmountSectionProps) {
  const handleAmountChange = (value: string) => {
    onUpdate({
      ...editingSource,
      monthlyAmount: Number(value) || 0,
    })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={monthlyAmountId}>
        {getAmountLabel(isKindergeld, isGrossIncome)}
      </Label>
      <Input
        id={monthlyAmountId}
        type="number"
        value={editingSource.monthlyAmount}
        onChange={e => handleAmountChange(e.target.value)}
        min={0}
        step={100}
        disabled={isKindergeld}
      />
      {isKindergeld && (
        <p className="text-xs text-gray-600">
          Kindergeld-Betrag ist festgelegt (250€/Monat, Stand 2024)
        </p>
      )}
    </div>
  )
}
