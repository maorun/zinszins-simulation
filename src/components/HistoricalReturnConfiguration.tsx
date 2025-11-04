import { Card } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { useNestingLevel } from '../lib/nesting-utils'
import { useHistoricalIndexSelection } from './historical-return/useHistoricalIndexSelection'
import { useHistoricalDataPreparation } from './historical-return/useHistoricalDataPreparation'
import { HistoricalReturnHeader } from './historical-return/HistoricalReturnHeader'
import { HistoricalReturnContent } from './historical-return/HistoricalReturnContent'

const HistoricalReturnConfiguration = () => {
  const nestingLevel = useNestingLevel()
  const { selectedIndexId, handleIndexChange } = useHistoricalIndexSelection()
  const {
    currentIndex,
    simulationStartYear,
    simulationEndYear,
    isAvailable,
    historicalReturns,
  } = useHistoricalDataPreparation(selectedIndexId)

  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel}>
        <HistoricalReturnHeader nestingLevel={nestingLevel} />
        <CollapsibleContent>
          <HistoricalReturnContent
            nestingLevel={nestingLevel}
            selectedIndexId={selectedIndexId}
            onIndexChange={handleIndexChange}
            currentIndex={currentIndex}
            simulationStartYear={simulationStartYear}
            simulationEndYear={simulationEndYear}
            isAvailable={isAvailable}
            historicalReturns={historicalReturns}
          />
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default HistoricalReturnConfiguration
