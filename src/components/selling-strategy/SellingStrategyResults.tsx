import { formatCurrency } from '../../utils/currency'
import type { SellingStrategyConfig, SellingStrategyResult } from '../../../helpers/selling-strategy'

interface SellingStrategyResultsProps {
  result: SellingStrategyResult | null
  config: SellingStrategyConfig
}

export function SellingStrategyResults({ result, config }: SellingStrategyResultsProps) {
  if (!result) return null

  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="font-medium text-green-900 mb-3">💰 Ergebnis ({config.method.toUpperCase()})</h4>
      <div className="space-y-2 text-sm">
        <ResultRow label="Verkaufter Betrag:" value={formatCurrency(result.totalAmountSold)} />
        <ResultRow label="Kostenbasis:" value={formatCurrency(result.totalCostBasis)} />
        <ResultRow label="Steuerpflichtige Gewinne:" value={formatCurrency(result.totalTaxableGains)} />
        <ResultRow label="Steuerlast:" value={formatCurrency(result.totalTaxOwed)} />
        <div className="flex justify-between pt-2 border-t border-green-300">
          <span className="font-medium text-green-900">Nettoerlös:</span>
          <span className="font-bold text-green-900 text-lg">
            {formatCurrency(result.totalNetProceeds)}
          </span>
        </div>
        <ResultRow
          label="Steuereffizienz:"
          value={`${(result.taxEfficiency * 100).toFixed(2)}%`}
        />
      </div>

      {/* Year Summary */}
      {Object.keys(result.yearSummary).length > 1 && (
        <YearSummary yearSummary={result.yearSummary} />
      )}
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-green-800">{label}</span>
      <span className="font-medium text-green-900">{value}</span>
    </div>
  )
}

function YearSummary({ yearSummary }: { yearSummary: SellingStrategyResult['yearSummary'] }) {
  return (
    <div className="mt-3 pt-3 border-t border-green-300">
      <p className="font-medium text-green-900 text-xs mb-2">Aufschlüsselung nach Jahr:</p>
      <div className="space-y-1 text-xs">
        {Object.entries(yearSummary).map(([year, summary]) => (
          <div key={year} className="flex justify-between text-green-800">
            <span>{year}:</span>
            <span>
              {formatCurrency(summary.amountSold)} → Steuer: {formatCurrency(summary.taxOwed)} (Freibetrag: {formatCurrency(summary.freibetragUsed)})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
