import type { OptimizationResult } from '../../utils/portfolio-optimization'

interface MetricsDisplayProps {
  result: OptimizationResult
}

/**
 * Display optimization metrics (return, risk, Sharpe ratio)
 */
export function MetricsDisplay({ result }: MetricsDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="p-3 bg-green-50 rounded-md">
        <p className="text-xs text-green-700 mb-1">Erwartete Rendite</p>
        <p className="text-lg font-semibold text-green-900">{(result.expectedReturn * 100).toFixed(2)}%</p>
      </div>
      <div className="p-3 bg-orange-50 rounded-md">
        <p className="text-xs text-orange-700 mb-1">Erwartetes Risiko</p>
        <p className="text-lg font-semibold text-orange-900">{(result.expectedVolatility * 100).toFixed(2)}%</p>
      </div>
      {result.sharpeRatio !== undefined && (
        <div className="p-3 bg-blue-50 rounded-md col-span-2">
          <p className="text-xs text-blue-700 mb-1">Sharpe Ratio</p>
          <p className="text-lg font-semibold text-blue-900">{result.sharpeRatio.toFixed(3)}</p>
        </div>
      )}
    </div>
  )
}
