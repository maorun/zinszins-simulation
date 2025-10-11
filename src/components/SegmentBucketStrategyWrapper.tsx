import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import { BucketStrategyConfiguration } from './BucketStrategyConfiguration'
import type { BucketSubStrategy } from '../../helpers/withdrawal'

interface Props {
  segment: WithdrawalSegment
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void
}

const defaults = {
  initialCashCushion: 20000,
  refillThreshold: 5000,
  refillPercentage: 0.5,
  baseWithdrawalRate: 0.04,
}

export function SegmentBucketStrategyWrapper({ segment, onUpdate }: Props) {
  const updateBucketConfig = (field: string, value: number | BucketSubStrategy) => {
    onUpdate(segment.id, {
      bucketConfig: {
        ...defaults,
        ...segment.bucketConfig,
        [field]: value,
      },
    })
  }

  return (
    <BucketStrategyConfiguration
      idPrefix={`bucket-sub-strategy-${segment.id}`}
      values={{
        initialCashCushion: segment.bucketConfig?.initialCashCushion || defaults.initialCashCushion,
        refillThreshold: segment.bucketConfig?.refillThreshold || defaults.refillThreshold,
        refillPercentage: segment.bucketConfig?.refillPercentage || defaults.refillPercentage,
        baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || defaults.baseWithdrawalRate,
        subStrategy: segment.bucketConfig?.subStrategy || '4prozent',
        variabelProzent: segment.bucketConfig?.variabelProzent || 4,
        monatlicheBetrag: segment.bucketConfig?.monatlicheBetrag || 2000,
        dynamischBasisrate: segment.bucketConfig?.dynamischBasisrate || 4,
        dynamischObereSchwell: segment.bucketConfig?.dynamischObereSchwell || 8,
        dynamischObereAnpassung: segment.bucketConfig?.dynamischObereAnpassung || 5,
        dynamischUntereSchwell: segment.bucketConfig?.dynamischUntereSchwell || 2,
        dynamischUntereAnpassung: segment.bucketConfig?.dynamischUntereAnpassung || -5,
      }}
      onChange={{
        onInitialCashCushionChange: v => updateBucketConfig('initialCashCushion', v),
        onRefillThresholdChange: v => updateBucketConfig('refillThreshold', v),
        onRefillPercentageChange: v => updateBucketConfig('refillPercentage', v),
        onBaseWithdrawalRateChange: v => updateBucketConfig('baseWithdrawalRate', v),
        onSubStrategyChange: v => updateBucketConfig('subStrategy', v),
        onVariabelProzentChange: v => updateBucketConfig('variabelProzent', v),
        onMonatlicheBetragChange: v => updateBucketConfig('monatlicheBetrag', v),
        onDynamischBasisrateChange: v => updateBucketConfig('dynamischBasisrate', v),
        onDynamischObereSchwell: v => updateBucketConfig('dynamischObereSchwell', v),
        onDynamischObereAnpassung: v => updateBucketConfig('dynamischObereAnpassung', v),
        onDynamischUntereSchwell: v => updateBucketConfig('dynamischUntereSchwell', v),
        onDynamischUntereAnpassung: v => updateBucketConfig('dynamischUntereAnpassung', v),
      }}
    />
  )
}
