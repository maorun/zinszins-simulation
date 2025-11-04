import { CardContent } from '../ui/card'
import { BacktestingWarning } from './BacktestingWarning'
import { IndexStatistics } from './IndexStatistics'
import { DataAvailabilityWarning } from './DataAvailabilityWarning'
import { HistoricalDataPreview } from './HistoricalDataPreview'
import { IndexSelectionRadioGroup } from './IndexSelectionRadioGroup'
import type { HistoricalIndex } from '../../utils/historical-data'

interface HistoricalReturnContentProps {
  nestingLevel: number
  selectedIndexId: string
  onIndexChange: (indexId: string) => void
  currentIndex: HistoricalIndex | undefined
  simulationStartYear: number
  simulationEndYear: number
  isAvailable: boolean
  historicalReturns: Record<number, number> | null
}

export const HistoricalReturnContent = ({
  nestingLevel,
  selectedIndexId,
  onIndexChange,
  currentIndex,
  simulationStartYear,
  simulationEndYear,
  isAvailable,
  historicalReturns,
}: HistoricalReturnContentProps) => (
  <CardContent nestingLevel={nestingLevel}>
    <div className="space-y-6">
      {/* Important Warning */}
      <BacktestingWarning nestingLevel={nestingLevel} />

      {/* Index Selection */}
      <IndexSelectionRadioGroup
        selectedIndexId={selectedIndexId}
        onIndexChange={onIndexChange}
      />

      {/* Index Statistics */}
      {currentIndex && (
        <IndexStatistics index={currentIndex} nestingLevel={nestingLevel} />
      )}

      {/* Data Availability Warning */}
      {!isAvailable && currentIndex && (
        <DataAvailabilityWarning
          index={currentIndex}
          simulationStartYear={simulationStartYear}
          simulationEndYear={simulationEndYear}
          nestingLevel={nestingLevel}
        />
      )}

      {/* Historical Data Preview */}
      {historicalReturns && (
        <HistoricalDataPreview
          historicalReturns={historicalReturns}
          nestingLevel={nestingLevel}
        />
      )}
    </div>
  </CardContent>
)
