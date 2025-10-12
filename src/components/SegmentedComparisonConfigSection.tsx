import type { SegmentedComparisonStrategy } from '../utils/config-storage'
import { SegmentedComparisonConfiguration } from './SegmentedComparisonConfiguration'

interface SegmentedComparisonConfigSectionProps {
  segmentedComparisonStrategies: SegmentedComparisonStrategy[]
  withdrawalStartYear: number
  withdrawalEndYear: number
  onAddStrategy: (strategy: SegmentedComparisonStrategy) => void
  onUpdateStrategy: (id: string, updates: Partial<SegmentedComparisonStrategy>) => void
  onRemoveStrategy: (id: string) => void
}

export function SegmentedComparisonConfigSection({
  segmentedComparisonStrategies,
  withdrawalStartYear,
  withdrawalEndYear,
  onAddStrategy,
  onUpdateStrategy,
  onRemoveStrategy,
}: SegmentedComparisonConfigSectionProps) {
  return (
    <SegmentedComparisonConfiguration
      segmentedComparisonStrategies={segmentedComparisonStrategies}
      withdrawalStartYear={withdrawalStartYear}
      withdrawalEndYear={withdrawalEndYear}
      onAddStrategy={onAddStrategy}
      onUpdateStrategy={onUpdateStrategy}
      onRemoveStrategy={onRemoveStrategy}
    />
  )
}
