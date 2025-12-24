import type { SeveranceComparisonResult } from '../../../helpers/abfindung'
import { formatCurrency } from '../../utils/currency'

interface YearComparisonDisplayProps {
  results: SeveranceComparisonResult[]
}

/**
 * Display comparison of severance across multiple years
 */
export function YearComparisonDisplay({ results }: YearComparisonDisplayProps) {
  const optimalYear = results.find(r => r.isOptimal)

  return (
    <div className="mt-4 space-y-3">
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-3">📅 Jahresvergleich - Optimaler Zeitpunkt</h4>

        {optimalYear && <OptimalYearHighlight optimalYear={optimalYear} />}

        <div className="space-y-2">
          {results.map(result => (
            <YearResultCard key={result.year} result={result} />
          ))}
        </div>
      </div>
    </div>
  )
}

function OptimalYearHighlight({ optimalYear }: { optimalYear: SeveranceComparisonResult }) {
  return (
    <div className="mb-3 p-3 bg-purple-100 border border-purple-300 rounded">
      <div className="text-sm font-medium text-purple-900">🎯 Optimales Jahr: {optimalYear.year}</div>
      <div className="text-xs text-purple-800 mt-1">
        Gesamte Steuerlast: {formatCurrency(optimalYear.taxResult.totalTaxBurden)}
      </div>
    </div>
  )
}

function YearResultCard({ result }: { result: SeveranceComparisonResult }) {
  return (
    <div
      className={`p-3 rounded ${
        result.isOptimal ? 'bg-purple-200 border border-purple-400' : 'bg-white border border-purple-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="font-medium text-sm">
          {result.year} {result.isOptimal && '⭐'}
        </div>
        <div className="text-xs text-purple-800">Einkommen: {formatCurrency(result.annualGrossIncome)}</div>
      </div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-purple-700">Nettoabfindung:</span>
          <span className="font-medium">{formatCurrency(result.taxResult.netAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-700">Gesamtsteuerlast:</span>
          <span>{formatCurrency(result.taxResult.totalTaxBurden)}</span>
        </div>
        {result.taxResult.taxSavings > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Ersparnis (Fünftelreg.):</span>
            <span>{formatCurrency(result.taxResult.taxSavings)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
