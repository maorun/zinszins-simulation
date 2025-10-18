import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Slider } from './ui/slider'
import {
  getAvailableInflationScenarios,
  applyInflationScenario,
  applyReturnModifiers,
  calculateCumulativeInflation,
  calculateAverageInflation,
  calculatePurchasingPowerImpact,
  type InflationScenarioId,
  type InflationScenario,
} from '../../helpers/inflation-scenarios'
import { generateFormId } from '../utils/unique-id'

interface InflationScenarioConfigurationProps {
  onScenarioChange?: (
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string
  ) => void
  simulationStartYear: number
}

/**
 * Inflation Scenario Configuration Component
 * Allows users to simulate different inflation scenarios (hyperinflation, deflation, stagflation)
 */
const InflationScenarioConfiguration = ({
  onScenarioChange,
  simulationStartYear,
}: InflationScenarioConfigurationProps) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState<InflationScenarioId | 'none'>('none')
  const [scenarioYear, setScenarioYear] = useState(simulationStartYear + 5)

  // Generate stable IDs for form elements
  const enabledRadioId = useMemo(() => generateFormId('inflation-scenario', 'enabled'), [])
  const disabledRadioId = useMemo(() => generateFormId('inflation-scenario', 'disabled'), [])
  const scenarioYearSliderId = useMemo(() => generateFormId('inflation-scenario', 'year'), [])

  const availableScenarios = useMemo(() => getAvailableInflationScenarios(), [])

  const selectedScenario = useMemo(() => {
    if (selectedScenarioId === 'none')
      return null
    return availableScenarios.find(s => s.id === selectedScenarioId) || null
  }, [selectedScenarioId, availableScenarios])

  const cumulativeInflation = useMemo(() => {
    if (!selectedScenario)
      return null
    return calculateCumulativeInflation(selectedScenario)
  }, [selectedScenario])

  const averageInflation = useMemo(() => {
    if (!selectedScenario)
      return null
    return calculateAverageInflation(selectedScenario)
  }, [selectedScenario])

  const purchasingPowerImpact = useMemo(() => {
    if (!selectedScenario)
      return null
    return calculatePurchasingPowerImpact(selectedScenario, 100000)
  }, [selectedScenario])

  const handleEnabledChange = (value: string) => {
    const enabled = value === 'enabled'
    setIsEnabled(enabled)

    if (!enabled) {
      onScenarioChange?.(null, null, '')
    }
    else if (selectedScenario) {
      const inflationRates = applyInflationScenario(scenarioYear, selectedScenario)
      const returnModifiers = applyReturnModifiers(scenarioYear, selectedScenario)
      onScenarioChange?.(inflationRates, returnModifiers, selectedScenario.name)
    }
  }

  const handleScenarioChange = (scenarioId: InflationScenarioId) => {
    setSelectedScenarioId(scenarioId)
    const scenario = availableScenarios.find(s => s.id === scenarioId)

    if (scenario && isEnabled) {
      const inflationRates = applyInflationScenario(scenarioYear, scenario)
      const returnModifiers = applyReturnModifiers(scenarioYear, scenario)
      onScenarioChange?.(inflationRates, returnModifiers, scenario.name)
    }
  }

  const handleYearChange = (year: number) => {
    setScenarioYear(year)

    if (selectedScenario && isEnabled) {
      const inflationRates = applyInflationScenario(year, selectedScenario)
      const returnModifiers = applyReturnModifiers(year, selectedScenario)
      onScenarioChange?.(inflationRates, returnModifiers, selectedScenario.name)
    }
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${(value * 100).toFixed(1)}%`
  }

  // Scenario color configuration
  const SCENARIO_COLORS: Record<string, { bg: string, text: string }> = {
    hyperinflation: { bg: 'bg-red-50 border-red-200', text: 'text-red-900' },
    deflation: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900' },
  }
  const DEFAULT_COLORS = { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-900' }

  const renderScenarioDetails = (scenario: InflationScenario) => {
    const years = Object.keys(scenario.yearlyInflationRates).map(Number).sort((a, b) => a - b)
    const colors = SCENARIO_COLORS[scenario.id] || DEFAULT_COLORS

    return (
      <div className={`mt-4 p-4 ${colors.bg} border rounded-lg`}>
        <h5 className={`font-semibold ${colors.text} mb-2`}>📊 Szenario-Details</h5>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Beschreibung:</strong>
            {' '}
            {scenario.description}
          </p>
          <p>
            <strong>Dauer:</strong>
            {' '}
            {scenario.duration}
            {' '}
            {scenario.duration === 1 ? 'Jahr' : 'Jahre'}
          </p>

          <div>
            <strong>Jährliche Inflationsraten:</strong>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {years.map((yearOffset) => {
                const inflationRate = scenario.yearlyInflationRates[yearOffset]
                return (
                  <div key={yearOffset} className="text-xs">
                    Jahr
                    {' '}
                    {yearOffset + 1}
                    :
                    {' '}
                    {formatPercent(inflationRate ?? 0)}
                  </div>
                )
              })}
            </div>
          </div>

          {scenario.yearlyReturnModifiers && (
            <div>
              <strong>Rendite-Anpassungen (Stagflation):</strong>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {Object.entries(scenario.yearlyReturnModifiers).map(([yearOffset, modifier]) => (
                  <div key={yearOffset} className="text-xs">
                    Jahr
                    {' '}
                    {Number(yearOffset) + 1}
                    :
                    {' '}
                    {formatPercent(modifier)}
                    {' '}
                    Rendite
                  </div>
                ))}
              </div>
            </div>
          )}

          {cumulativeInflation !== null && (
            <p>
              <strong>Kumulative Inflation:</strong>
              {' '}
              {formatPercent(cumulativeInflation)}
            </p>
          )}

          {averageInflation !== null && (
            <p>
              <strong>Durchschnittliche jährliche Inflation:</strong>
              {' '}
              {formatPercent(averageInflation)}
            </p>
          )}

          {purchasingPowerImpact !== null && (
            <p>
              <strong>Kaufkraftverlust:</strong>
              {' '}
              100.000 € haben nach
              {' '}
              {scenario.duration}
              {' '}
              Jahren eine reale Kaufkraft von ca.
              {' '}
              {purchasingPowerImpact.toLocaleString('de-DE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              {' '}
              €
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                🌡️ Inflationsszenarien
              </CardTitle>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Information Panel */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">ℹ️ Was sind Inflationsszenarien?</h5>
              <p className="text-sm text-gray-700 mb-2">
                Inflationsszenarien helfen Ihnen, die Auswirkungen unterschiedlicher Inflationsentwicklungen
                auf Ihr Portfolio zu verstehen. Sie können Hyperinflation (anhaltend hohe Inflation),
                Deflation (fallende Preise) oder Stagflation (hohe Inflation bei schwachem Wachstum) simulieren.
              </p>
              <p className="text-sm text-blue-800 font-medium">
                💡 Hinweis: Diese Szenarien überschreiben die normale Inflationsrate für den
                gewählten Zeitraum. Sie können die Szenarien mit "Variable Renditen" kombinieren,
                um realistische Krisenszenarien zu erstellen.
              </p>
            </div>

            {/* Enable/Disable Radio Group */}
            <div>
              <Label className="text-sm font-medium">Inflationsszenario aktivieren</Label>
              <RadioGroup
                value={isEnabled ? 'enabled' : 'disabled'}
                onValueChange={handleEnabledChange}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enabled" id={enabledRadioId} />
                  <Label htmlFor={enabledRadioId} className="font-normal cursor-pointer">
                    Aktiviert
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disabled" id={disabledRadioId} />
                  <Label htmlFor={disabledRadioId} className="font-normal cursor-pointer">
                    Deaktiviert
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {isEnabled && (
              <>
                {/* Scenario Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Szenario auswählen</Label>
                  <RadioGroup
                    value={selectedScenarioId === 'none' ? undefined : selectedScenarioId}
                    onValueChange={value => handleScenarioChange(value as InflationScenarioId)}
                  >
                    <div className="grid gap-3">
                      {availableScenarios.map((scenario) => {
                        const scenarioRadioId = generateFormId('inflation-scenario', `scenario-${scenario.id}`)

                        return (
                          <div
                            key={scenario.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedScenarioId === scenario.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleScenarioChange(scenario.id)}
                          >
                            <div className="flex items-start space-x-2">
                              <RadioGroupItem
                                value={scenario.id}
                                id={scenarioRadioId}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <Label htmlFor={scenarioRadioId} className="font-medium cursor-pointer">
                                  {scenario.name}
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {scenario.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </RadioGroup>
                </div>

                {/* Year Selection */}
                {selectedScenario && (
                  <div>
                    <Label htmlFor={scenarioYearSliderId} className="text-sm font-medium">
                      Startyear des Szenarios:
                      {' '}
                      {scenarioYear}
                    </Label>
                    <Slider
                      id={scenarioYearSliderId}
                      value={[scenarioYear]}
                      onValueChange={([value]) => handleYearChange(value)}
                      min={simulationStartYear}
                      max={simulationStartYear + 30}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{simulationStartYear}</span>
                      <span>{simulationStartYear + 30}</span>
                    </div>
                  </div>
                )}

                {/* Scenario Details */}
                {selectedScenario && renderScenarioDetails(selectedScenario)}
              </>
            )}

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h6 className="font-semibold mb-2 text-yellow-900">⚠️ Wichtiger Hinweis</h6>
              <p className="text-sm text-gray-700">
                Inflationsszenarien sind Extremszenarien zur Stresstestung Ihres Portfolios.
                Sie sollten nicht als Vorhersage der tatsächlichen Inflationsentwicklung verstanden werden,
                sondern als Werkzeug zur Bewertung der Robustheit Ihrer Finanzplanung unter verschiedenen
                wirtschaftlichen Bedingungen.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default InflationScenarioConfiguration
