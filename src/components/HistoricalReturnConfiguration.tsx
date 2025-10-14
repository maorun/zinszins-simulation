import { useState } from 'react'
import { AlertTriangle, TrendingUp, ChevronDown } from 'lucide-react'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { useSimulation } from '../contexts/useSimulation'
import { useNestingLevel } from '../lib/nesting-utils'
import { HISTORICAL_INDICES, getHistoricalReturns, isYearRangeAvailable } from '../utils/historical-data'
import { BacktestingWarning } from './historical-return/BacktestingWarning'

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

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

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
                <Card nestingLevel={nestingLevel}>
                  <CardContent nestingLevel={nestingLevel} className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          Statistische Kennzahlen (
                          {currentIndex.startYear}
                          -
                          {currentIndex.endYear}
                          )
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Ø Rendite p.a.:</span>
                          <span className="ml-2 font-medium">{formatPercent(currentIndex.averageReturn)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Volatilität:</span>
                          <span className="ml-2 font-medium">{formatPercent(currentIndex.volatility)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Währung:</span>
                          <span className="ml-2 font-medium">{currentIndex.currency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Datenpunkte:</span>
                          <span className="ml-2 font-medium">
                            {currentIndex.data.length}
                            {' '}
                            Jahre
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Availability Warning */}
              {!isAvailable && currentIndex && (
                <Card nestingLevel={nestingLevel} className="border-orange-200 bg-orange-50">
                  <CardContent nestingLevel={nestingLevel} className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-700">
                        <div className="font-medium mb-1">Begrenzte Datenabdeckung</div>
                        <p>
                          Für den Simulationszeitraum (
                          {simulationStartYear}
                          -
                          {simulationEndYear}
                          )
                          sind nur teilweise historische Daten verfügbar
                          (
                          {currentIndex.startYear}
                          -
                          {currentIndex.endYear}
                          ).
                          Fehlende Jahre werden mit der Durchschnittsrendite (
                          {formatPercent(currentIndex.averageReturn)}
                          ) ersetzt.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historical Data Preview */}
              {historicalReturns && Object.keys(historicalReturns).length > 0 && (
                <Card nestingLevel={nestingLevel}>
                  <CardContent nestingLevel={nestingLevel} className="pt-4">
                    <div className="space-y-3">
                      <div className="font-medium">Historische Renditen (Auswahl)</div>
                      <div className="max-h-32 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(historicalReturns)
                            .slice(-8) // Show last 8 years
                            .map(([year, returnValue]) => (
                              <div key={year} className="flex justify-between">
                                <span className="text-muted-foreground">
                                  {year}
                                  :
                                </span>
                                <span className={`font-medium ${
                                  returnValue >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                                >
                                  {formatPercent(returnValue)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Die Simulation verwendet die tatsächlichen historischen
                        Jahresrenditen für den gewählten Zeitraum.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default HistoricalReturnConfiguration
