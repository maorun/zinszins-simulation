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

function StrategyHeader({ strategyName, segmentCount }: { strategyName: string, segmentCount: number }) {
  return (
    <h6 className="m-0 mb-2.5 text-[#666]">
      {strategyName}
      {' '}
      (
      {segmentCount}
      {' '}
      Phase
      {segmentCount !== 1 ? 'n' : ''}
      )
    </h6>
  )
}

function SegmentOverview({ segments }: { segments: SegmentedComparisonStrategy['segments'] }) {
  return (
    <div className="mb-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 text-sm">
        {segments.map(segment => (
          <div key={segment.id} className="p-2 bg-[#e8f4f8] rounded border border-[#d1ecf1]">
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
  )
}

function ResultsSummary({ result }: { result: SegmentedComparisonResult }) {
  return (
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
  )
}

/**
 * Component for displaying a single segmented comparison strategy card
 * Shows strategy overview, segment details, and results summary
 */
export function SegmentedComparisonCard({ result }: SegmentedComparisonCardProps) {
  return (
    <div className="border border-[#e5e5ea] rounded-md p-4 bg-[#f8f9fa]">
      <StrategyHeader strategyName={result.strategy.name} segmentCount={result.strategy.segments.length} />
      <SegmentOverview segments={result.strategy.segments} />
      <ResultsSummary result={result} />
    </div>
  )
}
