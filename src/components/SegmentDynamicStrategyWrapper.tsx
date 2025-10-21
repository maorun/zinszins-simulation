import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'

interface Props {
  segment: WithdrawalSegment
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void
}

const DEFAULT_DYNAMIC_CONFIG = {
  baseWithdrawalRate: 0.04,
  upperThresholdReturn: 0.08,
  upperThresholdAdjustment: 0.05,
  lowerThresholdReturn: 0.02,
  lowerThresholdAdjustment: -0.05,
}

function getConfigValues(dynamicConfig: WithdrawalSegment['dynamicConfig']) {
  return {
    ...DEFAULT_DYNAMIC_CONFIG,
    ...dynamicConfig,
  }
}

function createChangeHandlers(
  segment: WithdrawalSegment,
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void,
) {
  const updateDynamicConfig = (field: string, value: number) => {
    onUpdate(segment.id, {
      dynamicConfig: {
        ...DEFAULT_DYNAMIC_CONFIG,
        ...segment.dynamicConfig,
        [field]: value,
      },
    })
  }

  return {
    onBaseWithdrawalRateChange: (v: number) => updateDynamicConfig('baseWithdrawalRate', v),
    onUpperThresholdReturnChange: (v: number) => updateDynamicConfig('upperThresholdReturn', v),
    onUpperThresholdAdjustmentChange: (v: number) => updateDynamicConfig('upperThresholdAdjustment', v),
    onLowerThresholdReturnChange: (v: number) => updateDynamicConfig('lowerThresholdReturn', v),
    onLowerThresholdAdjustmentChange: (v: number) => updateDynamicConfig('lowerThresholdAdjustment', v),
  }
}

export function SegmentDynamicStrategyWrapper({ segment, onUpdate }: Props) {
  return (
    <DynamicWithdrawalConfiguration
      values={getConfigValues(segment.dynamicConfig)}
      onChange={createChangeHandlers(segment, onUpdate)}
    />
  )
}
