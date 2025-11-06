import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import { RMDWithdrawalConfiguration } from './rmd-withdrawal/RMDWithdrawalConfiguration'
import type { RMDConfig } from '../../helpers/withdrawal'

interface Props {
  segment: WithdrawalSegment
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void
}

export function SegmentRMDStrategyWrapper({ segment, onUpdate }: Props) {
  const updateRMDConfig = (updates: Partial<RMDConfig>) => {
    onUpdate(segment.id, {
      rmdConfig: {
        startAge: segment.rmdConfig?.startAge || 65,
        lifeExpectancyTable: segment.rmdConfig?.lifeExpectancyTable || 'german_2020_22',
        customLifeExpectancy: segment.rmdConfig?.customLifeExpectancy,
        ...updates,
      },
    })
  }

  return (
    <RMDWithdrawalConfiguration
      values={{
        startAge: segment.rmdConfig?.startAge || 65,
        lifeExpectancyTable: segment.rmdConfig?.lifeExpectancyTable || 'german_2020_22',
        customLifeExpectancy: segment.rmdConfig?.customLifeExpectancy,
      }}
      onChange={{
        onStartAgeChange: age => updateRMDConfig({ startAge: age }),
        onLifeExpectancyTableChange: table => updateRMDConfig({ lifeExpectancyTable: table }),
        onCustomLifeExpectancyChange: years =>
          updateRMDConfig({
            lifeExpectancyTable: 'custom',
            customLifeExpectancy: years,
          }),
      }}
    />
  )
}
