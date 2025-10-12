import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

interface SegmentedWithdrawalConfigSectionProps {
  segments: WithdrawalSegment[]
  onSegmentsChange: (segments: WithdrawalSegment[]) => void
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function SegmentedWithdrawalConfigSection({
  segments,
  onSegmentsChange,
  withdrawalStartYear,
  withdrawalEndYear,
}: SegmentedWithdrawalConfigSectionProps) {
  // Import is deferred to reduce circular dependency issues
  const { WithdrawalSegmentForm } = require('./WithdrawalSegmentForm')

  return (
    <WithdrawalSegmentForm
      segments={segments}
      onSegmentsChange={onSegmentsChange}
      withdrawalStartYear={withdrawalStartYear}
      withdrawalEndYear={withdrawalEndYear}
    />
  )
}
