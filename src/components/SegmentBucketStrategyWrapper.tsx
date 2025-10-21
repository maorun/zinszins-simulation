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
  subStrategy: '4prozent' as BucketSubStrategy,
  variabelProzent: 4,
  monatlicheBetrag: 2000,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 8,
  dynamischObereAnpassung: 5,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -5,
}

function getConfigValues(bucketConfig: WithdrawalSegment['bucketConfig']) {
  return {
    ...defaults,
    ...bucketConfig,
  }
}

function createChangeHandlers(
  segment: WithdrawalSegment,
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void,
) {
  const updateBucketConfig = (field: string, value: number | BucketSubStrategy) => {
    onUpdate(segment.id, {
      bucketConfig: {
        ...defaults,
        ...segment.bucketConfig,
        [field]: value,
      },
    })
  }

  return {
    onInitialCashCushionChange: (v: number) => updateBucketConfig('initialCashCushion', v),
    onRefillThresholdChange: (v: number) => updateBucketConfig('refillThreshold', v),
    onRefillPercentageChange: (v: number) => updateBucketConfig('refillPercentage', v),
    onBaseWithdrawalRateChange: (v: number) => updateBucketConfig('baseWithdrawalRate', v),
    onSubStrategyChange: (v: BucketSubStrategy) => updateBucketConfig('subStrategy', v),
    onVariabelProzentChange: (v: number) => updateBucketConfig('variabelProzent', v),
    onMonatlicheBetragChange: (v: number) => updateBucketConfig('monatlicheBetrag', v),
    onDynamischBasisrateChange: (v: number) => updateBucketConfig('dynamischBasisrate', v),
    onDynamischObereSchwell: (v: number) => updateBucketConfig('dynamischObereSchwell', v),
    onDynamischObereAnpassung: (v: number) => updateBucketConfig('dynamischObereAnpassung', v),
    onDynamischUntereSchwell: (v: number) => updateBucketConfig('dynamischUntereSchwell', v),
    onDynamischUntereAnpassung: (v: number) => updateBucketConfig('dynamischUntereAnpassung', v),
  }
}

export function SegmentBucketStrategyWrapper({ segment, onUpdate }: Props) {
  return (
    <BucketStrategyConfiguration
      idPrefix={`bucket-sub-strategy-${segment.id}`}
      values={getConfigValues(segment.bucketConfig)}
      onChange={createChangeHandlers(segment, onUpdate)}
    />
  )
}
