import { formatCurrency } from '../../utils/currency'
import type { SellingStrategyResult } from '../../../helpers/selling-strategy'

interface SellingStrategyComparisonProps {
  comparison: {
    fifo: SellingStrategyResult
    lifo: SellingStrategyResult
    taxOptimized: SellingStrategyResult
    bestMethod: 'fifo' | 'lifo' | 'tax-optimized'
    taxSavings: number
  } | null
}

export function SellingStrategyComparison({ comparison }: SellingStrategyComparisonProps) {
  if (!comparison) return null

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-3">📊 Methodenvergleich</h4>
      <div className="space-y-3">
        <ComparisonRow
          method="FIFO"
          result={comparison.fifo}
          isBest={comparison.bestMethod === 'fifo'}
        />
        <ComparisonRow
          method="LIFO"
          result={comparison.lifo}
          isBest={comparison.bestMethod === 'lifo'}
        />
        <ComparisonRow
          method="Steueroptimiert"
          result={comparison.taxOptimized}
          isBest={comparison.bestMethod === 'tax-optimized'}
        />

        <div className="pt-3 border-t border-blue-300">
          <p className="text-sm text-blue-900 font-medium">
            ✅ Beste Methode: <span className="uppercase">{comparison.bestMethod}</span>
          </p>
          {comparison.taxSavings > 0 && (
            <p className="text-xs text-blue-800">
              Steuerersparnis gegenüber der ungünstigsten Methode: {formatCurrency(comparison.taxSavings)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface ComparisonRowProps {
  method: string
  result: SellingStrategyResult
  isBest: boolean
}

function ComparisonRow({ method, result, isBest }: ComparisonRowProps) {
  return (
    <div
      className={`p-2 rounded ${
        isBest ? 'bg-green-100 border border-green-300' : 'bg-white border border-blue-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm">
          {isBest && '✅ '}
          {method}
        </span>
        <div className="text-right text-sm">
          <div>Steuer: {formatCurrency(result.totalTaxOwed)}</div>
          <div className="text-xs text-muted-foreground">
            Nettoerlös: {formatCurrency(result.totalNetProceeds)}
          </div>
        </div>
      </div>
    </div>
  )
}
