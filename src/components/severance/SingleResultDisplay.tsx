import {
  calculateTaxSavingsPercentage,
  isFuenftelregelungBeneficial,
  type SeveranceTaxResult,
} from '../../../helpers/abfindung'
import { formatCurrency } from '../../utils/currency'

interface SingleResultDisplayProps {
  result: SeveranceTaxResult
  showComparison?: boolean
}

/**
 * Display results for a single severance calculation
 */
export function SingleResultDisplay({ result, showComparison = true }: SingleResultDisplayProps) {
  const savingsPercentage = calculateTaxSavingsPercentage(result)
  const isBeneficial = isFuenftelregelungBeneficial(result)

  return (
    <div className="mt-4 space-y-3">
      {/* Main Result */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-medium text-green-900 mb-3">💰 Steuerberechnung mit Fünftelregelung</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-800">Bruttoabfindung:</span>
            <span className="font-medium text-green-900">{formatCurrency(result.grossAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-800">Einkommensteuer (Fünftelregelung):</span>
            <span className="font-medium text-green-900">{formatCurrency(result.fuenftelregelungIncomeTax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-800">Effektiver Steuersatz:</span>
            <span className="font-medium text-green-900">{result.effectiveTaxRate.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-green-300">
            <span className="font-medium text-green-900">Nettoabfindung:</span>
            <span className="font-bold text-green-900 text-lg">{formatCurrency(result.netAmount)}</span>
          </div>
        </div>

        {showComparison && result.standardIncomeTax > 0 && (
          <ComparisonSection
            result={result}
            savingsPercentage={savingsPercentage}
            isBeneficial={isBeneficial}
          />
        )}

        {result.capitalGainsTax > 0 && <CapitalGainsSection result={result} />}
      </div>
    </div>
  )
}

function ComparisonSection({
  result,
  savingsPercentage,
  isBeneficial,
}: {
  result: SeveranceTaxResult
  savingsPercentage: number
  isBeneficial: boolean
}) {
  return (
    <div className="mt-3 pt-3 border-t border-green-300">
      <h5 className="text-xs font-medium text-green-900 mb-2">Vergleich: Fünftelregelung vs. Standard</h5>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-green-800">Normale Besteuerung:</span>
          <span className="text-green-900">{formatCurrency(result.standardIncomeTax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Fünftelregelung:</span>
          <span className="text-green-900">{formatCurrency(result.fuenftelregelungIncomeTax)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span className="text-green-800">Steuerersparnis:</span>
          <span className={result.taxSavings > 0 ? 'text-green-900' : 'text-red-900'}>
            {formatCurrency(result.taxSavings)}
            {savingsPercentage > 0 && ` (${savingsPercentage.toFixed(1)}%)`}
          </span>
        </div>
      </div>

      {isBeneficial && (
        <div className="mt-2 text-xs bg-green-100 text-green-900 p-2 rounded">
          ✅ Die Fünftelregelung ist vorteilhaft (Ersparnis &gt; 5%)
        </div>
      )}
    </div>
  )
}

function CapitalGainsSection({ result }: { result: SeveranceTaxResult }) {
  return (
    <div className="mt-3 pt-3 border-t border-green-300 text-xs">
      <div className="flex justify-between text-green-800">
        <span>Kapitalertragsteuer:</span>
        <span>{formatCurrency(result.capitalGainsTax)}</span>
      </div>
      <div className="flex justify-between font-medium mt-1">
        <span className="text-green-900">Gesamte Steuerlast:</span>
        <span className="text-green-900">{formatCurrency(result.totalTaxBurden)}</span>
      </div>
    </div>
  )
}
