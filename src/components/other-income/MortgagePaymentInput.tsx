import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface MortgagePaymentInputProps {
  editingSource: OtherIncomeSource
  mortgagePaymentId: string
  onUpdate: (source: OtherIncomeSource) => void
}

export function MortgagePaymentInput({
  editingSource,
  mortgagePaymentId,
  onUpdate,
}: MortgagePaymentInputProps) {
  if (!editingSource.realEstateConfig) {
    return null
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={mortgagePaymentId}>Monatliche Finanzierungsrate (€)</Label>
      <Input
        id={mortgagePaymentId}
        type="number"
        value={editingSource.realEstateConfig.monthlyMortgagePayment}
        onChange={e => onUpdate({
          ...editingSource,
          realEstateConfig: {
            ...editingSource.realEstateConfig!,
            monthlyMortgagePayment: Number(e.target.value) || 0,
          },
        })}
        min={0}
        step={50}
      />
      <p className="text-xs text-gray-600">
        Monatliche Rate für Immobilienfinanzierung (0 = keine Finanzierung)
      </p>
    </div>
  )
}
