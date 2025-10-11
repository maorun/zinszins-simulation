import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'

interface Props {
  segment: WithdrawalSegment
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void
}

export function SegmentDynamicStrategyWrapper({ segment, onUpdate }: Props) {
  const updateDynamicConfig = (field: string, value: number) => {
    const defaultConfig = {
      baseWithdrawalRate: 0.04,
      upperThresholdReturn: 0.08,
      upperThresholdAdjustment: 0.05,
      lowerThresholdReturn: 0.02,
      lowerThresholdAdjustment: -0.05,
    }

    onUpdate(segment.id, {
      dynamicConfig: {
        ...defaultConfig,
        ...segment.dynamicConfig,
        [field]: value,
      },
    })
  }

  return (
    <DynamicWithdrawalConfiguration
      values={{
        baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
        upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
        upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
        lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
        lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
      }}
      onChange={{
        onBaseWithdrawalRateChange: v => updateDynamicConfig('baseWithdrawalRate', v),
        onUpperThresholdReturnChange: v => updateDynamicConfig('upperThresholdReturn', v),
        onUpperThresholdAdjustmentChange: v => updateDynamicConfig('upperThresholdAdjustment', v),
        onLowerThresholdReturnChange: v => updateDynamicConfig('lowerThresholdReturn', v),
        onLowerThresholdAdjustmentChange: v => updateDynamicConfig('lowerThresholdAdjustment', v),
      }}
    />
  )
}
