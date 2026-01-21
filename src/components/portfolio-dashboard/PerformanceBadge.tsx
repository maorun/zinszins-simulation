import { useMemo, type ReactElement } from 'react'

/**
 * Performance Badge Component
 * Displays annualized return or Sharpe ratio with color coding
 */
export function PerformanceBadge({ value, type }: { value: number; type: 'return' | 'sharpe' }): ReactElement {
  const bgColor = useMemo(() => {
    if (type === 'return') {
      if (value >= 8) return 'bg-green-100 border-green-500 text-green-800'
      if (value >= 5) return 'bg-blue-100 border-blue-500 text-blue-800'
      if (value >= 2) return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      return 'bg-red-100 border-red-500 text-red-800'
    } else {
      // Sharpe ratio
      if (value >= 1.5) return 'bg-green-100 border-green-500 text-green-800'
      if (value >= 1.0) return 'bg-blue-100 border-blue-500 text-blue-800'
      if (value >= 0.5) return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      return 'bg-orange-100 border-orange-500 text-orange-800'
    }
  }, [value, type])

  return (
    <div className={`${bgColor} border-l-4 rounded-lg p-4 text-center`}>
      <div className="text-4xl font-bold mb-1">{value.toFixed(2)}{type === 'return' ? '%' : ''}</div>
      <div className="text-sm font-medium">{type === 'return' ? 'Annualisierte Rendite' : 'Sharpe Ratio'}</div>
    </div>
  )
}
