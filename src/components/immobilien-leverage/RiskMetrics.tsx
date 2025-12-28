import { AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'

interface RiskMetricsProps {
  warnings: string[]
  interestCoverageRatio: number
  debtServiceCoverageRatio: number
  mortgageToIncomeRatio: number
  annualAfa: number
}

export function RiskMetrics({
  warnings,
  interestCoverageRatio,
  debtServiceCoverageRatio,
  mortgageToIncomeRatio,
  annualAfa,
}: RiskMetricsProps) {
  return (
    <>
      {warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-yellow-900">Risikohinweise:</p>
              <ul className="text-xs text-yellow-800 space-y-0.5 list-disc list-inside">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-muted-foreground mb-1">Zinsdeckung</p>
          <p className="font-semibold">
            {interestCoverageRatio === Infinity ? '∞' : interestCoverageRatio.toFixed(2)}
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-muted-foreground mb-1">Schuldendienstdeckung</p>
          <p className="font-semibold">
            {debtServiceCoverageRatio === Infinity ? '∞' : debtServiceCoverageRatio.toFixed(2)}
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-muted-foreground mb-1">Belastungsquote</p>
          <p className="font-semibold">{mortgageToIncomeRatio.toFixed(1)}%</p>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-muted-foreground mb-1">AfA/Jahr</p>
          <p className="font-semibold">{formatCurrency(annualAfa)}</p>
        </div>
      </div>
    </>
  )
}
