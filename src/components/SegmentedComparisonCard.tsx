import { formatCurrency } from '../utils/currency'
import { getStrategyDisplayName } from '../utils/withdrawal-strategy-utils'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { SegmentedComparisonStrategy } from '../utils/config-storage'

// Type for segmented comparison results
export type SegmentedComparisonResult = {
  strategy: SegmentedComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
  result: WithdrawalResult // Full withdrawal result for detailed analysis
}

interface SegmentedComparisonCardProps {
  result: SegmentedComparisonResult
}

/**
 * Component for displaying a single segmented comparison strategy card
 * Shows strategy overview, segment details, and results summary
 */
export function SegmentedComparisonCard({
  result,
}: SegmentedComparisonCardProps) {
  return (
    <div
      style={{
        border: '1px solid #e5e5ea',
        borderRadius: '6px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <h6 style={{ margin: '0 0 10px 0', color: '#666' }}>
        {result.strategy.name}
        {' '}
        (
        {result.strategy.segments.length}
        {' '}
        Phase
        {result.strategy.segments.length !== 1 ? 'n' : ''}
        )
      </h6>

      {/* Strategy segments overview */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '8px',
          fontSize: '14px',
        }}
        >
          {result.strategy.segments.map((segment, _segIndex) => (
            <div
              key={segment.id}
              style={{
                padding: '8px',
                backgroundColor: '#e8f4f8',
                borderRadius: '4px',
                border: '1px solid #d1ecf1',
              }}
            >
              <strong>{segment.name}</strong>
              {' '}
              (
              {segment.startYear}
              {' '}
              -
              {segment.endYear}
              )
              <br />
              <span style={{ color: '#666' }}>
                {getStrategyDisplayName(segment.strategy)}
                {' '}
                -
                {((segment.returnConfig.fixedRate || 0.05) * 100).toFixed(1)}
                % Rendite
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Results summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          fontSize: '14px',
        }}
      >
        <div>
          <strong>Endkapital:</strong>
          {' '}
          {formatCurrency(result.finalCapital)}
        </div>
        <div>
          <strong>Gesamtentnahme:</strong>
          {' '}
          {formatCurrency(result.totalWithdrawal)}
        </div>
        <div>
          <strong>Ø Jährliche Entnahme:</strong>
          {' '}
          {formatCurrency(result.averageAnnualWithdrawal)}
        </div>
        <div>
          <strong>Laufzeit:</strong>
          {' '}
          {typeof result.duration === 'number'
            ? `${result.duration} Jahr${result.duration === 1 ? '' : 'e'}`
            : result.duration}
        </div>
      </div>
    </div>
  )
}
