import { Info } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'

interface TaxComparisonData {
  normalTax: number
  progressionTax: number
  additionalTax: number
  normalRate: number
  progressionRate: number
  rateIncrease: number
}

interface ProgressionsvorbehaltTaxComparisonProps {
  comparisonData: TaxComparisonData
  exampleTaxableIncome: number
}

/**
 * Display tax comparison showing impact of Progressionsvorbehalt
 */
export function ProgressionsvorbehaltTaxComparison({
  comparisonData,
  exampleTaxableIncome,
}: ProgressionsvorbehaltTaxComparisonProps) {
  return (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-amber-600" />
        <span className="font-semibold text-amber-900">
          Steuerliche Auswirkungen (Beispiel: {formatCurrency(exampleTaxableIncome)} zu verst. Einkommen)
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 rounded-lg bg-white p-3">
          <p className="text-xs text-muted-foreground">Ohne Progressionsvorbehalt</p>
          <p className="text-xl font-bold">{formatCurrency(comparisonData.normalTax)}</p>
          <p className="text-sm text-muted-foreground">Steuersatz: {comparisonData.normalRate.toFixed(2)}%</p>
        </div>

        <div className="space-y-1 rounded-lg bg-white p-3">
          <p className="text-xs text-muted-foreground">Mit Progressionsvorbehalt</p>
          <p className="text-xl font-bold text-amber-700">{formatCurrency(comparisonData.progressionTax)}</p>
          <p className="text-sm text-muted-foreground">Steuersatz: {comparisonData.progressionRate.toFixed(2)}%</p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-100 p-3">
        <p className="text-sm">
          <span className="font-semibold">Zusätzliche Steuerlast:</span>{' '}
          <span className="font-bold text-amber-900">{formatCurrency(comparisonData.additionalTax)}</span>
          <span className="text-muted-foreground">
            {' '}
            (Steuersatz +{comparisonData.rateIncrease.toFixed(2)} Prozentpunkte)
          </span>
        </p>
      </div>
    </div>
  )
}
