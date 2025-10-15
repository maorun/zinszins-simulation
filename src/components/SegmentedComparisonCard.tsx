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
    <div className="border border-[#e5e5ea] rounded-md p-4 bg-[#f8f9fa]">
      <h6 className="m-0 mb-2.5 text-[#666]">
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
      <div className="mb-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 text-sm">
          {result.strategy.segments.map((segment, _segIndex) => (
            <div
              key={segment.id}
              className="p-2 bg-[#e8f4f8] rounded border border-[#d1ecf1]"
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
              <span className="text-[#666]">
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 text-sm">
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
