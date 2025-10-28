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

// All sub-components remain the same...

const InformationPanel = () => (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h5 className="font-semibold text-blue-900 mb-2">ℹ️ Was sind Inflationsszenarien?</h5>
    <p className="text-sm text-gray-700 mb-2">
      Inflationsszenarien helfen Ihnen, die Auswirkungen unterschiedlicher Inflationsentwicklungen auf Ihr Portfolio zu
      verstehen. Sie können Hyperinflation (anhaltend hohe Inflation), Deflation (fallende Preise) oder Stagflation
      (hohe Inflation bei schwachem Wachstum) simulieren.
    </p>
    <p className="text-sm text-blue-800 font-medium">
      💡 Hinweis: Diese Szenarien überschreiben die normale Inflationsrate für den gewählten Zeitraum. Sie können die
      Szenarien mit "Variable Renditen" kombinieren, um realistische Krisenszenarien zu erstellen.
    </p>
  </div>
)

const EnableDisableRadioGroup = ({
  isEnabled,
  onEnabledChange,
  enabledRadioId,
  disabledRadioId,
}: {
  isEnabled: boolean
  onEnabledChange: (value: string) => void
  enabledRadioId: string
  disabledRadioId: string
}) => (
  <div>
    <Label className="text-sm font-medium">Inflationsszenario aktivieren</Label>
    <RadioGroup
      value={isEnabled ? 'enabled' : 'disabled'}
      onValueChange={onEnabledChange}
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
)

const ScenarioSelection = ({
  availableScenarios,
  selectedScenarioId,
  onScenarioChange,
}: {
  availableScenarios: InflationScenario[]
  selectedScenarioId: InflationScenarioId | 'none'
  onScenarioChange: (scenarioId: InflationScenarioId) => void
}) => (
  <div>
    <Label className="text-sm font-medium mb-2 block">Szenario auswählen</Label>
    <RadioGroup
      value={selectedScenarioId === 'none' ? undefined : selectedScenarioId}
      onValueChange={value => onScenarioChange(value as InflationScenarioId)}
    >
      <div className="grid gap-3">
        {availableScenarios.map((scenario: InflationScenario) => {
          const scenarioRadioId = generateFormId('inflation-scenario', `scenario-${scenario.id}`)
          return (
            <div
              key={scenario.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedScenarioId === scenario.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onScenarioChange(scenario.id)}
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value={scenario.id} id={scenarioRadioId} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={scenarioRadioId} className="font-medium cursor-pointer">
                    {scenario.name}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </RadioGroup>
  </div>
)

const WarningPanel = () => (
  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <h6 className="font-semibold mb-2 text-yellow-900">⚠️ Wichtiger Hinweis</h6>
    <p className="text-sm text-gray-700">
      Inflationsszenarien sind Extremszenarien zur Stresstestung Ihres Portfolios. Sie sollten nicht als Vorhersage der
      tatsächlichen Inflationsentwicklung verstanden werden, sondern als Werkzeug zur Bewertung der Robustheit Ihrer
      Finanzplanung unter verschiedenen wirtschaftlichen Bedingungen.
    </p>
  </div>
)

const formatPercent = (value: number) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(1)}%`
}

const SCENARIO_COLORS: Record<string, { bg: string; text: string }> = {
  hyperinflation: { bg: 'bg-red-50 border-red-200', text: 'text-red-900' },
  deflation: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900' },
}
const DEFAULT_COLORS = { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-900' }

const ScenarioDescription = ({ scenario }: { scenario: InflationScenario }) => (
  <>
    <p>
      <strong>Beschreibung:</strong> {scenario.description}
    </p>
    <p>
      <strong>Dauer:</strong> {scenario.duration} {scenario.duration === 1 ? 'Jahr' : 'Jahre'}
    </p>
  </>
)

const InflationRates = ({ scenario }: { scenario: InflationScenario }) => {
  const years = Object.keys(scenario.yearlyInflationRates).map(Number).sort((a, b) => a - b)
  return (
    <div>
      <strong>Jährliche Inflationsraten:</strong>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {years.map(yearOffset => {
          const inflationRate = scenario.yearlyInflationRates[yearOffset]
          return (
            <div key={yearOffset} className="text-xs">
              Jahr {yearOffset + 1}: {formatPercent(inflationRate ?? 0)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ReturnModifiers = ({ scenario }: { scenario: InflationScenario }) => {
  if (!scenario.yearlyReturnModifiers) return null
  return (
    <div>
      <strong>Rendite-Anpassungen (Stagflation):</strong>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {Object.entries(scenario.yearlyReturnModifiers).map(([yearOffset, modifier]) => (
          <div key={yearOffset} className="text-xs">
            Jahr {Number(yearOffset) + 1}: {formatPercent(modifier as number)} Rendite
          </div>
        ))}
      </div>
    </div>
  )
}

const InflationImpact = ({
  scenario,
  cumulativeInflation,
  averageInflation,
  purchasingPowerImpact,
}: {
  scenario: InflationScenario
  cumulativeInflation: number | null
  averageInflation: number | null
  purchasingPowerImpact: number | null
}) => (
  <>
    {cumulativeInflation !== null && (
      <p>
        <strong>Kumulative Inflation:</strong> {formatPercent(cumulativeInflation)}
      </p>
    )}
    {averageInflation !== null && (
      <p>
        <strong>Durchschnittliche jährliche Inflation:</strong> {formatPercent(averageInflation)}
      </p>
    )}
    {purchasingPowerImpact !== null && (
      <p>
        <strong>Kaufkraftverlust:</strong> 100.000 € haben nach {scenario.duration} Jahren eine reale Kaufkraft von ca.{' '}
        {purchasingPowerImpact.toLocaleString('de-DE', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}{' '}
        €
      </p>
    )}
  </>
)

interface ScenarioDetailsProps {
  scenario: InflationScenario
  cumulativeInflation: number | null
  averageInflation: number | null
  purchasingPowerImpact: number | null
}

const ScenarioDetails = ({
  scenario,
  cumulativeInflation,
  averageInflation,
  purchasingPowerImpact,
}: ScenarioDetailsProps) => {
  const colors = SCENARIO_COLORS[scenario.id] || DEFAULT_COLORS
  return (
    <div className={`mt-4 p-4 ${colors.bg} border rounded-lg`}>
      <h5 className={`font-semibold ${colors.text} mb-2`}>📊 Szenario-Details</h5>
      <div className="space-y-2 text-sm">
        <ScenarioDescription scenario={scenario} />
        <InflationRates scenario={scenario} />
        <ReturnModifiers scenario={scenario} />
        <InflationImpact
          scenario={scenario}
          cumulativeInflation={cumulativeInflation}
          averageInflation={averageInflation}
          purchasingPowerImpact={purchasingPowerImpact}
        />
      </div>
    </div>
  )
}

const ScenarioYearSlider = ({
  scenarioYear,
  onYearChange,
  simulationStartYear,
  scenarioYearSliderId,
}: {
  scenarioYear: number
  onYearChange: (year: number) => void
  simulationStartYear: number
  scenarioYearSliderId: string
}) => (
  <div>
    <Label htmlFor={scenarioYearSliderId} className="text-sm font-medium">
      Startjahr des Szenarios: {scenarioYear}
    </Label>
    <Slider
      id={scenarioYearSliderId}
      value={[scenarioYear]}
      onValueChange={([value]) => onYearChange(value)}
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
)

interface ScenarioControlsProps {
  availableScenarios: InflationScenario[]
  selectedScenarioId: InflationScenarioId | 'none'
  onScenarioChange: (scenarioId: InflationScenarioId) => void
  selectedScenario: InflationScenario | null
  scenarioYearSliderId: string
  scenarioYear: number
  onYearChange: (year: number) => void
  simulationStartYear: number
  cumulativeInflation: number | null
  averageInflation: number | null
  purchasingPowerImpact: number | null
}

const ScenarioControls = ({
  availableScenarios,
  selectedScenarioId,
  onScenarioChange,
  selectedScenario,
  scenarioYearSliderId,
  scenarioYear,
  onYearChange,
  simulationStartYear,
  cumulativeInflation,
  averageInflation,
  purchasingPowerImpact,
}: ScenarioControlsProps) => (
  <>
    <ScenarioSelection
      availableScenarios={availableScenarios}
      selectedScenarioId={selectedScenarioId}
      onScenarioChange={onScenarioChange}
    />
    {selectedScenario && (
      <ScenarioYearSlider
        scenarioYear={scenarioYear}
        onYearChange={onYearChange}
        simulationStartYear={simulationStartYear}
        scenarioYearSliderId={scenarioYearSliderId}
      />
    )}
    {selectedScenario && (
      <ScenarioDetails
        scenario={selectedScenario}
        cumulativeInflation={cumulativeInflation}
        averageInflation={averageInflation}
        purchasingPowerImpact={purchasingPowerImpact}
      />
    )}
  </>
)

interface InflationScenarioConfigurationProps {
  onScenarioChange?: (
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string,
  ) => void
  simulationStartYear: number
}

const useInflationScenarioState = (simulationStartYear: number) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState<InflationScenarioId | 'none'>('none')
  const [scenarioYear, setScenarioYear] = useState(simulationStartYear + 5)
  const availableScenarios = useMemo(() => getAvailableInflationScenarios(), [])
  const selectedScenario = useMemo(
    () => (selectedScenarioId === 'none' ? null : availableScenarios.find(s => s.id === selectedScenarioId) || null),
    [selectedScenarioId, availableScenarios],
  )
  return {
    isEnabled,
    setIsEnabled,
    selectedScenarioId,
    setSelectedScenarioId,
    scenarioYear,
    setScenarioYear,
    availableScenarios,
    selectedScenario,
  }
}

const useInflationCalculations = (selectedScenario: InflationScenario | null) => {
  const cumulativeInflation = useMemo(
    () => (selectedScenario ? calculateCumulativeInflation(selectedScenario) : null),
    [selectedScenario],
  )
  const averageInflation = useMemo(
    () => (selectedScenario ? calculateAverageInflation(selectedScenario) : null),
    [selectedScenario],
  )
  const purchasingPowerImpact = useMemo(
    () => (selectedScenario ? calculatePurchasingPowerImpact(selectedScenario, 100000) : null),
    [selectedScenario],
  )
  return { cumulativeInflation, averageInflation, purchasingPowerImpact }
}

const createScenarioHandlers = (
  state: ReturnType<typeof useInflationScenarioState>,
  onScenarioChange: InflationScenarioConfigurationProps['onScenarioChange'],
) => {
  const handleEnabledChange = (value: string) => {
    const enabled = value === 'enabled'
    state.setIsEnabled(enabled)
    if (!enabled) {
      onScenarioChange?.(null, null, '')
    } else if (state.selectedScenario) {
      const inflationRates = applyInflationScenario(state.scenarioYear, state.selectedScenario)
      const returnModifiers = applyReturnModifiers(state.scenarioYear, state.selectedScenario)
      onScenarioChange?.(inflationRates, returnModifiers, state.selectedScenario.name)
    }
  }

  const handleScenarioChange = (scenarioId: InflationScenarioId) => {
    state.setSelectedScenarioId(scenarioId)
    const scenario = state.availableScenarios.find(s => s.id === scenarioId)
    if (scenario && state.isEnabled) {
      const inflationRates = applyInflationScenario(state.scenarioYear, scenario)
      const returnModifiers = applyReturnModifiers(state.scenarioYear, scenario)
      onScenarioChange?.(inflationRates, returnModifiers, scenario.name)
    }
  }

  const handleYearChange = (year: number) => {
    state.setScenarioYear(year)
    if (state.selectedScenario && state.isEnabled) {
      const inflationRates = applyInflationScenario(year, state.selectedScenario)
      const returnModifiers = applyReturnModifiers(year, state.selectedScenario)
      onScenarioChange?.(inflationRates, returnModifiers, state.selectedScenario.name)
    }
  }
  return { handleEnabledChange, handleScenarioChange, handleYearChange }
}

const InflationScenarioConfiguration = ({
  onScenarioChange,
  simulationStartYear,
}: InflationScenarioConfigurationProps) => {
  const state = useInflationScenarioState(simulationStartYear)
  const { cumulativeInflation, averageInflation, purchasingPowerImpact } = useInflationCalculations(state.selectedScenario)
  const { handleEnabledChange, handleScenarioChange, handleYearChange } = createScenarioHandlers(state, onScenarioChange)
  const enabledRadioId = useMemo(() => generateFormId('inflation-scenario', 'enabled'), [])
  const disabledRadioId = useMemo(() => generateFormId('inflation-scenario', 'disabled'), [])
  const scenarioYearSliderId = useMemo(() => generateFormId('inflation-scenario', 'year'), [])

  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">🌡️ Inflationsszenarien</CardTitle>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <InformationPanel />
            <EnableDisableRadioGroup
              isEnabled={state.isEnabled}
              onEnabledChange={handleEnabledChange}
              enabledRadioId={enabledRadioId}
              disabledRadioId={disabledRadioId}
            />
            {state.isEnabled && (
              <ScenarioControls
                availableScenarios={state.availableScenarios}
                selectedScenarioId={state.selectedScenarioId}
                onScenarioChange={handleScenarioChange}
                selectedScenario={state.selectedScenario}
                scenarioYearSliderId={scenarioYearSliderId}
                scenarioYear={state.scenarioYear}
                onYearChange={handleYearChange}
                simulationStartYear={simulationStartYear}
                cumulativeInflation={cumulativeInflation}
                averageInflation={averageInflation}
                purchasingPowerImpact={purchasingPowerImpact}
              />
            )}
            <WarningPanel />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default InflationScenarioConfiguration
