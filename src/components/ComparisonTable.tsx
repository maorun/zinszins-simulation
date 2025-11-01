import type { ComparisonStrategy } from '../utils/config-storage'
import { ComparisonTableHeader } from './ComparisonTableHeader'
import { ComparisonTableBaseRow } from './ComparisonTableBaseRow'
import { ComparisonTableRow } from './ComparisonTableRow'

// Type for comparison results
type ComparisonResult = {
  strategy: ComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
}

interface ComparisonTableProps {
  baseStrategyName: string
  baseStrategyRendite: number
  baseStrategyEndkapital: number
  baseStrategyAverageWithdrawal: number
  baseStrategyDuration: string
  comparisonResults: ComparisonResult[]
}

/**
 * Component for displaying comparison table
 * Shows base strategy and comparison strategies in a table format
 */
export function ComparisonTable({
  baseStrategyName,
  baseStrategyRendite,
  baseStrategyEndkapital,
  baseStrategyAverageWithdrawal,
  baseStrategyDuration,
  comparisonResults,
}: ComparisonTableProps) {
  if (comparisonResults.length === 0) {
    return null
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h5>📋 Vergleichstabelle</h5>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #e5e5ea',
            fontSize: '14px',
          }}
        >
          <ComparisonTableHeader />
          <tbody>
            <ComparisonTableBaseRow
              baseStrategyName={baseStrategyName}
              baseStrategyRendite={baseStrategyRendite}
              baseStrategyEndkapital={baseStrategyEndkapital}
              baseStrategyAverageWithdrawal={baseStrategyAverageWithdrawal}
              baseStrategyDuration={baseStrategyDuration}
            />
            {comparisonResults.map((result: ComparisonResult) => (
              <ComparisonTableRow key={result.strategy.id} result={result} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
