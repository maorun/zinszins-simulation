import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import { VariablePercentWithdrawalConfig } from './VariablePercentWithdrawalConfig'
import { MonthlyWithdrawalConfig } from './MonthlyWithdrawalConfig'
import { SegmentDynamicStrategyWrapper } from './SegmentDynamicStrategyWrapper'
import { SegmentBucketStrategyWrapper } from './SegmentBucketStrategyWrapper'
import { SegmentRMDStrategyWrapper } from './SegmentRMDStrategyWrapper'
import { SegmentSteueroptimierteWrapper } from './SegmentSteueroptimierteWrapper'

interface SegmentStrategyConfigProps {
  segment: WithdrawalSegment
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void
}

export function SegmentStrategyConfig({ segment, onUpdate }: SegmentStrategyConfigProps) {
  const { strategy } = segment

  if (strategy === 'variabel_prozent') {
    return (
      <VariablePercentWithdrawalConfig
        customPercentage={segment.customPercentage}
        onCustomPercentageChange={(value) => onUpdate(segment.id, { customPercentage: value })}
      />
    )
  }

  if (strategy === 'monatlich_fest') {
    return (
      <MonthlyWithdrawalConfig
        monthlyConfig={segment.monthlyConfig}
        onMonthlyConfigChange={(config) => onUpdate(segment.id, { monthlyConfig: config })}
      />
    )
  }

  if (strategy === 'dynamisch') {
    return <SegmentDynamicStrategyWrapper segment={segment} onUpdate={onUpdate} />
  }

  if (strategy === 'bucket_strategie') {
    return <SegmentBucketStrategyWrapper segment={segment} onUpdate={onUpdate} />
  }

  if (strategy === 'rmd') {
    return <SegmentRMDStrategyWrapper segment={segment} onUpdate={onUpdate} />
  }

  if (strategy === 'steueroptimiert') {
    return <SegmentSteueroptimierteWrapper segment={segment} onUpdate={onUpdate} />
  }

  return null
}
