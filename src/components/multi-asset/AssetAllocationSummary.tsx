import { Info } from 'lucide-react'

interface AssetAllocationSummaryProps {
  /** Expected portfolio return as decimal (0.07 = 7%) */
  expectedReturn: number
  /** Expected portfolio risk/volatility as decimal (0.15 = 15%) */
  expectedRisk: number
  /** Number of enabled assets */
  enabledAssetsCount: number
  /** Validation errors to display */
  validationErrors: string[]
}

/**
 * Displays portfolio allocation summary with expected return and risk,
 * or validation errors if the configuration is invalid.
 */
export function AssetAllocationSummary({
  expectedReturn,
  expectedRisk,
  enabledAssetsCount,
  validationErrors,
}: AssetAllocationSummaryProps) {
  const hasErrors = validationErrors.length > 0

  // Show validation errors
  if (hasErrors) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-start gap-2 text-red-800 text-sm">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Konfigurationsfehler:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Show portfolio overview
  if (enabledAssetsCount === 0) {
    return null
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Portfolio-Übersicht</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-blue-700">Erwartete Rendite:</span>
          <span className="font-medium ml-2">
            {(expectedReturn * 100).toFixed(1)}
            %
          </span>
        </div>
        <div>
          <span className="text-blue-700">Portfoliorisiko:</span>
          <span className="font-medium ml-2">
            {(expectedRisk * 100).toFixed(1)}
            %
          </span>
        </div>
      </div>
    </div>
  )
}
