import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface AmountTypeSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function AmountTypeSection({ editingSource, onUpdate }: AmountTypeSectionProps) {
  const isGrossIncome = editingSource.amountType === 'gross'

  return (
    <div className="space-y-2">
      <Label>Einkunftsart</Label>
      <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
        <span className={`text-sm ${isGrossIncome ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
          Brutto
        </span>
        <Switch
          checked={!isGrossIncome}
          onCheckedChange={isNet =>
            onUpdate({
              ...editingSource,
              amountType: isNet ? 'net' : 'gross',
            })}
        />
        <span className={`text-sm ${!isGrossIncome ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
          Netto
        </span>
      </div>
      <p className="text-xs text-gray-600">
        {isGrossIncome
          ? 'Bei Brutto-Einkünften wird automatisch die Steuer abgezogen'
          : 'Netto-Einkünfte werden bereits nach Steuern angegeben'}
      </p>
    </div>
  )
}
