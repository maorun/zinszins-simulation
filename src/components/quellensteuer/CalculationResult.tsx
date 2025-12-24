import { formatCurrency } from '../../utils/currency'
import type { QuellensteuerconfigCalculationResult } from '../../../helpers/quellensteuer'

interface CalculationResultProps {
  result: QuellensteuerconfigCalculationResult
}

export function CalculationResult({ result }: CalculationResultProps) {
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-green-200">
      <div className="font-semibold text-base text-green-900">📊 Steuerberechnung</div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ausländische Einkünfte:</span>
          <span className="font-medium">{formatCurrency(result.foreignIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gezahlte Quellensteuer:</span>
          <span className="font-medium text-red-600">-{formatCurrency(result.foreignWithholdingTaxPaid)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Deutsche Steuer (vor Anrechnung):</span>
          <span className="font-medium">{formatCurrency(result.germanTaxDue)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold">Anrechenbare Quellensteuer:</span>
          <span className="font-bold text-green-600">{formatCurrency(result.creditableAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Verbleibende deutsche Steuer:</span>
          <span className="font-bold">{formatCurrency(result.remainingGermanTax)}</span>
        </div>
      </div>

      {result.limitApplied && (
        <div className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
          ⚠️ <strong>Anrechnung begrenzt:</strong> Die ausländische Quellensteuer übersteigt die deutsche Steuer. Der
          nicht anrechenbare Betrag von {formatCurrency(result.foreignWithholdingTaxPaid - result.creditableAmount)}{' '}
          kann nach § 32d Abs. 5 EStG nicht erstattet werden.
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t pt-2">
        <strong>Erklärung:</strong> {result.explanation}
      </div>
    </div>
  )
}
