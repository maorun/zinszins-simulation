import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { useSimulation } from '../contexts/useSimulation'
import { useNestingLevel } from '../lib/nesting-utils'
import { HISTORICAL_INDICES, getHistoricalReturns, isYearRangeAvailable } from '../utils/historical-data'
import { BacktestingWarning } from './historical-return/BacktestingWarning'
import { IndexStatistics } from './historical-return/IndexStatistics'
import { DataAvailabilityWarning } from './historical-return/DataAvailabilityWarning'
import { HistoricalDataPreview } from './historical-return/HistoricalDataPreview'

// eslint-disable-next-line max-lines-per-function -- Large component render function
const HistoricalReturnConfiguration = () => {
  const {
    historicalIndex,
    setHistoricalIndex,
    startEnd,
    performSimulation,
  } = useSimulation()
  const nestingLevel = useNestingLevel()

  const [selectedIndexId, setSelectedIndexId] = useState(historicalIndex || 'dax')

  const handleIndexChange = (indexId: string) => {
    setSelectedIndexId(indexId)
    setHistoricalIndex(indexId)
    performSimulation()
  }

  const currentIndex = HISTORICAL_INDICES.find(index => index.id === selectedIndexId)
  const simulationStartYear = new Date().getFullYear()
  const simulationEndYear = startEnd[0]

  // Check if the simulation period is within available historical data
  const isAvailable = currentIndex
    ? isYearRangeAvailable(
        currentIndex.id,
        simulationStartYear,
        simulationEndYear,
      )
    : false

  // Get historical returns for display
  const historicalReturns = currentIndex ? getHistoricalReturns(
    currentIndex.id,
    Math.max(currentIndex.startYear, simulationStartYear - 5), // Show 5 years before simulation start
    Math.min(currentIndex.endYear, simulationEndYear + 5), // Show 5 years after simulation end
  ) : null

  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0"
            asChild
          >
            <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  📈 Historische Rendite-Konfiguration
                </CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-6">
              {/* Important Warning */}
              <BacktestingWarning nestingLevel={nestingLevel} />

              {/* Index Selection */}
              <div className="space-y-3">
                <Label>Historischer Index für Backtesting</Label>
                <RadioTileGroup value={selectedIndexId} onValueChange={handleIndexChange}>
                  {HISTORICAL_INDICES.map(index => (
                    <RadioTile key={index.id} value={index.id} label={index.name}>
                      <div className="space-y-1">
                        <div className="text-xs">{index.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {index.startYear}
                          -
                          {index.endYear}
                          {' '}
                          •
                          {index.currency}
                          {' '}
                          •
                          Ø
                          {(index.averageReturn * 100).toFixed(1)}
                          % p.a.
                        </div>
                      </div>
                    </RadioTile>
                  ))}
                </RadioTileGroup>
              </div>

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
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default HistoricalReturnConfiguration
